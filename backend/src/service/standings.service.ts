import { Inject, Provide } from "@midwayjs/core";
import { TeamService } from "./team.service";
import { Standing } from "../interface";

type StandingRow = {
  team_id: number;
  team_name: string;
  team_name_zh: string;
  short_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
};

@Provide()
export class StandingsService {
  @Inject()
  teamService: TeamService;

  private get db() {
    return this.teamService.database;
  }

  getStandings(): Standing[] {
    const rows = this.db
      .prepare("SELECT * FROM standings_view")
      .all() as StandingRow[];

    return rows.map((row) => ({
      teamId: row.team_id,
      teamName: row.team_name,
      teamNameZh: row.team_name_zh,
      shortName: row.short_name,
      played: row.played,
      wins: row.wins,
      draws: row.draws,
      losses: row.losses,
      goalsFor: row.goals_for,
      goalsAgainst: row.goals_against,
      goalDifference: row.goals_for - row.goals_against,
      points: row.wins * 3 + row.draws,
    }));
  }
}
