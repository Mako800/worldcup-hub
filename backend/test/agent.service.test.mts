import assert from "node:assert/strict";
import { test } from "node:test";
import { parseAgentInput } from "../src/utils/agent-input.ts";

test("parseAgentInput accepts valid message", () => {
  const result = parseAgentInput({
    message: "积分榜排名",
    userName: "测试用户",
  });
  assert.deepEqual(result, { message: "积分榜排名", userName: "测试用户" });
});

test("parseAgentInput trims input", () => {
  const result = parseAgentInput({ message: "  你好  ", userName: "  球迷  " });
  assert.equal(result.message, "你好");
  assert.equal(result.userName, "球迷");
});

test("parseAgentInput rejects empty message", () => {
  assert.throws(
    () => parseAgentInput({ message: "", userName: "test" }),
    TypeError,
  );
});

test("parseAgentInput rejects short userName", () => {
  assert.throws(
    () => parseAgentInput({ message: "hello", userName: "a" }),
    TypeError,
  );
});

test("parseAgentInput rejects message over 500 chars", () => {
  assert.throws(
    () => parseAgentInput({ message: "a".repeat(501), userName: "test" }),
    TypeError,
  );
});
