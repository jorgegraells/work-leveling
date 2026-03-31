"use client"

export interface TopPerformer {
  userId: string
  name: string
  avatarUrl: string | null
  level: number
  completedCount: number
  assignedCount: number
  completionRate: number
  onTimePct: number
  departmentId: string | null
  departmentName: string | null
}

interface Props {
  performers: TopPerformer[]
  onClickEmployee?: (userId: string) => void
}

const TROPHY_ICONS = [
  { icon: "emoji_events", color: "text-[#e9c400]" },   // gold
  { icon: "emoji_events", color: "text-[#9ecaff]" },    // silver
  { icon: "emoji_events", color: "text-[#cd7f32]" },    // bronze
]

export default function TopPerformersLeaderboard({ performers, onClickEmployee }: Props) {
  if (!performers.length) {
    return (
      <div className="py-8 text-center space-y-2">
        <span className="material-symbols-outlined text-3xl text-outline opacity-40 block">leaderboard</span>
        <p className="text-outline text-sm">Sin datos de rendimiento en este período</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-3 pb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline">#</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Empleado</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-20 text-center">Completadas</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-16 text-center">A tiempo</span>
      </div>

      {performers.map((p, i) => {
        const trophy = TROPHY_ICONS[i]
        const initials = p.name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()

        return (
          <button
            key={p.userId}
            onClick={() => onClickEmployee?.(p.userId)}
            className="w-full grid grid-cols-[2rem_1fr_auto_auto] gap-3 items-center px-3 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-colors active:scale-[0.98] text-left"
          >
            {/* Rank */}
            <div className="flex items-center justify-center">
              {trophy ? (
                <span className={`material-symbols-outlined text-base ${trophy.color}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {trophy.icon}
                </span>
              ) : (
                <span className="text-[11px] font-bold text-outline">{i + 1}</span>
              )}
            </div>

            {/* Name + avatar */}
            <div className="flex items-center gap-2.5 min-w-0">
              {p.avatarUrl ? (
                <img
                  src={p.avatarUrl}
                  alt={p.name}
                  className="w-7 h-7 rounded-full object-cover border border-outline-variant/20 flex-shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-bold text-outline">{initials}</span>
                </div>
              )}
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-on-surface truncate">{p.name}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] text-outline">Nv.{p.level}</span>
                  {p.departmentName && (
                    <span className="text-[9px] text-outline/60 truncate">· {p.departmentName}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Completed count */}
            <div className="w-20 text-center">
              <span className="text-sm font-bold text-secondary">{p.completedCount}</span>
            </div>

            {/* On-time % */}
            <div className="w-16 text-center">
              <span className={`text-sm font-bold ${p.onTimePct >= 75 ? "text-secondary" : p.onTimePct >= 50 ? "text-primary" : "text-error"}`}>
                {p.onTimePct}%
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
