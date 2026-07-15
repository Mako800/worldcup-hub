type TeamBadgeProps = {
  name: string;
  nameZh: string;
  shortName: string;
  logoColor: string;
  score?: number | null;
  isHome?: boolean;
};

export function TeamBadge({
  name,
  nameZh,
  shortName,
  logoColor,
  score,
  isHome,
}: TeamBadgeProps) {
  return (
    <div
      className={`flex items-center gap-3 ${isHome === false ? "flex-row-reverse text-right" : ""}`}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
        style={{ backgroundColor: logoColor }}
        title={`${name} (${nameZh})`}
      >
        {shortName}
      </div>
      <div className={isHome === false ? "text-right" : ""}>
        <p className="text-sm font-semibold text-slate-900">{nameZh}</p>
        <p className="text-xs text-slate-500">{name}</p>
      </div>
      {score !== null && score !== undefined && (
        <span className="text-2xl font-bold text-slate-900 tabular-nums">
          {score}
        </span>
      )}
    </div>
  );
}
