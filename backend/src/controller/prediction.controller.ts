import {
  Body,
  Controller,
  Get,
  httpError,
  Inject,
  Param,
  Patch,
  Post,
  Query,
} from "@midwayjs/core";
import { PredictionService } from "../service/prediction.service";
import { parsePredictionInput, parseUpdatePredictionInput } from "../utils/prediction-input";

@Controller("/api")
export class PredictionController {
  @Inject()
  predictionService: PredictionService;

  @Post("/predictions")
  async createPrediction(@Body() body: unknown) {
    try {
      const input = parsePredictionInput(body);
      const prediction = this.predictionService.create(input);
      return { data: prediction };
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "预测数据无效";
      if (message.includes("已经")) {
        throw new httpError.ConflictError(message);
      }
      throw new httpError.BadRequestError(message);
    }
  }

  @Get("/predictions")
  async listPredictions(
    @Query("matchId") matchId?: string,
    @Query("userName") userName?: string,
  ) {
    if (matchId) {
      const id = Number(matchId);
      if (!Number.isFinite(id) || id < 1) {
        throw new httpError.BadRequestError("无效的 matchId");
      }
      return { data: this.predictionService.listByMatch(id) };
    }
    if (userName) {
      return { data: this.predictionService.listByUser(userName.trim()) };
    }
    throw new httpError.BadRequestError("请提供 matchId 或 userName 查询参数");
  }

  @Patch("/predictions/:id")
  async updatePrediction(@Param("id") id: string, @Body() body: unknown) {
    const numId = Number(id);
    if (!Number.isFinite(numId) || numId < 1) {
      throw new httpError.BadRequestError("无效的预测 ID");
    }
    try {
      const input = parseUpdatePredictionInput(body);
      return { data: this.predictionService.update(numId, input) };
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "更新数据无效";
      if (message.includes("不存在")) {
        throw new httpError.NotFoundError(message);
      }
      if (message.includes("无权")) {
        throw new httpError.ForbiddenError(message);
      }
      throw new httpError.BadRequestError(message);
    }
  }
}
