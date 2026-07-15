"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/shared/empty-state";

type CommentData = {
  id: number;
  matchId: number;
  userName: string;
  content: string;
  createdAt: string;
};

export function CommentList({ matchId, refreshKey }: { matchId: number; refreshKey: number }) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/matches/${matchId}/comments`, { signal: controller.signal })
      .then((res) => res.json())
      .then((json) => {
        setComments(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => controller.abort();
  }, [matchId, refreshKey]);

  if (loading) return <div className="h-24 animate-pulse rounded-xl bg-slate-200" />;
  if (comments.length === 0) return <EmptyState icon="💬" title="暂无评论" description="成为第一个评论的人！" />;

  return (
    <div className="space-y-3">
      {comments.map((c) => (
        <div key={c.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-900">{c.userName}</span>
            <span className="text-xs text-slate-400">
              {new Date(c.createdAt).toLocaleDateString("zh-CN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{c.content}</p>
        </div>
      ))}
    </div>
  );
}
