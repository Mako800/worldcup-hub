import { Inject, Provide } from "@midwayjs/core";
import { TeamService } from "./team.service";
import { MatchFilters, MatchWithTeams } from "../interface";

type MatchWithCountsRow = {
  id: number;
  home_team_id: number;
  away_team_id: number;
  match_date: string;
  matchday: number;
  status: string;
  home_score: number | null;
  away_score: number | null;
  venue: string | null;
  prediction_count: number;
  comment_count: number;
};

@Provide()
export class MatchService {
  @Inject()
  teamService: TeamService;

  private get db() {
    return this.teamService.database;
  }

  list(filters?: MatchFilters): MatchWithTeams[] {
    let sql = `
      SELECT m.*,
        (SELECT COUNT(*) FROM predictions p WHERE p.match_id = m.id) as prediction_count,
        (SELECT COUNT(*) FROM comments c WHERE c.match_id = m.id) as comment_count
      FROM matches m
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (filters?.status) {
      sql += " AND m.status = ?";
      params.push(filters.status);
    }
    if (filters?.matchday) {
      sql += " AND m.matchday = ?";
      params.push(filters.matchday);
    }
    if (filters?.teamId) {
      sql += " AND (m.home_team_id = ? OR m.away_team_id = ?)";
      params.push(filters.teamId, filters.teamId);
    }

    sql += " ORDER BY m.match_date ASC";

    const rows = this.db.prepare(sql).all(...params) as MatchWithCountsRow[];
    return rows.map((r) => this.enrichMatch(r));
  }

  getById(id: number): MatchWithTeams | undefined {
    const row = this.db
      .prepare(
        `SELECT m.*,
          (SELECT COUNT(*) FROM predictions p WHERE p.match_id = m.id) as prediction_count,
          (SELECT COUNT(*) FROM comments c WHERE c.match_id = m.id) as comment_count
        FROM matches m WHERE m.id = ?`,
      )
      .get(id) as MatchWithCountsRow | undefined;
    return row ? this.enrichMatch(row) : undefined;
  }

  listUpcoming(limit = 10): MatchWithTeams[] {
    const rows = this.db
      .prepare(
        `SELECT m.*,
          (SELECT COUNT(*) FROM predictions p WHERE p.match_id = m.id) as prediction_count,
          (SELECT COUNT(*) FROM comments c WHERE c.match_id = m.id) as comment_count
        FROM matches m
        WHERE m.status = 'scheduled' AND m.match_date > datetime('now')
        ORDER BY m.match_date ASC
        LIMIT ?`,
      )
      .all(limit) as MatchWithCountsRow[];
    return rows.map((r) => this.enrichMatch(r));
  }

  getByTeam(teamId: number): MatchWithTeams[] {
    const rows = this.db
      .prepare(
        `SELECT m.*,
          (SELECT COUNT(*) FROM predictions p WHERE p.match_id = m.id) as prediction_count,
          (SELECT COUNT(*) FROM comments c WHERE c.match_id = m.id) as comment_count
        FROM matches m
        WHERE m.home_team_id = ? OR m.away_team_id = ?
        ORDER BY m.match_date ASC`,
      )
      .all(teamId, teamId) as MatchWithCountsRow[];
    return rows.map((r) => this.enrichMatch(r));
  }

  getMatchdayRange(): { min: number; max: number } {
    const row = this.db
      .prepare("SELECT MIN(matchday) as min_md, MAX(matchday) as max_md FROM matches")
      .get() as { min_md: number; max_md: number };
    return { min: row.min_md, max: row.max_md };
  }

  private enrichMatch(row: MatchWithCountsRow): MatchWithTeams {
    const homeTeam = this.teamService.getById(row.home_team_id)!;
    const awayTeam = this.teamService.getById(row.away_team_id)!;
    return {
      id: row.id,
      homeTeamId: row.home_team_id,
      awayTeamId: row.away_team_id,
      matchDate: row.match_date,
      matchday: row.matchday,
      status: row.status as "scheduled" | "live" | "finished",
      homeScore: row.home_score,
      awayScore: row.away_score,
      venue: row.venue,
      homeTeam,
      awayTeam,
      predictionCount: row.prediction_count,
      commentCount: row.comment_count,
    };
  }
}
