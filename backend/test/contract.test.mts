import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { load } from "js-yaml";

const contractPath = resolve(process.cwd(), "../contracts/openapi.yaml");
const doc = load(readFileSync(contractPath, "utf8")) as any;

// ===== Contract Structure =====

test("OpenAPI contract is valid 3.1.0", () => {
  assert.equal(doc.openapi, "3.1.0");
  assert.ok(doc.info.title.includes("World Cup"));
  assert.ok(doc.paths);
  assert.ok(doc.components);
  assert.ok(doc.components.schemas);
});

// ===== Required API Endpoints =====

const REQUIRED_PATHS = [
  "/api/health",
  "/api/teams",
  "/api/teams/{id}",
  "/api/matches",
  "/api/matches/upcoming",
  "/api/matches/{id}",
  "/api/standings",
  "/api/predictions",
  "/api/predictions/{id}",
  "/api/matches/{matchId}/comments",
  "/api/agent/chat",
  "/api/agent/suggestions",
];

for (const p of REQUIRED_PATHS) {
  test(`Contract defines ${p}`, () => {
    assert.ok(doc.paths[p], `Missing path: ${p}`);
  });
}

// ===== Required Schemas =====

const REQUIRED_SCHEMAS = [
  "Health", "Team", "MatchWithTeams", "Standing",
  "Prediction", "CreatePrediction", "UpdatePrediction",
  "Comment", "CreateComment",
  "AgentRequest", "AgentResponse", "Error",
];

for (const s of REQUIRED_SCHEMAS) {
  test(`Contract defines schema ${s}`, () => {
    assert.ok(doc.components.schemas[s], `Missing schema: ${s}`);
  });
}

// ===== Health Endpoint =====

test("GET /api/health returns 200 with Health schema", () => {
  const op = doc.paths["/api/health"].get;
  assert.ok(op.responses["200"]);
  const schema = op.responses["200"].content["application/json"].schema;
  assert.equal(schema.$ref, "#/components/schemas/Health");
});

// ===== Team Schema =====

test("Team schema has required fields", () => {
  const team = doc.components.schemas.Team;
  assert.ok(team.required.includes("id"));
  assert.ok(team.required.includes("name"));
  assert.ok(team.required.includes("nameZh"));
  assert.ok(team.required.includes("shortName"));
  assert.ok(team.required.includes("stadium"));
  assert.ok(team.required.includes("founded"));
  assert.ok(team.required.includes("logoColor"));
});

// ===== Match Schema =====

test("MatchWithTeams schema has required fields", () => {
  const m = doc.components.schemas.MatchWithTeams;
  assert.ok(m.required.includes("homeTeam"));
  assert.ok(m.required.includes("awayTeam"));
  assert.ok(m.required.includes("status"));
  assert.ok(m.properties.status.enum.includes("scheduled"));
  assert.ok(m.properties.status.enum.includes("live"));
  assert.ok(m.properties.status.enum.includes("finished"));
  assert.ok(m.properties.homeScore.nullable);
  assert.ok(m.properties.awayScore.nullable);
});

// ===== Standing Schema =====

test("Standing schema has all ranking fields", () => {
  const s = doc.components.schemas.Standing;
  assert.ok(s.required.includes("points"));
  assert.ok(s.required.includes("goalDifference"));
  assert.ok(s.required.includes("goalsFor"));
  assert.ok(s.required.includes("goalsAgainst"));
  assert.ok(s.required.includes("wins"));
  assert.ok(s.required.includes("draws"));
  assert.ok(s.required.includes("losses"));
  assert.ok(s.required.includes("played"));
});

// ===== Prediction Schema =====

test("CreatePrediction schema enforces score range 0-20", () => {
  const p = doc.components.schemas.CreatePrediction;
  assert.equal(p.properties.homeScore.minimum, 0);
  assert.equal(p.properties.homeScore.maximum, 20);
  assert.equal(p.properties.awayScore.minimum, 0);
  assert.equal(p.properties.awayScore.maximum, 20);
  assert.equal(p.properties.userName.minLength, 2);
  assert.equal(p.properties.userName.maxLength, 30);
  assert.equal(p.additionalProperties, false);
});

// ===== Error Response =====

test("Error schema has error and message fields", () => {
  const e = doc.components.schemas.Error;
  assert.ok(e.required.includes("error"));
  assert.ok(e.required.includes("message"));
});

// ===== Error Responses Applied =====

test("POST /api/predictions returns 409 for duplicate", () => {
  const op = doc.paths["/api/predictions"].post;
  assert.ok(op.responses["409"]);
  assert.equal(op.responses["409"].content["application/json"].schema.$ref, "#/components/schemas/Error");
});

test("POST /api/predictions returns 400 for invalid input", () => {
  const op = doc.paths["/api/predictions"].post;
  assert.ok(op.responses["400"]);
});

test("PATCH /api/predictions/{id} returns 404 for not found", () => {
  const op = doc.paths["/api/predictions/{id}"].patch;
  assert.ok(op.responses["404"]);
});

// ===== Agent Endpoints =====

test("POST /api/agent/chat requires message and userName", () => {
  const req = doc.components.schemas.AgentRequest;
  assert.ok(req.required.includes("message"));
  assert.ok(req.required.includes("userName"));
  assert.equal(req.properties.message.minLength, 1);
  assert.equal(req.properties.message.maxLength, 500);
});

test("AgentResponse has reply and intent fields", () => {
  const r = doc.components.schemas.AgentResponse;
  assert.ok(r.required.includes("reply"));
  assert.ok(r.required.includes("intent"));
});

// ===== Comment Endpoints =====

test("POST /api/matches/{matchId}/comments returns 400 for non-finished match", () => {
  const op = doc.paths["/api/matches/{matchId}/comments"].post;
  assert.ok(op.responses["400"]);
});

test("CreateComment schema validates content length", () => {
  const c = doc.components.schemas.CreateComment;
  assert.equal(c.properties.content.minLength, 2);
  assert.equal(c.properties.content.maxLength, 1000);
});

// ===== Matchday Range =====

test("Match matchday filter range is 1-7 (World Cup stages)", () => {
  const op = doc.paths["/api/matches"].get;
  const matchday = op.parameters.find((p: any) => p.name === "matchday");
  assert.equal(matchday.schema.minimum, 1);
  assert.equal(matchday.schema.maximum, 7);
});
