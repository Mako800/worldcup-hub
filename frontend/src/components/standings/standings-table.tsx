"use client";

import { useEffect, useState } from "react";
import { LoadingTable } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";

type StandingData = {
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
};

export function StandingsTable() {
  const [standings, setStandings] = useState<StandingData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch("/api/standings", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("API 返回了非预期状态");
        const json = await res.json();
        setStandings(json.data);
      } catch (e) {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  if (loading) return <LoadingTable rows={12} />;
  if (error) return <ErrorBanner message={error} />;
  if (standings.length === 0)
    return <EmptyState icon="📊" title="暂无积分数据" />;

  const top2 = standings.slice(0, 2);

  return (
    <section>
      {/* Group winners highlight */}
      <div className="grid gap-4 md:grid-cols-2 mb-8">
        {top2.map((s, i) => (
          <div
            key={s.teamId}
            className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700 uppercase">
                  {i === 0 ? "🏆 小组第一" : "🥈 小组第二"}
                </p>
                <p className="mt-1 text-xl font-bold text-slate-900">
                  {s.teamNameZh}
                </p>
                <p className="text-sm text-slate-500">{s.teamName}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-slate-900">{s.points}</p>
                <p className="text-xs text-slate-500">积分</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <span className="block font-bold">{s.played}</span>
                <span className="text-slate-500">场次</span>
              </div>
              <div>
                <span className="block font-bold text-emerald-600">
                  {s.wins}
                </span>
                <span className="text-slate-500">胜</span>
              </div>
              <div>
                <span className="block font-bold text-slate-500">
                  {s.draws}
                </span>
                <span className="text-slate-500">平</span>
              </div>
              <div>
                <span className="block font-bold text-rose-600">
                  {s.losses}
                </span>
                <span className="text-slate-500">负</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold text-slate-500 uppercase">
            <tr>
              <th className="px-4 py-3 w-10">#</th>
              <th className="px-4 py-3">球队</th>
              <th className="px-4 py-3 text-center">场</th>
              <th className="px-4 py-3 text-center">胜</th>
              <th className="px-4 py-3 text-center">平</th>
              <th className="px-4 py-3 text-center">负</th>
              <th className="px-4 py-3 text-center">进球</th>
              <th className="px-4 py-3 text-center">失球</th>
              <th className="px-4 py-3 text-center">净胜</th>
              <th className="px-4 py-3 text-center font-bold text-slate-900">
                积分
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {standings.map((s, i) => {
              const isUcl = i === 0;
              return (
                <tr
                  key={s.teamId}
                  className={`${isUcl ? "bg-amber-50/50" : ""} hover:bg-slate-50 transition`}
                >
                  <td
                    className={`px-4 py-3 font-mono text-xs font-bold ${i < 2 ? "text-amber-600" : "text-slate-400"}`}
                  >
                    {i + 1}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-900">
                      {s.teamNameZh}
                    </span>
                    <span className="ml-2 text-xs text-slate-400">
                      {s.shortName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">{s.played}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-medium">
                    {s.wins}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {s.draws}
                  </td>
                  <td className="px-4 py-3 text-center text-rose-600 font-medium">
                    {s.losses}
                  </td>
                  <td className="px-4 py-3 text-center">{s.goalsFor}</td>
                  <td className="px-4 py-3 text-center">{s.goalsAgainst}</td>
                  <td
                    className={`px-4 py-3 text-center font-medium ${s.goalDifference > 0 ? "text-emerald-600" : s.goalDifference < 0 ? "text-rose-600" : "text-slate-500"}`}
                  >
                    {s.goalDifference > 0 ? "+" : ""}
                    {s.goalDifference}
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">
                    {s.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
