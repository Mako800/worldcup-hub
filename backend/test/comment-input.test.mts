import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCommentInput } from "../src/utils/comment-input.ts";

test("parseCommentInput accepts valid comment", () => {
  const result = parseCommentInput({
    userName: "测试用户",
    content: "精彩的比赛！双方都打出了高水平。",
  });
  assert.deepEqual(result, {
    userName: "测试用户",
    content: "精彩的比赛！双方都打出了高水平。",
  });
});

test("parseCommentInput trims whitespace", () => {
  const result = parseCommentInput({
    userName: "  球迷小王  ",
    content: "  好球！  ",
  });
  assert.equal(result.userName, "球迷小王");
  assert.equal(result.content, "好球！");
});

test("parseCommentInput rejects empty userName", () => {
  assert.throws(
    () => parseCommentInput({ userName: "", content: "精彩的比赛" }),
    TypeError,
  );
});

test("parseCommentInput rejects whitespace-only userName", () => {
  assert.throws(
    () => parseCommentInput({ userName: "  ", content: "精彩的比赛" }),
    TypeError,
  );
});

test("parseCommentInput rejects short content (less than 2 chars)", () => {
  assert.throws(
    () => parseCommentInput({ userName: "测试用户", content: "好" }),
    TypeError,
  );
});

test("parseCommentInput rejects content over 1000 chars", () => {
  assert.throws(
    () =>
      parseCommentInput({ userName: "测试用户", content: "a".repeat(1001) }),
    TypeError,
  );
});

test("parseCommentInput accepts boundary content (2 chars)", () => {
  const result = parseCommentInput({ userName: "测试用户", content: "精彩" });
  assert.equal(result.content, "精彩");
});

test("parseCommentInput accepts boundary content (1000 chars)", () => {
  const content = "a".repeat(1000);
  const result = parseCommentInput({ userName: "测试用户", content });
  assert.equal(result.content.length, 1000);
});

test("parseCommentInput rejects non-string content", () => {
  assert.throws(
    () => parseCommentInput({ userName: "test", content: 12345 }),
    TypeError,
  );
});

test("parseCommentInput rejects non-string userName", () => {
  assert.throws(
    () => parseCommentInput({ userName: 123, content: "精彩的比赛" }),
    TypeError,
  );
});

test("parseCommentInput rejects non-object input", () => {
  assert.throws(() => parseCommentInput("not an object"), TypeError);
  assert.throws(() => parseCommentInput(null), TypeError);
  assert.throws(() => parseCommentInput([1, 2, 3]), TypeError);
});

test("parseCommentInput rejects userName over 30 chars", () => {
  assert.throws(
    () =>
      parseCommentInput({ userName: "a".repeat(31), content: "精彩的比赛" }),
    TypeError,
  );
});
