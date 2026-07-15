"use client";

import { useState } from "react";
import Link from "next/link";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";
import { EmptyState } from "@/components/shared/empty-state";

type PredictionData = {
  id: number;
  matchId: number;
  userName: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
};

export default function PredictionsPage() {
  const [userName, setUserName] = useState("");
  const [searched, setSearched] = useState(false);
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [matchNames, setMatchNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || userName.trim().length < 2) return;

    setLoading(true);
    setError(null);
    const controller = new AbortController();

    fetch(`/api/predictions?userName=${encodeURIComponent(userName.trim())}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("查询失败");
        return res.json();
      })
      .then(async (json) => {
        const preds = json.data as PredictionData[];
        setPredictions(preds);

        // Fetch match names for each unique matchId
        const matchNamesMap: Record<number, string> = {};
        await Promise.all(
          [...new Set(preds.map((p) => p.matchId))].map(async (mid) => {
            try {
              const res = await fetch(`/api/matches/${mid}`);
              if (res.ok) {
                const data = await res.json();
                matchNamesMap[mid] = `${data.data.homeTeam.nameZh} vs ${data.data.awayTeam.nameZh}`;
              }
            } catch { /* ignore */ }
          }),
        );
        setMatchNames(matchNamesMap);
        setSearched(true);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.name !== "AbortError") setError(e.message);
        setLoading(false);
      });
  };

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">我的预测</h1>
        <p className="mt-2 text-slate-600">输入用户名查看你的预测记录</p>
      </header>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="输入你的用户名"
          className="flex-1 max-w-xs rounded-full border border-slate-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          maxLength={30}
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition"
        >
          {loading ? "查询中…" : "查询"}
        </button>
      </form>

      {error ? (
        <ErrorBanner message={error} />
      ) : loading ? (
        <LoadingSpinner count={3} />
      ) : searched && predictions.length === 0 ? (
        <EmptyState icon="🔮" title="暂无预测记录" description={`用户 "${userName}" 还没有做出任何预测`} />
      ) : predictions.length > 0 ? (
        <div className="space-y-3">
          {predictions.map((p) => (
            <Link
              key={p.id}
              href={`/matches/${p.matchId}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 hover:shadow-sm transition"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {matchNames[p.matchId] ?? `比赛 #${p.matchId}`}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {new Date(p.createdAt).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <span className="text-lg font-bold text-slate-900 tabular-nums">
                {p.homeScore} : {p.awayScore}
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </main>
  );
}
