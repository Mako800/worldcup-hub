import { Inject, Provide } from "@midwayjs/core";
import { TeamService } from "./team.service";
import { CreatePredictionInput, Prediction, UpdatePredictionInput } from "../interface";

type PredictionRow = {
  id: number;
  match_id: number;
  user_name: string;
  home_score: number;
  away_score: number;
  created_at: string;
  updated_at: string;
};

type MatchStatusRow = {
  status: string;
  match_date: string;
};

@Provide()
export class PredictionService {
  @Inject()
  teamService: TeamService;

  private get db() {
    return this.teamService.database;
  }

  create(input: CreatePredictionInput): Prediction {
    // Check match exists and hasn't started
    const match = this.db
      .prepare("SELECT status, match_date FROM matches WHERE id = ?")
      .get(input.matchId) as MatchStatusRow | undefined;

    if (!match) {
      throw new Error("比赛不存在");
    }
    if (match.status !== "scheduled") {
      throw new Error("比赛已开始或已结束，无法预测");
    }

    // Try insert, handle unique constraint violation
    try {
      const result = this.db
        .prepare(
          "INSERT INTO predictions (match_id, user_name, home_score, away_score) VALUES (?, ?, ?, ?)",
        )
        .run(input.matchId, input.userName, input.homeScore, input.awayScore);

      const row = this.db
        .prepare("SELECT * FROM predictions WHERE id = ?")
        .get(result.lastInsertRowid) as PredictionRow;
      return mapPrediction(row);
    } catch (e) {
      if (e instanceof Error && e.message.includes("UNIQUE constraint failed")) {
        throw new Error("你已经对该比赛做出过预测，无法重复提交");
      }
      throw e;
    }
  }

  update(id: number, input: UpdatePredictionInput): Prediction {
    const existing = this.db
      .prepare("SELECT * FROM predictions WHERE id = ?")
      .get(id) as PredictionRow | undefined;

    if (!existing) {
      throw new Error("预测记录不存在");
    }

    // Verify ownership: only the creator can update their prediction
    if (existing.user_name !== input.userName) {
      throw new Error("无权修改该预测记录");
    }

    // Check match hasn't started
    const match = this.db
      .prepare("SELECT status FROM matches WHERE id = ?")
      .get(existing.match_id) as MatchStatusRow | undefined;

    if (!match || match.status !== "scheduled") {
      throw new Error("比赛已开始或已结束，无法修改预测");
    }

    this.db
      .prepare(
        "UPDATE predictions SET home_score = ?, away_score = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      )
      .run(input.homeScore, input.awayScore, id);

    const row = this.db
      .prepare("SELECT * FROM predictions WHERE id = ?")
      .get(id) as PredictionRow;
    return mapPrediction(row);
  }

  listByMatch(matchId: number): Prediction[] {
    const rows = this.db
      .prepare("SELECT * FROM predictions WHERE match_id = ? ORDER BY created_at DESC")
      .all(matchId) as PredictionRow[];
    return rows.map(mapPrediction);
  }

  listByUser(userName: string): Prediction[] {
    const rows = this.db
      .prepare("SELECT * FROM predictions WHERE user_name = ? ORDER BY created_at DESC")
      .all(userName) as PredictionRow[];
    return rows.map(mapPrediction);
  }
}

function mapPrediction(row: PredictionRow): Prediction {
  return {
    id: row.id,
    matchId: row.match_id,
    userName: row.user_name,
    homeScore: row.home_score,
    awayScore: row.away_score,
    createdAt: new Date(`${row.created_at.replace(" ", "T")}Z`).toISOString(),
    updatedAt: new Date(`${row.updated_at.replace(" ", "T")}Z`).toISOString(),
  };
}
