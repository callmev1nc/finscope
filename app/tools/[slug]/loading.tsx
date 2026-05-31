export default function ToolLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
      <div className="animate-pulse space-y-6">
        <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="flex items-center gap-3">
          <div className="h-8 w-64 rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-6 w-16 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="h-4 w-96 rounded bg-zinc-200 dark:bg-zinc-700" />
        <div className="grid gap-6 lg:grid-cols-5 mt-8">
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="h-6 w-32 rounded bg-zinc-200 dark:bg-zinc-700" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-700" />
                <div className="h-10 w-full rounded-lg bg-zinc-200 dark:bg-zinc-700" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-3 rounded-xl border-2 border-dashed border-border p-20 flex items-center justify-center">
            <div className="h-4 w-48 rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
