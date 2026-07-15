"use client";

import { useState } from "react";

type PredictionFormProps = {
  matchId: number;
  onPredicted: () => void;
};

export function PredictionForm({ matchId, onPredicted }: PredictionFormProps) {
  const [userName, setUserName] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!userName.trim() || userName.trim().length < 2) {
      setError("用户名至少需要 2 个字符");
      return;
    }
    if (homeScore === "" || awayScore === "") {
      setError("请输入主客队比分");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          matchId,
          userName: userName.trim(),
          homeScore: Number(homeScore),
          awayScore: Number(awayScore),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "预测提交失败");
      }
      setSuccess(true);
      setHomeScore("");
      setAwayScore("");
      onPredicted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "预测提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-900 mb-4">提交你的预测</h3>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="userName" className="block text-xs font-semibold text-slate-600 mb-1">
            用户名
          </label>
          <input
            id="userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入你的昵称"
            maxLength={30}
          />
        </div>
        <div>
          <label htmlFor="homeScore" className="block text-xs font-semibold text-slate-600 mb-1">
            主队进球
          </label>
          <input
            id="homeScore"
            type="number"
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
            max={20}
            placeholder="0"
          />
        </div>
        <div>
          <label htmlFor="awayScore" className="block text-xs font-semibold text-slate-600 mb-1">
            客队进球
          </label>
          <input
            id="awayScore"
            type="number"
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={0}
            max={20}
            placeholder="0"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition"
        >
          {submitting ? "提交中…" : "提交预测"}
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">✅ 预测已提交！</p>}
      </div>
    </form>
  );
}
