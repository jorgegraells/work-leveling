"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import OnTimeGauge from "./OnTimeGauge"
import TimelinessStackedBar from "./TimelinessStackedBar"
import TopPerformersLeaderboard from "./TopPerformersLeaderboard"
import DepartmentBreakdownTable from "./DepartmentBreakdownTable"
import type { TimelinessAggregate, MonthBucket } from "@/lib/kpi-helpers"
import type { TopPerformer } from "./TopPerformersLeaderboard"
import type { DeptRow } from "./DepartmentBreakdownTable"

interface Props {
  timeliness: TimelinessAggregate
  trend: MonthBucket[]
  topPerformers: TopPerformer[]
  byDepartment: DeptRow[]
  window: 30 | 60 | 90
  orgName: string
  xpEarnedInWindow: number
  missionsCompleted: number
  completionRate: number
}

export default function KpiDashboard({
  timeliness,
  trend,
  topPerformers,
  byDepartment,
  window: currentWindow,
  orgName,
  xpEarnedInWindow,
  missionsCompleted,
  completionRate,
}: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useTranslations("kpi")

  function setWindow(w: 30 | 60 | 90) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("window", String(w))
    router.push(`?${params.toString()}`)
  }

  function handleClickDept(deptId: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("dept", deptId)
    router.push(`?${params.toString()}`)
  }

  const windowOptions: { label: string; value: 30 | 60 | 90 }[] = [
    { label: t("window30"), value: 30 },
    { label: t("window60"), value: 60 },
    { label: t("window90"), value: 90 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{orgName}</p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">{t("title")}</h1>
          <p className="text-sm text-outline mt-1">{t("subtitle")}</p>
        </div>

        {/* Window tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-surface-container-highest">
          {windowOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setWindow(opt.value)}
              className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                currentWindow === opt.value
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-outline hover:text-on-surface"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: t("missionsCompleted"),
            value: missionsCompleted,
            icon: "check_circle",
            color: "text-secondary",
          },
          {
            label: t("completionRate"),
            value: `${completionRate}%`,
            icon: "bar_chart",
            color: "text-tertiary",
          },
          {
            label: t("xpEarned"),
            value: xpEarnedInWindow >= 1000
              ? `${(xpEarnedInWindow / 1000).toFixed(1).replace(/\.0$/, "")}k`
              : xpEarnedInWindow,
            icon: "bolt",
            color: "text-primary",
          },
          {
            label: t("onTimePct"),
            value: `${timeliness.earlyPct + timeliness.onTimePct}%`,
            icon: "timer",
            color: timeliness.earlyPct + timeliness.onTimePct >= 75 ? "text-secondary" : "text-error",
          },
        ].map(kpi => (
          <div
            key={kpi.label}
            className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
          >
            <div className="rounded-lg bg-surface-bright p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                <span className={`material-symbols-outlined text-xl ${kpi.color}`}>{kpi.icon}</span>
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-outline">{kpi.label}</p>
                <p className={`font-headline text-2xl font-bold ${kpi.color} mt-0.5`}>{kpi.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gauge + Trend row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* On-time gauge */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">{t("onTimePct")}</p>
            {timeliness.withDeadline === 0 ? (
              <div className="py-8 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-outline opacity-40 block">schedule</span>
                <p className="text-sm text-outline">{t("noDeadlineData")}</p>
                <p className="text-xs text-outline/60">{t("noDeadlineHint")}</p>
              </div>
            ) : (
              <OnTimeGauge
                onTimePct={timeliness.onTimePct}
                earlyPct={timeliness.earlyPct}
                latePct={timeliness.latePct}
              />
            )}
          </div>
        </div>

        {/* Stacked bar trend */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">{t("timelinessTrend")}</p>
            <TimelinessStackedBar data={trend} />
            {/* Legend */}
            <div className="flex gap-4 mt-3 flex-wrap">
              {[
                { color: "#78dc77", label: t("earlyPct") },
                { color: "#9ecaff", label: t("onTimePct") },
                { color: "#e46962", label: t("latePct") },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: l.color }} />
                  <span className="text-[9px] text-outline uppercase tracking-widest font-bold">{l.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">{t("topPerformers")}</p>
          <TopPerformersLeaderboard performers={topPerformers} />
        </div>
      </div>

      {/* Department breakdown */}
      {byDepartment.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">{t("department")}</p>
            <DepartmentBreakdownTable rows={byDepartment} onClickDept={handleClickDept} />
          </div>
        </div>
      )}

      {/* Avg delay summary */}
      {timeliness.avgDelayDays !== null && (
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-xl text-error">schedule</span>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-outline">{t("avgDelay")}</p>
              <p className="font-headline text-2xl font-bold text-error mt-0.5">
                {timeliness.avgDelayDays} {t("days")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
