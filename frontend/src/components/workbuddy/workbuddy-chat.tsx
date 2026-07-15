"use client";

import { useEffect, useRef, useState } from "react";
import { WorkBuddyMessage } from "./workbuddy-message";

type Message = { role: "user" | "agent"; content: string };

export function WorkBuddyChat() {
  const [userName, setUserName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/agent/suggestions")
      .then((res) => res.json())
      .then((json) => setSuggestions(json.data))
      .catch(() => {});
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSetName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || userName.trim().length < 2) return;
    setNameSet(true);
    const greeting = `👋 你好 ${userName.trim()}！我是世界杯赛事助手 WorkBuddy。\n\n我可以帮你：\n· 📊 查看积分榜排名\n· ⚽ 了解球队信息\n· 📅 查看赛程安排\n· 📋 查看比赛结果\n· 🔮 参与比分预测\n\n有什么我可以帮你的？`;
    setMessages([{ role: "agent", content: greeting }]);
  };

  const handleSend = async (text?: string) => {
    const msg = text ?? input.trim();
    if (!msg) return;

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, userName: userName.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setMessages((prev) => [...prev, { role: "agent", content: json.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "agent", content: "抱歉，我暂时无法回复。请稍后再试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!nameSet) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <span className="text-5xl">🤖</span>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          欢迎使用 WorkBuddy
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          世界杯赛事智能助手，帮你快速了解赛事信息
        </p>
        <form onSubmit={handleSetName} className="mt-6 flex gap-3">
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="输入你的名字"
            className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            maxLength={30}
          />
          <button
            type="submit"
            className="rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-800 transition"
          >
            开始
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-16rem)] max-w-2xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((m, i) => (
          <WorkBuddyMessage key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm">
              🤖
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: "0.1s" }}
                />
                <span
                  className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => handleSend(s)}
              className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-medium text-violet-700 hover:bg-violet-100 transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-3 border-t border-slate-200 pt-4"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入你的问题…"
          className="flex-1 rounded-full border border-slate-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          maxLength={500}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-full bg-violet-700 px-6 py-3 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50 transition"
        >
          发送
        </button>
      </form>
    </div>
  );
}
