import { WorkBuddyChat } from "@/components/workbuddy/workbuddy-chat";

export default function WorkBuddyPage() {
  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">🤖 WorkBuddy</h1>
        <p className="mt-2 text-slate-600">世界杯赛事智能助手 — 随时查询赛事信息、球队数据和比赛结果</p>
      </header>
      <WorkBuddyChat />
    </main>
  );
}
