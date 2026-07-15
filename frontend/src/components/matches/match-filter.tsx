"use client";

type MatchFilterProps = {
  status: string;
  matchday: string;
  onFilter: (status: string, matchday: string) => void;
};

export function MatchFilter({ status, matchday, onFilter }: MatchFilterProps) {
  return (
    <div className="flex gap-2">
      <select
        value={status}
        onChange={(e) => onFilter(e.target.value, matchday)}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="按状态筛选"
      >
        <option value="">全部状态</option>
        <option value="scheduled">未开始</option>
        <option value="live">进行中</option>
        <option value="finished">已结束</option>
      </select>
      <select
        value={matchday}
        onChange={(e) => onFilter(status, e.target.value)}
        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="按阶段筛选"
      >
        <option value="">全部阶段</option>
        <option value="1">小组赛第1轮</option>
        <option value="2">小组赛第2轮</option>
        <option value="3">小组赛第3轮</option>
        <option value="4">1/8决赛</option>
        <option value="5">1/4决赛</option>
        <option value="6">半决赛</option>
        <option value="7">决赛/三四名</option>
      </select>
    </div>
  );
}
