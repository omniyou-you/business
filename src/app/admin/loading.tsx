export default function AdminLoadingShell() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl space-y-3">
        <div className="h-4 w-40 bg-zinc-800/80 rounded" />
        <div className="h-6 w-64 bg-zinc-700/80 rounded-md" />
        <div className="h-3 w-80 bg-zinc-800/60 rounded" />
      </div>

      {/* 4 KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-3.5 w-28 bg-zinc-800 rounded" />
              <div className="w-7 h-7 rounded-lg bg-zinc-800" />
            </div>
            <div className="h-8 w-24 bg-zinc-700/80 rounded-md" />
            <div className="h-3 w-32 bg-zinc-800/60 rounded" />
          </div>
        ))}
      </div>

      {/* Table Shell Skeleton */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="h-10 bg-zinc-950 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-950/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
