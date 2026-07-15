import { HomeDashboard } from "@/components/home-dashboard";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-12">
        <p className="mb-3 font-mono text-sm font-semibold tracking-[0.2em] text-blue-700 uppercase">
          World Cup Hub
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
          世界杯赛事信息与互动预测平台
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          浏览FIFA世界杯赛事数据、预测比赛比分、参与赛后讨论——从观赛到互动的一站式体验。
        </p>
      </header>

      <HomeDashboard />
    </main>
  );
}
