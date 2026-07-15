"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { TeamBadge } from "@/components/teams/team-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";

const STAGE_LABELS: Record<number, string> = {
  1: "小组赛第1轮",
  2: "小组赛第2轮",
  3: "小组赛第3轮",
  4: "1/8决赛",
  5: "1/4决赛",
  6: "半决赛",
  7: "决赛/三四名",
};

type TeamData = { id: number; name: string; nameZh: string; shortName: string; stadium: string; founded: number; logoColor: string };
type MatchData = {
  id: number;
  homeTeam: TeamData;
  awayTeam: TeamData;
  matchDate: string;
  matchday: number;
  status: "scheduled" | "live" | "finished";
  homeScore: number | null;
  awayScore: number | null;
  predictionCount: number;
  commentCount: number;
};

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [team, setTeam] = useState<TeamData | null>(null);
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const [teamRes, matchRes] = await Promise.all([
          fetch(`/api/teams/${id}`, { signal: controller.signal }),
          fetch(`/api/matches?teamId=${id}`, { signal: controller.signal }),
        ]);
        if (!teamRes.ok) throw new Error(teamRes.status === 404 ? "球队不存在" : "加载失败");
        const teamData = await teamRes.json();
        setTeam(teamData.data);
        if (matchRes.ok) {
          const matchData = await matchRes.json();
          setMatches(matchData.data);
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [id]);

  if (loading) return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <LoadingSpinner count={3} />
    </main>
  );

  if (error) return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <ErrorBanner message={error} />
    </main>
  );

  if (!team) return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <EmptyState icon="⚽" title="球队不存在" />
    </main>
  );

  const finished = matches.filter((m) => m.status === "finished");
  const upcoming = matches.filter((m) => m.status === "scheduled");

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      {/* Team Header */}
      <div className="flex items-center gap-5 mb-10">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ backgroundColor: team.logoColor }}
        >
          {team.shortName}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{team.nameZh}</h1>
          <p className="text-lg text-slate-500">{team.name}</p>
          <div className="mt-2 flex gap-4 text-sm text-slate-500">
            <span>🏟 {team.stadium}</span>
            <span>📅 成立于 {team.founded}</span>
          </div>
        </div>
      </div>

      {/* Team Matches */}
      <section className="space-y-8">
        {upcoming.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">📅 即将进行的比赛</h2>
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-4">
                    <TeamBadge name={m.homeTeam.name} nameZh={m.homeTeam.nameZh} shortName={m.homeTeam.shortName} logoColor={m.homeTeam.logoColor} />
                    <span className="text-sm text-slate-400">VS</span>
                    <TeamBadge name={m.awayTeam.name} nameZh={m.awayTeam.nameZh} shortName={m.awayTeam.shortName} logoColor={m.awayTeam.logoColor} />
                  </div>
                  <div className="text-right">
                    <StatusBadge status={m.status} />
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(m.matchDate).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {finished.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">✅ 已完成的比赛</h2>
            <div className="space-y-3">
              {finished.slice(0, 10).map((m) => (
                <Link
                  key={m.id}
                  href={`/matches/${m.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition"
                >
                  <div className="flex items-center gap-4">
                    <TeamBadge name={m.homeTeam.name} nameZh={m.homeTeam.nameZh} shortName={m.homeTeam.shortName} logoColor={m.homeTeam.logoColor} score={m.homeScore} />
                    <span className="text-sm text-slate-400">VS</span>
                    <TeamBadge name={m.awayTeam.name} nameZh={m.awayTeam.nameZh} shortName={m.awayTeam.shortName} logoColor={m.awayTeam.logoColor} score={m.awayScore} />
                  </div>
                  <div className="text-right">
                    <StatusBadge status="finished" />
                    <p className="text-xs text-slate-500 mt-1">{STAGE_LABELS[m.matchday] ?? `第${m.matchday}轮`}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
