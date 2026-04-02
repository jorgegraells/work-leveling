export default function KpiLoading() {
  return (
    <div className="flex-1 flex flex-col w-full relative">
      <div className="h-6 w-full bg-surface-variant flex-shrink-0" />
      <div className="flex-1 px-4 sm:px-8 py-8 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
        {/* Header skeleton */}
        <div className="h-8 w-48 bg-surface-container-highest rounded-lg" />
        {/* Period tabs skeleton */}
        <div className="flex gap-2">
          {[1,2,3].map(i => <div key={i} className="h-9 w-20 bg-surface-container-highest rounded-lg" />)}
        </div>
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="rounded-xl bg-surface-container-highest p-1">
              <div className="rounded-lg bg-surface-bright p-6 h-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="h-6 w-full bg-surface-variant flex-shrink-0" />
    </div>
  )
}
