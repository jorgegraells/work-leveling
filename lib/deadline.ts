export type DeadlineStatus =
  | "ON_TRACK"
  | "DUE_SOON"
  | "DEADLINE_CRITICAL"
  | "OVERDUE"
  | "COMPLETED_EARLY"
  | "COMPLETED_ON_TIME"
  | "COMPLETED_LATE"
  | "NO_DEADLINE"

export interface DeadlineInfo {
  status: DeadlineStatus
  hoursRemaining: number | null
  displayLabel: string
  colorClass: string    // Tailwind text color class
  bgClass: string       // Tailwind bg class
  isPulsing: boolean
  icon: string          // Material Symbol name
}

export function computeDeadlineInfo(
  dueDate: Date | string | null | undefined,
  completedAt: Date | string | null | undefined,
  now: Date = new Date()
): DeadlineInfo {
  if (!dueDate) return { status: "NO_DEADLINE", hoursRemaining: null, displayLabel: "", colorClass: "text-outline", bgClass: "bg-transparent", isPulsing: false, icon: "schedule" }

  const due = new Date(dueDate)
  const completed = completedAt ? new Date(completedAt) : null
  const hoursRemaining = (due.getTime() - now.getTime()) / (1000 * 60 * 60)

  if (completed) {
    const delayHours = (completed.getTime() - due.getTime()) / (1000 * 60 * 60)
    if (delayHours < -0.5) return { status: "COMPLETED_EARLY", hoursRemaining: null, displayLabel: "Entregado antes", colorClass: "text-secondary", bgClass: "bg-secondary/10", isPulsing: false, icon: "check_circle" }
    if (delayHours <= 24) return { status: "COMPLETED_ON_TIME", hoursRemaining: null, displayLabel: "A tiempo", colorClass: "text-secondary", bgClass: "bg-secondary/10", isPulsing: false, icon: "check_circle" }
    return { status: "COMPLETED_LATE", hoursRemaining: null, displayLabel: "Con retraso", colorClass: "text-outline", bgClass: "bg-surface-container-high", isPulsing: false, icon: "check_circle" }
  }

  if (hoursRemaining < 0) return { status: "OVERDUE", hoursRemaining, displayLabel: "VENCIDO", colorClass: "text-error", bgClass: "bg-error/10", isPulsing: true, icon: "alarm_off" }
  if (hoursRemaining < 24) return { status: "DEADLINE_CRITICAL", hoursRemaining, displayLabel: `CRÍTICO: ${formatCountdown(hoursRemaining)}`, colorClass: "text-error", bgClass: "bg-error/10", isPulsing: true, icon: "alarm_on" }
  if (hoursRemaining < 48) return { status: "DUE_SOON", hoursRemaining, displayLabel: formatCountdown(hoursRemaining), colorClass: "text-primary", bgClass: "bg-primary/10", isPulsing: false, icon: "alarm" }
  return { status: "ON_TRACK", hoursRemaining, displayLabel: formatCountdown(hoursRemaining), colorClass: "text-tertiary", bgClass: "bg-tertiary/10", isPulsing: false, icon: "schedule" }
}

export function formatCountdown(hoursRemaining: number): string {
  const abs = Math.abs(hoursRemaining)
  const days = Math.floor(abs / 24)
  const hours = Math.floor(abs % 24)
  if (days > 0) return `${days}d ${hours}h`
  const minutes = Math.floor((abs % 1) * 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
