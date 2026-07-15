import assert from "node:assert/strict";
import { test } from "node:test";
import { parsePredictionInput, parseUpdatePredictionInput } from "../src/utils/prediction-input.ts";

test("parsePredictionInput accepts valid input", () => {
  const result = parsePredictionInput({
    matchId: 1,
    userName: "测试用户",
    homeScore: 2,
    awayScore: 1,
  });
  assert.deepEqual(result, { matchId: 1, userName: "测试用户", homeScore: 2, awayScore: 1 });
});

test("parsePredictionInput trims userName", () => {
  const result = parsePredictionInput({
    matchId: 5,
    userName: "  球迷小王  ",
    homeScore: 0,
    awayScore: 0,
  });
  assert.equal(result.userName, "球迷小王");
});

test("parsePredictionInput rejects missing fields", () => {
  assert.throws(
    () => parsePredictionInput({ matchId: 1, userName: "test" }),
    TypeError,
  );
});

test("parsePredictionInput rejects invalid scores", () => {
  assert.throws(
    () => parsePredictionInput({ matchId: 1, userName: "test", homeScore: -1, awayScore: 0 }),
    TypeError,
  );
  assert.throws(
    () => parsePredictionInput({ matchId: 1, userName: "test", homeScore: 0, awayScore: 21 }),
    TypeError,
  );
});

test("parsePredictionInput rejects empty userName", () => {
  assert.throws(
    () => parsePredictionInput({ matchId: 1, userName: "  ", homeScore: 1, awayScore: 1 }),
    TypeError,
  );
});

test("parseUpdatePredictionInput accepts valid update", () => {
  const result = parseUpdatePredictionInput({ userName: "测试用户", homeScore: 3, awayScore: 2 });
  assert.deepEqual(result, { userName: "测试用户", homeScore: 3, awayScore: 2 });
});

test("parseUpdatePredictionInput rejects invalid scores", () => {
  assert.throws(
    () => parseUpdatePredictionInput({ userName: "test", homeScore: 30, awayScore: 0 }),
    TypeError,
  );
  assert.throws(
    () => parseUpdatePredictionInput({ userName: "test", homeScore: "a", awayScore: 0 }),
    TypeError,
  );
});
