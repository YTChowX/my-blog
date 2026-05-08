export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 border rounded-xl">
            <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-3" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-4/5" />
          </div>
        ))}
      </div>
    </div>
  )
}
