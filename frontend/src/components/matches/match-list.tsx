"use client";

import { useEffect, useState, useCallback } from "react";
import { MatchCard } from "./match-card";
import { MatchFilter } from "./match-filter";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";

type Team = {
  id: number;
  name: string;
  nameZh: string;
  shortName: string;
  logoColor: string;
};
type MatchData = {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  matchDate: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  predictionCount: number;
  commentCount: number;
};

export function MatchList() {
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("");
  const [matchday, setMatchday] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();

    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (matchday) params.set("matchday", matchday);

    const qs = params.toString();
    fetch(`/api/matches${qs ? `?${qs}` : ""}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("API 返回了非预期状态");
        return res.json();
      })
      .then((json) => {
        setMatches(json.data);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [status, matchday]);

  const handleFilter = useCallback((newStatus: string, newMatchday: string) => {
    setStatus(newStatus);
    setMatchday(newMatchday);
  }, []);

  return (
    <section aria-labelledby="matches-heading">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 id="matches-heading" className="text-2xl font-bold text-slate-900">
          赛事列表
        </h2>
        <MatchFilter
          status={status}
          matchday={matchday}
          onFilter={handleFilter}
        />
      </div>

      {error ? (
        <ErrorBanner
          message={error}
          onRetry={() => handleFilter(status, matchday)}
        />
      ) : loading ? (
        <LoadingSpinner count={6} />
      ) : matches.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {matches.map((m) => (
            <MatchCard key={m.id} {...m} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏟"
          title="没有找到比赛"
          description="尝试调整筛选条件"
        />
      )}
    </section>
  );
}
