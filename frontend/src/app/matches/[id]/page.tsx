"use client";

import { useEffect, useState, use } from "react";
import { TeamBadge } from "@/components/teams/team-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";
import { PredictionForm } from "@/components/predictions/prediction-form";
import { PredictionLeaderboard } from "@/components/predictions/prediction-leaderboard";
import { CommentList } from "@/components/comments/comment-list";
import { CommentForm } from "@/components/comments/comment-form";

const STAGE_LABELS: Record<number, string> = {
  1: "小组赛第1轮",
  2: "小组赛第2轮",
  3: "小组赛第3轮",
  4: "1/8决赛",
  5: "1/4决赛",
  6: "半决赛",
  7: "决赛/三四名",
};

type Team = {
  id: number;
  name: string;
  nameZh: string;
  shortName: string;
  logoColor: string;
  stadium: string;
  founded: number;
};

type MatchDetail = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  venue: string | null;
  predictionCount: number;
  commentCount: number;
};

export default function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const reload = () => setRefreshKey((k) => k + 1);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/matches/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok)
          throw new Error(res.status === 404 ? "比赛不存在" : "加载失败");
        return res.json();
      })
      .then((json) => {
        setMatch(json.data);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [id, refreshKey]);

  if (loading)
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <LoadingSpinner count={3} />
      </main>
    );

  if (error)
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <ErrorBanner message={error} onRetry={reload} />
      </main>
    );

  if (!match)
    return (
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <EmptyState
          icon="🏟"
          title="比赛不存在"
          description="请检查链接是否正确"
        />
      </main>
    );

  const date = new Date(match.matchDate);
  const dateStr = date.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      {/* Match Header */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm font-semibold text-blue-700">
              {STAGE_LABELS[match.matchday] ?? `第${match.matchday}轮`}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {dateStr} · {timeStr}
            </p>
          </div>
          <StatusBadge status={match.status} />
        </div>

        <div className="flex items-center justify-between gap-6">
          <div className="flex-1">
            <TeamBadge
              name={match.homeTeam.name}
              nameZh={match.homeTeam.nameZh}
              shortName={match.homeTeam.shortName}
              logoColor={match.homeTeam.logoColor}
              score={match.homeScore}
              isHome
            />
          </div>
          <div className="text-center shrink-0">
            <span className="text-lg font-bold text-slate-300">VS</span>
            {match.status === "finished" && (
              <p className="mt-1 text-xs text-slate-400">最终比分</p>
            )}
          </div>
          <div className="flex-1">
            <TeamBadge
              name={match.awayTeam.name}
              nameZh={match.awayTeam.nameZh}
              shortName={match.awayTeam.shortName}
              logoColor={match.awayTeam.logoColor}
              score={match.awayScore}
              isHome={false}
            />
          </div>
        </div>

        {match.venue && (
          <p className="mt-4 text-center text-sm text-slate-500">
            🏟 {match.venue}
          </p>
        )}
      </div>

      {/* Predictions Section */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900 mb-5">
          🔮 比分预测
          {match.predictionCount > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-500">
              ({match.predictionCount} 人已预测)
            </span>
          )}
        </h2>
        {match.status === "scheduled" ? (
          <div className="space-y-6">
            <PredictionForm matchId={match.id} onPredicted={reload} />
            <PredictionLeaderboard
              matchId={match.id}
              refreshKey={match.predictionCount}
            />
          </div>
        ) : (
          <PredictionLeaderboard
            matchId={match.id}
            refreshKey={match.predictionCount}
          />
        )}
      </section>

      {/* Comments Section */}
      {match.status === "finished" && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-5">
            💬 赛后讨论
            {match.commentCount > 0 && (
              <span className="ml-2 text-sm font-normal text-slate-500">
                ({match.commentCount} 条评论)
              </span>
            )}
          </h2>
          <div className="space-y-6">
            <CommentForm matchId={match.id} onCommented={reload} />
            <CommentList matchId={match.id} refreshKey={match.commentCount} />
          </div>
        </section>
      )}
    </main>
  );
}
