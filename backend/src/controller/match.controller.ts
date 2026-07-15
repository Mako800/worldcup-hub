import {
  Controller,
  Get,
  httpError,
  Inject,
  Param,
  Query,
} from "@midwayjs/core";
import { MatchService } from "../service/match.service";
import { StandingsService } from "../service/standings.service";
import { MatchFilters } from "../interface";

@Controller("/api")
export class MatchController {
  @Inject()
  matchService: MatchService;

  @Inject()
  standingsService: StandingsService;

  @Get("/matches")
  async listMatches(
    @Query("status") status?: string,
    @Query("matchday") matchday?: string,
    @Query("teamId") teamId?: string,
  ) {
    const filters: MatchFilters = {};

    if (status) {
      if (!["scheduled", "live", "finished"].includes(status)) {
        throw new httpError.BadRequestError(
          "status 必须是 scheduled、live 或 finished",
        );
      }
      filters.status = status as "scheduled" | "live" | "finished";
    }
    if (matchday) {
      const n = Number(matchday);
      if (!Number.isFinite(n) || n < 1 || n > 38) {
        throw new httpError.BadRequestError("matchday 必须是 1-38 的整数");
      }
      filters.matchday = n;
    }
    if (teamId) {
      const n = Number(teamId);
      if (!Number.isFinite(n) || n < 1) {
        throw new httpError.BadRequestError("无效的 teamId");
      }
      filters.teamId = n;
    }

    return { data: this.matchService.list(filters) };
  }

  @Get("/matches/upcoming")
  async listUpcomingMatches() {
    return { data: this.matchService.listUpcoming(10) };
  }

  @Get("/matches/:id")
  async getMatch(@Param("id") id: string) {
    const numId = Number(id);
    if (!Number.isFinite(numId) || numId < 1) {
      throw new httpError.BadRequestError("无效的比赛 ID");
    }
    const match = this.matchService.getById(numId);
    if (!match) {
      throw new httpError.NotFoundError("比赛不存在");
    }
    return { data: match };
  }

  @Get("/standings")
  async getStandings() {
    return { data: this.standingsService.getStandings() };
  }
}
