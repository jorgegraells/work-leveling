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
    <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-container-lowest">
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
          className="w-20 bg-surface-container-high rounded px-2 py-1 text-[11px] text-on-surface-variant border border-outline-variant/20 focus:outline-none focus:border-primary/40"
        />
      </div>

      {/* Title */}
      <input
        type="text"
        value={objetivo.title}
        onChange={(e) => onChange("title", e.target.value)}
        placeholder="Nombre del objetivo"
        className="flex-1 bg-surface-container-high rounded px-2 py-1 text-[12px] text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/40"
      />

      {/* XP Reward */}
      <input
        type="number"
        value={objetivo.xpReward}
        onChange={(e) => onChange("xpReward", parseInt(e.target.value) || 0)}
        className="w-20 bg-surface-container-high rounded px-2 py-1 text-[11px] text-primary text-right border border-outline-variant/20 focus:outline-none focus:border-primary/40"
        min={0}
      />
      <span className="text-[10px] text-outline flex-shrink-0">XP</span>

      {/* Order controls */}
      <div className="flex gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 rounded text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Mover arriba"
        >
          <span className="material-symbols-outlined text-base">arrow_upward</span>
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 rounded text-outline hover:text-on-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-95"
          title="Mover abajo"
        >
          <span className="material-symbols-outlined text-base">arrow_downward</span>
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-1 rounded text-outline hover:text-error transition-colors active:scale-95"
          title="Eliminar objetivo"
        >
          <span className="material-symbols-outlined text-base">delete</span>
        </button>
      </div>
    </div>
  )
}
