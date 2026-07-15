import { Config, Destroy, Init, Provide } from "@midwayjs/core";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { Team } from "../interface";

type TeamRow = {
  id: number;
  name: string;
  name_zh: string;
  short_name: string;
  stadium: string;
  founded: number;
  logo_color: string;
};

@Provide()
export class TeamService {
  @Config("worldcupDatabase.path")
  databasePath: string;

  database: DatabaseSync;

  @Init()
  async initialize() {
    const absolutePath = resolve(process.cwd(), this.databasePath);
    mkdirSync(dirname(absolutePath), { recursive: true });
    this.database = new DatabaseSync(absolutePath);
    this.database.exec("PRAGMA journal_mode=WAL");
    this.createTables();
    this.seedIfEmpty();
  }

  private createTables() {
    this.database.exec(`
      CREATE TABLE IF NOT EXISTS teams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        name_zh TEXT NOT NULL,
        short_name TEXT NOT NULL UNIQUE,
        stadium TEXT NOT NULL,
        founded INTEGER NOT NULL,
        logo_color TEXT NOT NULL DEFAULT '#15803d',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        home_team_id INTEGER NOT NULL REFERENCES teams(id),
        away_team_id INTEGER NOT NULL REFERENCES teams(id),
        match_date TEXT NOT NULL,
        matchday INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'scheduled',
        home_score INTEGER,
        away_score INTEGER,
        venue TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CHECK (home_team_id != away_team_id),
        CHECK (status IN ('scheduled', 'live', 'finished'))
      )
    `);

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS predictions (
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

    this.database.exec(`
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match_id INTEGER NOT NULL REFERENCES matches(id),
        user_name TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // standings_view: computed from finished matches
    this.database.exec(`
      CREATE VIEW IF NOT EXISTS standings_view AS
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.name_zh as team_name_zh,
        t.short_name as short_name,
        COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score > m.away_score)
                    OR (m.away_team_id = t.id AND m.away_score > m.home_score) THEN 1 END) as wins,
        COUNT(CASE WHEN m.home_score = m.away_score
                    AND (m.home_team_id = t.id OR m.away_team_id = t.id) THEN 1 END) as draws,
        COUNT(CASE WHEN (m.home_team_id = t.id AND m.home_score < m.away_score)
                    OR (m.away_team_id = t.id AND m.away_score < m.home_score) THEN 1 END) as losses,
        COALESCE(SUM(CASE WHEN m.home_team_id = t.id THEN m.home_score
                           WHEN m.away_team_id = t.id THEN m.away_score END), 0) as goals_for,
        COALESCE(SUM(CASE WHEN m.home_team_id = t.id THEN m.away_score
                           WHEN m.away_team_id = t.id THEN m.home_score END), 0) as goals_against,
        COUNT(CASE WHEN m.status = 'finished'
                    AND (m.home_team_id = t.id OR m.away_team_id = t.id) THEN 1 END) as played
      FROM teams t
      LEFT JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id)
        AND m.status = 'finished'
      GROUP BY t.id
      ORDER BY (wins * 3 + draws) DESC, (goals_for - goals_against) DESC, goals_for DESC
    `);
  }

  private seedIfEmpty() {
    const row = this.database
      .prepare("SELECT COUNT(*) AS total FROM teams")
      .get() as { total: number };

    if (row.total > 0) return;

    this.seedTeams();
    this.seedMatches();
  }

  private seedTeams() {
    const insert = this.database.prepare(
      "INSERT INTO teams (name, name_zh, short_name, stadium, founded, logo_color) VALUES (?, ?, ?, ?, ?, ?)",
    );

    // 32 teams for FIFA World Cup 2026
    const teams = [
      // Group A
      ["Argentina", "阿根廷", "ARG", "Estadio Monumental", 1893, "#75aadb"],
      ["Denmark", "丹麦", "DEN", "Parken Stadium", 1889, "#c8102e"],
      ["Nigeria", "尼日利亚", "NGA", "Moshood Abiola Stadium", 1945, "#008753"],
      ["Saudi Arabia", "沙特阿拉伯", "KSA", "King Fahd Stadium", 1956, "#006c35"],
      // Group B
      ["France", "法国", "FRA", "Stade de France", 1904, "#002395"],
      ["Uruguay", "乌拉圭", "URU", "Estadio Centenario", 1900, "#5b9bd5"],
      ["South Korea", "韩国", "KOR", "Seoul World Cup Stadium", 1933, "#c8102e"],
      ["Canada", "加拿大", "CAN", "BMO Field", 1912, "#d52b1e"],
      // Group C
      ["England", "英格兰", "ENG", "Wembley Stadium", 1863, "#cf081f"],
      ["Croatia", "克罗地亚", "CRO", "Stadion Maksimir", 1912, "#ff0000"],
      ["Iran", "伊朗", "IRN", "Azadi Stadium", 1920, "#239f40"],
      ["Ghana", "加纳", "GHA", "Accra Sports Stadium", 1957, "#006b3c"],
      // Group D
      ["Brazil", "巴西", "BRA", "Estádio do Maracanã", 1914, "#009c3b"],
      ["Switzerland", "瑞士", "SUI", "Stade de Suisse", 1895, "#d52b1e"],
      ["Poland", "波兰", "POL", "Stadion Narodowy", 1919, "#dc143c"],
      ["Egypt", "埃及", "EGY", "Cairo International Stadium", 1921, "#c8102e"],
      // Group E
      ["Germany", "德国", "GER", "Allianz Arena", 1900, "#000000"],
      ["Senegal", "塞内加尔", "SEN", "Stade Lat-Dior", 1960, "#00853f"],
      ["Japan", "日本", "JPN", "Tokyo National Stadium", 1921, "#1e3a8a"],
      ["Tunisia", "突尼斯", "TUN", "Stade de Radès", 1957, "#e70013"],
      // Group F
      ["Spain", "西班牙", "ESP", "Estadio Santiago Bernabéu", 1909, "#c8102e"],
      ["Morocco", "摩洛哥", "MAR", "Stade Mohammed V", 1955, "#c1272d"],
      ["Serbia", "塞尔维亚", "SRB", "Stadion Rajko Mitić", 1919, "#c6363c"],
      ["Australia", "澳大利亚", "AUS", "Stadium Australia", 1961, "#00843d"],
      // Group G
      ["Portugal", "葡萄牙", "POR", "Estádio da Luz", 1914, "#900020"],
      ["Italy", "意大利", "ITA", "Stadio Olimpico", 1898, "#0066CC"],
      ["Ecuador", "厄瓜多尔", "ECU", "Estadio Rodrigo Paz", 1925, "#FFDD00"],
      ["United States", "美国", "USA", "AT&T Stadium", 1913, "#002868"],
      // Group H
      ["Netherlands", "荷兰", "NED", "Johan Cruijff Arena", 1889, "#ff6600"],
      ["Belgium", "比利时", "BEL", "King Baudouin Stadium", 1895, "#e20e0e"],
      ["Mexico", "墨西哥", "MEX", "Estadio Azteca", 1927, "#006847"],
      ["Colombia", "哥伦比亚", "COL", "Estadio Metropolitano", 1924, "#FCD116"],
    ];

    for (const t of teams) {
      insert.run(t[0], t[1], t[2], t[3], t[4], t[5]);
    }
  }

  private seedMatches() {
    const count = this.database
      .prepare("SELECT COUNT(*) AS total FROM matches")
      .get() as { total: number };
    if (count.total > 0) return;

    const insert = this.database.prepare(
      "INSERT INTO matches (home_team_id, away_team_id, match_date, matchday, status, home_score, away_score, venue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    );

    // Group structure (team IDs 1-32):
    // A: 1-ARG, 2-DEN, 3-NGA, 4-KSA
    // B: 5-FRA, 6-URU, 7-KOR, 8-CAN
    // C: 9-ENG, 10-CRO, 11-IRN, 12-GHA
    // D: 13-BRA, 14-SUI, 15-POL, 16-EGY
    // E: 17-GER, 18-SEN, 19-JPN, 20-TUN
    // F: 21-ESP, 22-MAR, 23-SRB, 24-AUS
    // G: 25-POR, 26-ITA, 27-ECU, 28-USA
    // H: 29-NED, 30-BEL, 31-MEX, 32-COL

    const groups = [
      [1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12], [13, 14, 15, 16],
      [17, 18, 19, 20], [21, 22, 23, 24], [25, 26, 27, 28], [29, 30, 31, 32],
    ];

    // Group stage round-robin fixtures: each group [1v2, 3v4], [1v3, 2v4], [1v4, 2v3]
    const groupFixtures: [number, number, number][] = [];
    for (const g of groups) {
      groupFixtures.push([1, g[0], g[1]], [1, g[2], g[3]]);  // Round 1
      groupFixtures.push([2, g[0], g[2]], [2, g[1], g[3]]);  // Round 2
      groupFixtures.push([3, g[0], g[3]], [3, g[1], g[2]]);  // Round 3
    }

    // Predefined scores for round 1-2 (finished matches, 32 matches)
    const finishedScores: [number, number][] = [
      // Round 1 (16 matches)
      [3, 1], [1, 0], [2, 0], [1, 1], [2, 1], [0, 0], [1, 0], [2, 2],
      [1, 0], [0, 2], [1, 1], [1, 2], [3, 0], [0, 0], [0, 1], [1, 0],
      // Round 2 (16 matches)
      [2, 0], [0, 1], [2, 2], [3, 1], [1, 1], [0, 2], [2, 0], [1, 0],
      [2, 1], [0, 0], [1, 0], [2, 1], [1, 1], [0, 1], [0, 3], [2, 0],
    ];

    // Insert group stage matches (48 matches total: 32 finished + 16 scheduled)
    for (let i = 0; i < 48; i++) {
      const [round, homeId, awayId] = groupFixtures[i];
      const groupIdx = Math.floor(i / 6);
      const groupLetter = String.fromCharCode(65 + groupIdx); // A-H

      // Match dates: rounds 1-2 in early July 2026, round 3 in late July
      const baseDate = new Date(round === 1 ? "2026-07-04" : round === 2 ? "2026-07-11" : "2026-07-18");
      const dayOffset = (i % 2) * 2 + groupIdx; // spread over days for realism
      const date = new Date(baseDate);
      date.setDate(date.getDate() + dayOffset);
      const dateStr = date.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");

      const venue = `2026世界杯 ${groupLetter}组`;

      if (i < 32) {
        // Rounds 1-2: finished with scores
        const [h, a] = finishedScores[i];
        insert.run(homeId, awayId, dateStr, round, "finished", h, a, venue);
      } else {
        // Round 3: scheduled (no scores)
        insert.run(homeId, awayId, dateStr, round, "scheduled", null, null, venue);
      }
    }

    // Knockout stage (16 matches, matchdays 4-7, all scheduled)
    // Placeholder team pairings based on likely group stage outcomes
    const knockoutFixtures: [number, number, number, string][] = [
      // Round of 16 (matchday 4, 8 matches)
      [4, 1, 6, "2026世界杯 1/8决赛"], [4, 9, 14, "2026世界杯 1/8决赛"],
      [4, 17, 22, "2026世界杯 1/8决赛"], [4, 25, 30, "2026世界杯 1/8决赛"],
      [4, 5, 2, "2026世界杯 1/8决赛"], [4, 13, 10, "2026世界杯 1/8决赛"],
      [4, 21, 18, "2026世界杯 1/8决赛"], [4, 29, 26, "2026世界杯 1/8决赛"],
      // Quarter-finals (matchday 5, 4 matches)
      [5, 1, 9, "2026世界杯 1/4决赛"], [5, 17, 25, "2026世界杯 1/4决赛"],
      [5, 5, 13, "2026世界杯 1/4决赛"], [5, 21, 29, "2026世界杯 1/4决赛"],
      // Semi-finals (matchday 6, 2 matches)
      [6, 1, 17, "2026世界杯 半决赛"], [6, 13, 21, "2026世界杯 半决赛"],
      // Third place + Final (matchday 7, 2 matches)
      [7, 17, 21, "2026世界杯 三四名决赛"], [7, 1, 13, "2026世界杯 决赛"],
    ];

    let koDate = new Date("2026-07-25");
    for (const [md, homeId, awayId, venue] of knockoutFixtures) {
      const dateStr = koDate.toISOString().replace("T", " ").replace(/\.\d{3}Z$/, "");
      insert.run(homeId, awayId, dateStr, md, "scheduled", null, null, venue);
      koDate.setDate(koDate.getDate() + 1);
    }

    // Seed demo predictions and comments
    this.seedDemoPredictions();
    this.seedDemoComments();
  }

  private seedDemoPredictions() {
    const insert = this.database.prepare(
      "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
    );
    const demoUsers = ["球迷小王", "足球老张", "ArgentinaFan", "BrazilFan10", "世界杯达人"];
    const finishedMatches = this.database
      .prepare("SELECT id, home_team_id, away_team_id FROM matches WHERE status = 'finished' LIMIT 15")
      .all() as { id: number; home_team_id: number; away_team_id: number }[];

    for (const match of finishedMatches) {
      const predictors = demoUsers.slice(0, 2 + (match.id % 3));
      for (const user of predictors) {
        const h = Math.floor(Math.random() * 4);
        const a = Math.floor(Math.random() * 3);
        insert.run(match.id, user, h, a);
      }
    }
  }

  private seedDemoComments() {
    const insert = this.database.prepare(
      "INSERT INTO comments (match_id, user_name, content) VALUES (?, ?, ?)",
    );
    const demoComments = [
      "精彩的比赛！主场优势太明显了。",
      "裁判的判罚有些争议，但总体还算公平。",
      "客队下半场表现明显提升，值得肯定。",
      "这场比赛的节奏非常快，双方都打出了高水平。",
      "期待下一轮的较量！",
      "今天的进攻配合太流畅了，赏心悦目。",
      "防守端需要加强，丢了太多不必要的球。",
      "最佳球员当之无愧，全场表现都很出色。",
    ];
    const finishedMatches = this.database
      .prepare("SELECT id FROM matches WHERE status = 'finished' LIMIT 8")
      .all() as { id: number }[];

    for (const match of finishedMatches) {
      const count = 1 + (match.id % 3);
      for (let i = 0; i < count; i++) {
        const content = demoComments[(match.id + i) % demoComments.length];
        const user = ["球迷小王", "足球老张", "世界杯达人"][i % 3];
        insert.run(match.id, user, content);
      }
    }
  }

  list(): Team[] {
    const rows = this.database
      .prepare("SELECT id, name, name_zh, short_name, stadium, founded, logo_color FROM teams ORDER BY name")
      .all() as TeamRow[];
    return rows.map(mapTeam);
  }

  getById(id: number): Team | undefined {
    const row = this.database
      .prepare("SELECT id, name, name_zh, short_name, stadium, founded, logo_color FROM teams WHERE id = ?")
      .get(id) as TeamRow | undefined;
    return row ? mapTeam(row) : undefined;
  }

  getByName(name: string): Team | undefined {
    const row = this.database
      .prepare("SELECT id, name, name_zh, short_name, stadium, founded, logo_color FROM teams WHERE name = ? OR name_zh = ?")
      .get(name, name) as TeamRow | undefined;
    return row ? mapTeam(row) : undefined;
  }

  @Destroy()
  async close() {
    this.database?.close();
  }
}

function mapTeam(row: TeamRow): Team {
  return {
    id: row.id,
    name: row.name,
    nameZh: row.name_zh,
    shortName: row.short_name,
    stadium: row.stadium,
    founded: row.founded,
    logoColor: row.logo_color,
  };
}
