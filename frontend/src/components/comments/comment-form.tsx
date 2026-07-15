"use client";

import { useState } from "react";

type CommentFormProps = {
  matchId: number;
  onCommented: () => void;
};

export function CommentForm({ matchId, onCommented }: CommentFormProps) {
  const [userName, setUserName] = useState("");
  const [content, setContent] = useState("");
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
    if (!content.trim() || content.trim().length < 2) {
      setError("评论内容至少需要 2 个字符");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/matches/${matchId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: userName.trim(),
          content: content.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "评论发表失败");
      }
      setSuccess(true);
      setContent("");
      onCommented();
    } catch (e) {
      setError(e instanceof Error ? e.message : "评论发表失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="font-semibold text-slate-900 mb-4">发表评论</h3>
      <div className="grid gap-4 sm:grid-cols-4">
        <div>
          <label
            htmlFor="comment-userName"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            用户名
          </label>
          <input
            id="comment-userName"
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="输入你的昵称"
            maxLength={30}
          />
        </div>
        <div className="sm:col-span-3">
          <label
            htmlFor="comment-content"
            className="block text-xs font-semibold text-slate-600 mb-1"
          >
            评论
          </label>
          <textarea
            id="comment-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={3}
            placeholder="分享你对这场比赛的想法…"
            maxLength={1000}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-blue-700 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50 transition"
        >
          {submitting ? "发表中…" : "发表评论"}
        </button>
        {error && <p className="text-sm text-rose-600">{error}</p>}
        {success && <p className="text-sm text-emerald-600">✅ 评论已发表！</p>}
      </div>
    </form>
  );
}
