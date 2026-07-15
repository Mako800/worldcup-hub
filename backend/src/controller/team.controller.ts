import { Controller, Get, httpError, Inject, Param } from "@midwayjs/core";
import { TeamService } from "../service/team.service";

@Controller("/api")
export class TeamController {
  @Inject()
  teamService: TeamService;

  @Get("/teams")
  async listTeams() {
    return { data: this.teamService.list() };
  }

  @Get("/teams/:id")
  async getTeam(@Param("id") id: string) {
    const numId = Number(id);
    if (!Number.isFinite(numId) || numId < 1) {
      throw new httpError.BadRequestError("无效的球队 ID");
    }
    const team = this.teamService.getById(numId);
    if (!team) {
      throw new httpError.NotFoundError("球队不存在");
    }
    return { data: team };
  }
}
