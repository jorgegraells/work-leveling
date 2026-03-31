"use client"

export interface DeptRow {
  departmentId: string
  departmentName: string
  total: number
  withDeadline: number
  onTimePct: number
  latePct: number
  avgDelayDays: number | null
}

interface Props {
  rows: DeptRow[]
  onClickDept: (deptId: string) => void
}

export default function DepartmentBreakdownTable({ rows, onClickDept }: Props) {
  if (!rows.length) {
    return (
      <div className="py-8 text-center space-y-2">
        <span className="material-symbols-outlined text-3xl text-outline opacity-40 block">corporate_fare</span>
        <p className="text-outline text-sm">Sin datos de departamentos en este período</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      {/* Header */}
      <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 px-3 pb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Departamento</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-12 text-center">Total</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-28 text-center hidden sm:block">A tiempo %</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-20 text-center">Retraso %</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-outline w-20 text-center hidden md:block">Retraso prom.</span>
      </div>

      {rows.map(row => (
        <button
          key={row.departmentId}
          onClick={() => onClickDept(row.departmentId)}
          className="w-full grid grid-cols-[1fr_auto_auto_auto_auto] gap-3 items-center px-3 py-2.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high transition-colors active:scale-[0.98] text-left"
        >
          {/* Dept name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-surface-container-high flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-sm text-outline">corporate_fare</span>
            </div>
            <span className="text-[12px] font-medium text-on-surface truncate">{row.departmentName}</span>
          </div>

          {/* Total */}
          <div className="w-12 text-center">
            <span className="text-[11px] font-bold text-on-surface">{row.total}</span>
          </div>

          {/* On time % with progress bar */}
          <div className="w-28 hidden sm:block">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                <div
                  className="h-full rounded-full bg-tertiary transition-all"
                  style={{ width: `${row.onTimePct}%` }}
                />
              </div>
              <span className="text-[10px] font-bold text-tertiary w-8 text-right">{row.onTimePct}%</span>
            </div>
          </div>

          {/* Late % */}
          <div className="w-20 text-center">
            <span className={`text-[11px] font-bold ${row.latePct > 30 ? "text-error" : row.latePct > 15 ? "text-primary" : "text-outline"}`}>
              {row.latePct}%
            </span>
          </div>

          {/* Avg delay */}
          <div className="w-20 text-center hidden md:block">
            {row.avgDelayDays !== null ? (
              <span className="text-[11px] font-bold text-error">{row.avgDelayDays}d</span>
            ) : (
              <span className="text-[11px] text-outline/40">—</span>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
