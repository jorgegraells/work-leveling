"use client"

interface ObjetivoRowProps {
  objetivo: {
    id?: string
    title: string
    xpReward: number
    order: number
    icon: string
  }
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onChange: (field: string, value: string | number) => void
  isFirst: boolean
  isLast: boolean
}

export default function ObjetivoRow({
  objetivo,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
  isFirst,
  isLast,
}: ObjetivoRowProps) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
      {/* Icon preview + input */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="material-symbols-outlined text-outline text-lg w-5 text-center">
          {objetivo.icon || "circle"}
        </span>
        <input
          type="text"
          value={objetivo.icon}
          onChange={(e) => onChange("icon", e.target.value)}
          placeholder="star"
          className="w-20 bg-surface-container-high rounded-md px-2 py-1.5 text-[11px] text-on-surface-variant border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
        />
      </div>

      {/* Title */}
      <input
        type="text"
        value={objetivo.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="Nombre de la mision diaria"
        className="flex-1 bg-surface-container-high rounded-md px-2 py-1.5 text-[12px] text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
      />

      {/* XP Reward */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <input
          type="number"
          value={objetivo.xpReward}
          onChange={(e) => onChange("xpReward", parseInt(e.target.value) || 0)}
          className="w-20 bg-surface-container-high rounded-md px-2 py-1.5 text-[11px] text-primary font-bold text-right border border-outline-variant/30 focus:outline-none focus:border-primary"
          min={0}
        />
        <span className="text-[10px] font-bold text-primary uppercase tracking-widest">XP</span>
      </div>

      {/* Order controls */}
      <div className="flex gap-0.5 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Mover arriba"
        >
          <span className="material-symbols-outlined text-base">arrow_upward</span>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded-md text-outline hover:text-on-surface hover:bg-surface-container-high disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Mover abajo"
        >
          <span className="material-symbols-outlined text-base">arrow_downward</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded-md text-outline hover:text-error hover:bg-error-container/10 transition-colors active:scale-95"
          title="Eliminar mision"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  )
}
