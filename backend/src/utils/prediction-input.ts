import type {
  CreatePredictionInput,
  UpdatePredictionInput,
} from "../interface";

export function parsePredictionInput(value: unknown): CreatePredictionInput {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }

  const matchId = toInteger(value.matchId, "matchId");
  const userName = toString(value.userName, "userName").trim();
  const homeScore = toInteger(value.homeScore, "homeScore");
  const awayScore = toInteger(value.awayScore, "awayScore");

  if (userName.length < 2 || userName.length > 30) {
    throw new TypeError("userName 长度必须在 2 到 30 个字符之间");
  }
  if (homeScore < 0 || homeScore > 20) {
    throw new TypeError("homeScore 必须在 0 到 20 之间");
  }
  if (awayScore < 0 || awayScore > 20) {
    throw new TypeError("awayScore 必须在 0 到 20 之间");
  }

  return { matchId, userName, homeScore, awayScore };
}

export function parseUpdatePredictionInput(
  value: unknown,
): UpdatePredictionInput {
  if (!isRecord(value)) {
    throw new TypeError("请求体必须是 JSON 对象");
  }

  const userName = toString(value.userName, "userName").trim();
  const homeScore = toInteger(value.homeScore, "homeScore");
  const awayScore = toInteger(value.awayScore, "awayScore");

  if (userName.length < 2 || userName.length > 30) {
    throw new TypeError("userName 长度必须在 2 到 30 个字符之间");
  }
  if (homeScore < 0 || homeScore > 20) {
    throw new TypeError("homeScore 必须在 0 到 20 之间");
  }
  if (awayScore < 0 || awayScore > 20) {
    throw new TypeError("awayScore 必须在 0 到 20 之间");
  }

  return { userName, homeScore, awayScore };
}

function toInteger(value: unknown, field: string): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value)
  )
    return value;
  if (typeof value === "string" && /^\d+$/.test(value)) return Number(value);
  throw new TypeError(`${field} 必须是整数`);
}

function toString(value: unknown, field: string): string {
  if (typeof value === "string") return value;
  throw new TypeError(`${field} 必须是字符串`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
