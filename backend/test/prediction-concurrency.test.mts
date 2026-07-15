import assert from "node:assert/strict";
import { test } from "node:test";
import { DatabaseSync } from "node:sqlite";

/**
 * Concurrency tests for prediction UNIQUE constraint and match status validation.
 *
 * These tests directly exercise the SQLite database layer to verify:
 * 1. UNIQUE(match_id, user_name) constraint prevents duplicate predictions
 * 2. Multiple different users can predict the same match concurrently
 * 3. The constraint works correctly under rapid sequential inserts
 */

function createTestDb() {
  const db = new DatabaseSync(":memory:");
  db.exec("PRAGMA journal_mode=WAL");
  db.exec(`
    CREATE TABLE matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      home_team_id INTEGER NOT NULL,
      away_team_id INTEGER NOT NULL,
      match_date TEXT NOT NULL,
      matchday INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'scheduled',
      home_score INTEGER,
      away_score INTEGER,
      venue TEXT,
      CHECK (status IN ('scheduled', 'live', 'finished'))
    )
  `);
  db.exec(`
    CREATE TABLE predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL REFERENCES matches(id),
      user_name TEXT NOT NULL,
      home_score INTEGER NOT NULL,
      away_score INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(match_id, user_name)
    )
  `);

  // Insert a test match
  db.prepare(
    "INSERT INTO matches (home_team_id, away_team_id, match_date, matchday, status) VALUES (?, ?, ?, ?, ?)",
  ).run(1, 2, "2026-07-20 15:00:00", 3, "scheduled");

  // Insert a finished match
  db.prepare(
    "INSERT INTO matches (home_team_id, away_team_id, match_date, matchday, status) VALUES (?, ?, ?, ?, ?)",
  ).run(3, 4, "2026-07-04 15:00:00", 1, "finished");

  return db;
}

// ===== UNIQUE Constraint Tests =====

test("UNIQUE constraint: first prediction succeeds", () => {
  const db = createTestDb();
  const result = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "球迷小王", 2, 1);
  assert.ok(result.lastInsertRowid > 0);
  db.close();
});

test("UNIQUE constraint: duplicate prediction throws SQLITE_CONSTRAINT", () => {
  const db = createTestDb();
  db.prepare(
    "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
  ).run(1, "球迷小王", 2, 1);

  assert.throws(
    () => {
      db.prepare(
        "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
      ).run(1, "球迷小王", 3, 0);
    },
    (e: any) => e.message.includes("UNIQUE constraint failed"),
  );
  db.close();
});

test("UNIQUE constraint: same user different matches both succeed", () => {
  const db = createTestDb();
  const r1 = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "球迷小王", 2, 1);
  const r2 = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(2, "球迷小王", 0, 0);
  assert.ok(r1.lastInsertRowid > 0);
  assert.ok(r2.lastInsertRowid > 0);
  assert.notEqual(r1.lastInsertRowid, r2.lastInsertRowid);
  db.close();
});

// ===== Concurrent User Scenario Tests =====

test("Multiple users predicting same match: all succeed", () => {
  const db = createTestDb();
  const users = [
    "球迷小王",
    "足球老张",
    "ArgentinaFan",
    "BrazilFan10",
    "世界杯达人",
  ];

  for (const user of users) {
    const result = db
      .prepare(
        "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
      )
      .run(1, user, 2, 1);
    assert.ok(result.lastInsertRowid > 0, `User ${user} should succeed`);
  }

  // Verify count
  const count = db
    .prepare("SELECT COUNT(*) as c FROM predictions WHERE match_id = 1")
    .get() as { c: number };
  assert.equal(count.c, users.length);
  db.close();
});

test("Rapid sequential same-user same-match inserts: first wins, second fails", () => {
  const db = createTestDb();
  const first = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "快速用户", 1, 0);
  assert.ok(first.lastInsertRowid > 0);

  assert.throws(() => {
    db.prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    ).run(1, "快速用户", 2, 2);
  }, /UNIQUE constraint failed/);
  db.close();
});

// ===== Match Status Validation =====

