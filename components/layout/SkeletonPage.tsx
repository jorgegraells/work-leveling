import { Skeleton } from "@/components/ui/skeleton"

export default function SkeletonPage() {
  return (
    <div className="flex flex-col gap-6 p-6 bg-surface min-h-screen">
      {/* Bezel top strip */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright px-4 py-3 flex items-center gap-3">
          <Skeleton className="h-4 w-24 bg-surface-container-lowest" />
          <Skeleton className="h-4 w-4 bg-surface-container-lowest" />
          <Skeleton className="h-4 w-16 bg-surface-container-lowest" />
        </div>
      </div>

      {/* Header area */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-48 bg-surface-container-highest" />
          <Skeleton className="h-3 w-64 bg-surface-container-highest" />
        </div>
        <Skeleton className="h-9 w-28 bg-surface-container-highest rounded-md" />
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="rounded-lg bg-surface-bright p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-4 bg-surface-container-lowest rounded" />
                <Skeleton className="h-3 w-12 bg-surface-container-lowest" />
              </div>
              <Skeleton className="h-6 w-20 bg-surface-container-lowest" />
              <Skeleton className="h-3 w-full bg-surface-container-lowest" />
              <Skeleton className="h-1.5 w-full rounded-full bg-surface-container-lowest" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
