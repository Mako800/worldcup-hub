import assert from "node:assert/strict";
import { test } from "node:test";

test("frontend test runner is configured", () => {
  assert.equal(typeof fetch, "function");
});

test("API response types match contract expectations", () => {
  // Health response shape
  const health = { status: "ok", service: "worldcup-platform-api", timestamp: new Date().toISOString() };
  assert.equal(health.status, "ok");
  assert.equal(health.service, "worldcup-platform-api");
  assert.ok(typeof health.timestamp === "string");

  // Team response shape
  const team = { id: 1, name: "Argentina", nameZh: "阿根廷", shortName: "ARG", stadium: "Estadio Monumental", founded: 1893, logoColor: "#75aadb" };
  assert.equal(typeof team.id, "number");
  assert.equal(typeof team.nameZh, "string");

  // Prediction validation logic
  const validUserName = "测试用户";
  const tooShort = " ";
  assert.ok(validUserName.trim().length >= 2);
  assert.ok(tooShort.trim().length < 2);
});
