import type { CreateCommentInput } from "../interface";

export function parseCommentInput(value: unknown): CreateCommentInput {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }

  const userName =
    typeof value.userName === "string" ? value.userName.trim() : "";
  const content = typeof value.content === "string" ? value.content.trim() : "";

  if (userName.length < 2 || userName.length > 30) {
    throw new TypeError("userName 长度必须在 2 到 30 个字符之间");
  }
  if (content.length < 2 || content.length > 1000) {
    throw new TypeError("content 长度必须在 2 到 1000 个字符之间");
  }

  return { userName, content };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
