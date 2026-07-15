type MessageProps = {
  role: "user" | "agent";
  content: string;
};

export function WorkBuddyMessage({ role, content }: MessageProps) {
  const isAgent = role === "agent";
  return (
    <div className={`flex gap-3 ${isAgent ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isAgent
            ? "bg-violet-100 text-violet-700"
            : "bg-blue-100 text-blue-700"
        }`}
      >
        {isAgent ? "🤖" : "👤"}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isAgent
            ? "bg-white border border-slate-200 text-slate-800"
            : "bg-blue-700 text-white"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
