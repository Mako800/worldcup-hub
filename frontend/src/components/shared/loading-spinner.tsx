export function LoadingSpinner({
  count = 3,
  className = "",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 ${className}`}
      aria-label="正在加载"
    >
      {Array.from({ length: count }, (_, i) => (
        <div className="h-48 animate-pulse rounded-2xl bg-slate-200" key={i} />
      ))}
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse" aria-label="正在加载数据">
      <div className="h-10 bg-slate-200 rounded mb-3" />
      {Array.from({ length: rows }, (_, i) => (
        <div className="h-12 bg-slate-100 rounded mb-2" key={i} />
      ))}
    </div>
  );
}
