import Link from "next/link";

type TeamCardProps = {
  id: number;
  name: string;
  nameZh: string;
  shortName: string;
  stadium: string;
  founded: number;
  logoColor: string;
};

export function TeamCard({ id, name, nameZh, shortName, stadium, founded, logoColor }: TeamCardProps) {
  return (
    <Link
      href={`/teams/${id}`}
      className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex items-center gap-4">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white"
          style={{ backgroundColor: logoColor }}
        >
          {shortName}
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition">{nameZh}</h3>
          <p className="text-sm text-slate-500">{name}</p>
        </div>
      </div>
      <div className="mt-4 flex gap-4 text-xs text-slate-500">
        <span>🏟 {stadium}</span>
        <span>📅 成立于 {founded}</span>
      </div>
    </Link>
  );
}
