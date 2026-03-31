"use client"

import { useState, useEffect } from "react"
import { computeDeadlineInfo } from "@/lib/deadline"
import type { DeadlineInfo } from "@/lib/deadline"

interface DeadlineBadgeProps {
  dueDate: string | null
  completedAt?: string | null
  compact?: boolean
}

export default function DeadlineBadge({ dueDate, completedAt, compact = false }: DeadlineBadgeProps) {
  const [info, setInfo] = useState<DeadlineInfo>(() =>
    computeDeadlineInfo(dueDate, completedAt ?? null)
  )

  useEffect(() => {
    // Recompute immediately when props change
    setInfo(computeDeadlineInfo(dueDate, completedAt ?? null))

    // Refresh every minute
    const interval = setInterval(() => {
      setInfo(computeDeadlineInfo(dueDate, completedAt ?? null))
    }, 60000)

    return () => clearInterval(interval)
  }, [dueDate, completedAt])

  if (info.status === "NO_DEADLINE") return null

  const pulseClass = info.isPulsing ? "animate-pulse" : ""

  if (compact) {
    return (
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${info.bgClass} ${info.colorClass} ${pulseClass}`}
      >
        <span
          className="material-symbols-outlined !text-[11px] leading-none"
          style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
        >
          {info.icon}
        </span>
        <span>{info.displayLabel}</span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${info.bgClass} ${info.colorClass} ${pulseClass}`}
    >
      <span
        className="material-symbols-outlined !text-[13px] leading-none"
        style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 20" }}
      >
        {info.icon}
      </span>
      <span>{info.displayLabel}</span>
    </span>
  )
}
