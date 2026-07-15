type MatchStatus = "scheduled" | "live" | "finished";

const statusConfig: Record<MatchStatus, { label: string; className: string }> =
  {
    scheduled: { label: "未开始", className: "bg-blue-100 text-blue-800" },
    live: {
      label: "进行中",
      className: "bg-red-100 text-red-800 animate-pulse",
    },
    finished: { label: "已结束", className: "bg-slate-100 text-slate-600" },
  };

export function StatusBadge({ status }: { status: MatchStatus }) {
  const config = statusConfig[status] ?? statusConfig.scheduled;
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {status === "live" && (
        <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500" />
      )}
      {config.label}
    </span>
  );
}
