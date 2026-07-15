"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";

type PredictionData = {
  id: number;
  matchId: number;
  userName: string;
  homeScore: number;
  awayScore: number;
  createdAt: string;
  updatedAt: string;
};

export function PredictionLeaderboard({
  matchId,
  refreshKey,
}: {
  matchId: number;
  refreshKey: number;
}) {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/predictions?matchId=${matchId}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        setPredictions(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [matchId, refreshKey]);

  if (loading)
    return <div className="h-16 animate-pulse rounded-xl bg-slate-200" />;
  if (predictions.length === 0)
    return (
      <EmptyState
        icon="🔮"
        title="暂无预测"
        description="成为第一个预测的人！"
      />
    );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-5 py-3 bg-slate-50 text-xs font-semibold text-slate-500 uppercase">
        预测排行榜 · {predictions.length} 人参与
      </div>
      <div className="divide-y divide-slate-100">
        {predictions.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-5 py-3"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold text-slate-400 w-6">
                {i + 1}
              </span>
              <span className="text-sm font-semibold text-slate-900">
                {p.userName}
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 tabular-nums">
              {p.homeScore} : {p.awayScore}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
