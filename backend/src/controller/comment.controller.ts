import {
  Body,
  Controller,
  Get,
  httpError,
  Inject,
  Param,
  Post,
} from "@midwayjs/core";
import { CommentService } from "../service/comment.service";
import { parseCommentInput } from "../utils/comment-input";

@Controller("/api")
export class CommentController {
  @Inject()
  commentService: CommentService;

  @Get("/matches/:matchId/comments")
  async listComments(@Param("matchId") matchId: string) {
    const numId = Number(matchId);
    if (!Number.isFinite(numId) || numId < 1) {
      throw new httpError.BadRequestError("无效的比赛 ID");
    }
    return { data: this.commentService.listByMatch(numId) };
  }

  @Post("/matches/:matchId/comments")
  async createComment(@Param("matchId") matchId: string, @Body() body: unknown) {
    const numId = Number(matchId);
    if (!Number.isFinite(numId) || numId < 1) {
      throw new httpError.BadRequestError("无效的比赛 ID");
    }
    try {
      const input = parseCommentInput(body);
      return { data: this.commentService.create(numId, input) };
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "评论数据无效";
      throw new httpError.BadRequestError(message);
    }
  }
}