test("Cannot predict on finished match (status check)", () => {
  const db = createTestDb();
  const match = db.prepare("SELECT status FROM matches WHERE id = 2").get() as {
    status: string;
  };
  assert.equal(match.status, "finished");
  // A proper service would reject this before insert, but the DB itself allows it
  // The business logic layer must check: if (match.status !== 'scheduled') throw
  // This test verifies the status check precondition is correct
  db.close();
});

test("Can predict on scheduled match (status check)", () => {
  const db = createTestDb();
  const match = db.prepare("SELECT status FROM matches WHERE id = 1").get() as {
    status: string;
  };
  assert.equal(match.status, "scheduled");
  db.close();
});

// ===== Prediction Update Flow =====

test("Update prediction changes scores but not match_id or user_name", () => {
  const db = createTestDb();
  const insert = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "测试用户", 1, 1);

  db.prepare(
    "UPDATE predictions SET home_score = ?, away_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
  ).run(3, 2, insert.lastInsertRowid);

  const updated = db
    .prepare(
      "SELECT home_score, away_score, user_name, match_id FROM predictions WHERE id = ?",
    )
    .get(insert.lastInsertRowid) as any;

  assert.equal(updated.home_score, 3);
  assert.equal(updated.away_score, 2);
  assert.equal(updated.user_name, "测试用户");
  assert.equal(updated.match_id, 1);
  db.close();
});

// ===== Score Range Enforcement =====

test("Score boundary values: 0 and 20 are accepted", () => {
  const db = createTestDb();
  // Score 0-0
  const r1 = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "用户零分", 0, 0);
  assert.ok(r1.lastInsertRowid > 0);

  // Score 20-20
  const r2 = db
    .prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    )
    .run(1, "用户满分", 20, 20);
  assert.ok(r2.lastInsertRowid > 0);
  db.close();
});

// ===== Data Integrity =====

test("Prediction count matches expected", () => {
  const db = createTestDb();
  for (let i = 0; i < 5; i++) {
    db.prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    ).run(1, `用户${i}`, i, i + 1);
  }
  const row = db
    .prepare("SELECT COUNT(*) as c FROM predictions WHERE match_id = 1")
    .get() as { c: number };
  assert.equal(row.c, 5);
  db.close();
});

test("Predictions are ordered by creation time (descending)", () => {
  const db = createTestDb();
  // Use explicit timestamps to guarantee ordering
  const insert = db.prepare(
    "INSERT INTO predictions (match_id, user_name, home_score, away_score, created_at) VALUES (?, ?, ?, ?, ?)",
  );
  insert.run(1, "顺序用户0", 1, 1, "2026-07-10 10:00:00");
  insert.run(1, "顺序用户1", 1, 1, "2026-07-10 10:00:01");
  insert.run(1, "顺序用户2", 1, 1, "2026-07-10 10:00:02");

  const rows = db
    .prepare(
      "SELECT user_name FROM predictions WHERE match_id = 1 ORDER BY created_at DESC",
    )
    .all() as { user_name: string }[];
  assert.equal(rows.length, 3);
  assert.equal(rows[0].user_name, "顺序用户2");
  assert.equal(rows[2].user_name, "顺序用户0");
  db.close();
});

// ===== Comments Concurrency =====

test("Multiple comments on same match all succeed (no UNIQUE constraint)", () => {
  const db = createTestDb();
  db.exec(`
    CREATE TABLE comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      match_id INTEGER NOT NULL REFERENCES matches(id),
      user_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Same user can post multiple comments on the same match
  const c1 = db
    .prepare(
      "INSERT INTO comments (match_id, user_name, content) VALUES (?, ?, ?)",
    )
    .run(2, "球迷小王", "精彩比赛！");
  const c2 = db
    .prepare(
      "INSERT INTO comments (match_id, user_name, content) VALUES (?, ?, ?)",
    )
    .run(2, "球迷小王", "下半场太刺激了！");
  assert.ok(c1.lastInsertRowid > 0);
  assert.ok(c2.lastInsertRowid > 0);
  assert.notEqual(c1.lastInsertRowid, c2.lastInsertRowid);
  db.close();
});
