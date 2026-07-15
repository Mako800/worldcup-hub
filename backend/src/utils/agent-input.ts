import type { AgentRequest } from "../interface";

export function parseAgentInput(value: unknown): AgentRequest {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }

  const message = typeof value.message === "string" ? value.message.trim() : "";
  const userName =
    typeof value.userName === "string" ? value.userName.trim() : "";

  if (message.length < 1 || message.length > 500) {
    throw new TypeError("message 长度必须在 1 到 500 个字符之间");
  }
  if (userName.length < 2 || userName.length > 30) {
    throw new TypeError("userName 长度必须在 2 到 30 个字符之间");
  }

  return { message, userName };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
