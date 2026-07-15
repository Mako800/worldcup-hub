// ===== Team =====

export interface Team {
  id: number;
  name: string;
  nameZh: string;
  shortName: string;
  stadium: string;
  founded: number;
  logoColor: string;
}

// ===== Match =====

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  matchDate: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
}

export interface MatchWithTeams extends Match {
  homeTeam: Team;
  awayTeam: Team;
  predictionCount: number;
  commentCount: number;
}

export interface MatchFilters {
  status?: "scheduled" | "live" | "finished";
  matchday?: number;
  teamId?: number;
}

// ===== Standing =====

export interface Standing {
  teamId: number;
  teamName: string;
  teamNameZh: string;
  shortName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// ===== Prediction =====

export interface Prediction {
  id: number;
  matchId: number;
  userName: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePredictionInput {
  matchId: number;
  userName: string;
  homeScore: number;
  awayScore: number;
}

export interface UpdatePredictionInput {
  userName: string;
  homeScore: number;
  awayScore: number;
}

// ===== Comment =====

export interface Comment {
  id: number;
  matchId: number;
  userName: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentInput {
  userName: string;
  content: string;
}

// ===== Agent (WorkBuddy) =====

export interface AgentRequest {
  message: string;
  userName: string;
}

export interface AgentResponse {
  reply: string;
  intent: string;
  data?: unknown;
}
