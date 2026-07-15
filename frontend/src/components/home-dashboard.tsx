"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MatchCard } from "@/components/matches/match-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";

type Team = { id: number; name: string; nameZh: string; shortName: string; logoColor: string };
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
type StandingData = {
  teamId: number;
  teamNameZh: string;
  shortName: string;
  played: number;
  points: number;
};

export function HomeDashboard() {
  const [health, setHealth] = useState<string | null>(null);
  const [upcoming, setUpcoming] = useState<MatchData[]>([]);
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const [healthRes, upcomingRes, standingsRes] = await Promise.all([
          fetch("/api/health", { signal: controller.signal }),
          fetch("/api/matches/upcoming", { signal: controller.signal }),
          fetch("/api/standings", { signal: controller.signal }),
        ]);

        if (!healthRes.ok) throw new Error("API 连接失败");

        const healthData = await healthRes.json();
        setHealth(healthData.service);

        if (upcomingRes.ok) {
          const uData = await upcomingRes.json();
          setUpcoming(uData.data.slice(0, 6));
        }
        if (standingsRes.ok) {
          const sData = await standingsRes.json();
          setStandings(sData.data.slice(0, 5));
        }
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  return (
    <div className="space-y-14">
      {/* API Status */}
      <div className="flex items-center gap-2">
        <div
          className={`h-2.5 w-2.5 rounded-full ${
            health ? "bg-emerald-500" : error ? "bg-rose-500" : "bg-amber-500 animate-pulse"
          }`}
        />
        <span className="text-sm font-medium text-slate-600">
          {health ? `API 已连接 · ${health}` : error ? "API 连接失败" : "正在连接 API…"}
        </span>
      </div>

      {error ? (
        <ErrorBanner message={error} />
      ) : loading ? (
        <LoadingSpinner count={3} />
      ) : (
        <>
          {/* Quick Actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/matches"
              className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white transition hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-3xl">📅</span>
              <h3 className="mt-3 text-lg font-bold">浏览赛事</h3>
              <p className="mt-1 text-sm text-blue-200">查看全部赛程与比赛结果</p>
            </Link>
            <Link
              href="/predictions"
              className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white transition hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-3xl">🔮</span>
              <h3 className="mt-3 text-lg font-bold">比分预测</h3>
              <p className="mt-1 text-sm text-emerald-200">预测即将开始比赛的比分</p>
            </Link>
            <Link
              href="/workbuddy"
              className="rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-6 text-white transition hover:shadow-lg hover:-translate-y-1"
            >
              <span className="text-3xl">🤖</span>
              <h3 className="mt-3 text-lg font-bold">WorkBuddy</h3>
              <p className="mt-1 text-sm text-violet-200">AI 助手帮你了解赛事信息</p>
            </Link>
          </div>

          {/* Upcoming Matches */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-900">即将开始的比赛</h2>
              <Link href="/matches" className="text-sm font-semibold text-blue-700 hover:underline">
                查看全部 →
              </Link>
            </div>
            {upcoming.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map((m) => (
                  <MatchCard key={m.id} {...m} />
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">暂无即将开始的比赛</p>
            )}
          </section>

          {/* Top Standings */}
          <section>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-slate-900">积分榜 TOP 5</h2>
              <Link href="/standings" className="text-sm font-semibold text-blue-700 hover:underline">
                查看完整积分榜 →
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
                  <tr>
                    <th className="px-5 py-3 w-10">#</th>
                    <th className="px-5 py-3">球队</th>
                    <th className="px-5 py-3 text-center">场</th>
                    <th className="px-5 py-3 text-center font-bold">积分</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {standings.map((s, i) => (
                    <tr key={s.teamId} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-xs font-bold text-slate-400">{i + 1}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {s.teamNameZh}
                        <span className="ml-2 text-xs text-slate-400">{s.shortName}</span>
                      </td>
                      <td className="px-5 py-3 text-center">{s.played}</td>
                      <td className="px-5 py-3 text-center font-bold text-slate-900">{s.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
