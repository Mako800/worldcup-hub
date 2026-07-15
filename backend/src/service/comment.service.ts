import { Inject, Provide } from "@midwayjs/core";
import { TeamService } from "./team.service";
import { Comment, CreateCommentInput } from "../interface";

type CommentRow = {
  id: number;
  match_id: number;
  user_name: string;
  content: string;
  created_at: string;
};

@Provide()
export class CommentService {
  @Inject()
  teamService: TeamService;

  private get db() {
    return this.teamService.database;
  }

  create(matchId: number, input: CreateCommentInput): Comment {
    const match = this.db
      .prepare("SELECT status FROM matches WHERE id = ?")
      .get(matchId) as { status: string } | undefined;

    if (!match) {
      throw new Error("比赛不存在");
    }
    if (match.status !== "finished") {
      throw new Error("只有已结束的比赛才能发表评论");
    }

    const result = this.db
      .prepare(
        "INSERT INTO comments (match_id, user_name, content) VALUES (?, ?, ?)",
      )
      .run(matchId, input.userName, input.content);

    const row = this.db
      .prepare("SELECT * FROM comments WHERE id = ?")
      .get(result.lastInsertRowid) as CommentRow;
    return mapComment(row);
  }

  listByMatch(matchId: number): Comment[] {
    const rows = this.db
      .prepare(
        "SELECT * FROM comments WHERE match_id = ? ORDER BY created_at DESC",
      )
      .all(matchId) as CommentRow[];
    return rows.map(mapComment);
  }
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    matchId: row.match_id,
    userName: row.user_name,
    content: row.content,
    createdAt: new Date(`${row.created_at.replace(" ", "T")}Z`).toISOString(),
  };
}
