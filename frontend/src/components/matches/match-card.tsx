"use client";

import Link from "next/link";
import { TeamBadge } from "@/components/teams/team-badge";
import { StatusBadge } from "@/components/shared/status-badge";

const STAGE_LABELS: Record<number, string> = {
  1: "小组赛第1轮",
  2: "小组赛第2轮",
  3: "小组赛第3轮",
  4: "1/8决赛",
  5: "1/4决赛",
  6: "半决赛",
  7: "决赛/三四名",
};

type MatchCardProps = {
  id: number;
  homeTeam: {
    id: number;
    name: string;
    nameZh: string;
    shortName: string;
    logoColor: string;
  };
  awayTeam: {
    id: number;
    name: string;
    nameZh: string;
    shortName: string;
    logoColor: string;
  };
  matchDate: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  predictionCount: number;
  commentCount: number;
};

export function MatchCard({ id, homeTeam, awayTeam, matchDate, matchday, status, homeScore, awayScore, predictionCount, commentCount }: MatchCardProps) {
  const date = new Date(matchDate);
  const dateStr = date.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
  const timeStr = date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });

  return (
    <Link
      href={`/matches/${id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500">
          {STAGE_LABELS[matchday] ?? `第${matchday}轮`} · {dateStr} {timeStr}
        </span>
        <StatusBadge status={status} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <TeamBadge
            name={homeTeam.name}
            nameZh={homeTeam.nameZh}
            shortName={homeTeam.shortName}
            logoColor={homeTeam.logoColor}
            score={homeScore}
            isHome
          />
        </div>
        <span className="text-sm font-bold text-slate-400 shrink-0">VS</span>
        <div className="flex-1">
          <TeamBadge
            name={awayTeam.name}
            nameZh={awayTeam.nameZh}
            shortName={awayTeam.shortName}
            logoColor={awayTeam.logoColor}
            score={awayScore}
            isHome={false}
          />
        </div>
      </div>

      {status === "scheduled" && (
        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <span>🔮 {predictionCount} 人预测</span>
        </div>
      )}
      {status === "finished" && (
        <div className="mt-3 flex gap-3 text-xs text-slate-500">
          <span>💬 {commentCount} 条评论</span>
        </div>
      )}
    </Link>
  );
}
