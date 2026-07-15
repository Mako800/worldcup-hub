import { StandingsTable } from "@/components/standings/standings-table";

export default function StandingsPage() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">积分榜</h1>
        <p className="mt-2 text-slate-600">FIFA World Cup 2026</p>
      </header>
      <StandingsTable />
    </main>
  );
}
