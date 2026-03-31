import { computeDeadlineInfo } from "./deadline"

export type TimelinessCategory = "EARLY" | "ON_TIME" | "LATE" | "NO_DEADLINE"

export interface TimelinessRecord {
  completedAt: Date | string | null
  dueDate: Date | string | null
  userId?: string
  departmentId?: string | null
}

export interface TimelinessAggregate {
  total: number
  withDeadline: number
  early: number
  onTime: number
  late: number
  earlyPct: number
  onTimePct: number
  latePct: number
  avgDelayDays: number | null
}

export interface MonthBucket {
  month: string       // "Ene 2025" or "Jan 2025"
  periodStart: string // ISO
  early: number
  onTime: number
  late: number
  total: number
}

export function classifyTimeliness(
  completedAt: Date | string | null | undefined,
  dueDate: Date | string | null | undefined
): TimelinessCategory {
  if (!dueDate || !completedAt) return "NO_DEADLINE"
  const info = computeDeadlineInfo(dueDate, completedAt)
  if (info.status === "COMPLETED_EARLY") return "EARLY"
  if (info.status === "COMPLETED_ON_TIME") return "ON_TIME"
  if (info.status === "COMPLETED_LATE") return "LATE"
  return "NO_DEADLINE"
}

export function aggregateTimeliness(records: TimelinessRecord[]): TimelinessAggregate {
  const withDeadline = records.filter(r => r.dueDate && r.completedAt)
  const early = withDeadline.filter(r => classifyTimeliness(r.completedAt, r.dueDate) === "EARLY").length
  const onTime = withDeadline.filter(r => classifyTimeliness(r.completedAt, r.dueDate) === "ON_TIME").length
  const late = withDeadline.filter(r => classifyTimeliness(r.completedAt, r.dueDate) === "LATE")

  // Calculate avg delay for late completions
  const delays = late.map(r => {
    const due = new Date(r.dueDate!)
    const done = new Date(r.completedAt!)
    return (done.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)
  })
  const avgDelayDays = delays.length > 0 ? delays.reduce((a, b) => a + b, 0) / delays.length : null

  const total = records.length
  const wd = withDeadline.length

  return {
    total,
    withDeadline: wd,
    early,
    onTime,
    late: late.length,
    earlyPct: wd > 0 ? Math.round((early / wd) * 100) : 0,
    onTimePct: wd > 0 ? Math.round((onTime / wd) * 100) : 0,
    latePct: wd > 0 ? Math.round((late.length / wd) * 100) : 0,
    avgDelayDays: avgDelayDays !== null ? Math.round(avgDelayDays * 10) / 10 : null,
  }
}

// Build month buckets for the last N months
export function buildMonthBuckets(records: TimelinessRecord[], months: number, locale: string = "es"): MonthBucket[] {
  const now = new Date()
  const buckets: MonthBucket[] = []

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const periodStart = d.toISOString()
    const periodEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString()

    const monthRecords = records.filter(r => {
      if (!r.completedAt) return false
      const completed = new Date(r.completedAt)
      return completed >= new Date(periodStart) && completed <= new Date(periodEnd)
    })

    const agg = aggregateTimeliness(monthRecords)
    const monthLabel = d.toLocaleDateString(locale === "en" ? "en-US" : "es-ES", { month: "short", year: "numeric" })

    buckets.push({ month: monthLabel, periodStart, early: agg.early, onTime: agg.onTime, late: agg.late, total: monthRecords.length })
  }

  return buckets
}
