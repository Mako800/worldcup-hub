"use client";

import { useEffect, useState } from "react";
import { TeamCard } from "@/components/teams/team-card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ErrorBanner } from "@/components/shared/error-banner";

type TeamData = {
  id: number;
  name: string;
  nameZh: string;
  shortName: string;
  stadium: string;
  founded: number;
  logoColor: string;
};

export default function TeamsPage() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/teams", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("API 返回了非预期状态");
        return res.json();
      })
      .then((json) => {
        setTeams(json.data);
        setLoading(false);
      })
      .catch((e) => {
        if (e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 sm:px-10 sm:py-16">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">世界杯参赛球队</h1>
        <p className="mt-2 text-slate-600">FIFA 世界杯 32 支参赛球队</p>
      </header>

      {error ? (
        <ErrorBanner message={error} />
      ) : loading ? (
        <LoadingSpinner count={12} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <TeamCard key={team.id} {...team} />
          ))}
        </div>
      )}
    </main>
  );
}
