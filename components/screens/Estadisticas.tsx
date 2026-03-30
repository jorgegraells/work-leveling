"use client"

import { useTranslations } from "next-intl"

interface UserStats {
  xpHistory: { date: string; amount: number }[]
  missionsByModule: { module: string; count: number; label: string }[]
  totalCompleted: number
  totalXp: number
  level: number
  attributes: { label: string; value: number; color: string }[]
}

const MODULE_COLOR: Record<string, string> = {
  VENTAS_LEADS: "bg-secondary",
  PROYECTOS_CRONOGRAMA: "bg-tertiary",
  ALIANZAS_CONTRATOS: "bg-primary",
  INFORMES_CUMPLIMIENTO: "bg-on-tertiary-container",
  ESTRATEGIA_EXPANSION: "bg-outline",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export default function Estadisticas({ stats }: { stats: UserStats }) {
  const t = useTranslations("estadisticas")
  const maxXp = Math.max(...stats.xpHistory.map((d) => d.amount), 1)
  const maxModuleCount = Math.max(...stats.missionsByModule.map((m) => m.count), 1)

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-2xl font-bold mb-8">{t("title")}</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <KpiCard icon="bolt" label={t("totalXp")} value={stats.totalXp.toLocaleString()} accent="text-primary" />
        <KpiCard icon="military_tech" label={t("completedMissions")} value={String(stats.totalCompleted)} accent="text-secondary" />
        <KpiCard icon="trending_up" label={t("currentLevel")} value={String(stats.level)} accent="text-tertiary" />
      </div>

      {/* XP History Chart */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card mb-8">
        <div className="rounded-lg bg-surface-bright p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            {t("xpLast30Days")}
          </h2>
          <div className="overflow-x-auto no-scrollbar">
            <svg
              viewBox={`0 0 ${stats.xpHistory.length * 24 + 20} 180`}
              className="w-full min-w-[600px] h-44"
              preserveAspectRatio="xMidYMid meet"
            >
              {stats.xpHistory.map((day, i) => {
                const barHeight = maxXp > 0 ? (day.amount / maxXp) * 130 : 0
                const x = i * 24 + 10
                const y = 140 - barHeight

                return (
                  <g key={day.date}>
                    {/* Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={16}
                      height={barHeight}
                      rx={3}
                      className="text-primary fill-current"
                      opacity={day.amount > 0 ? 1 : 0.15}
                    />
                    {/* Date label every 5 days */}
                    {i % 5 === 0 && (
                      <text
                        x={x + 8}
                        y={160}
                        textAnchor="middle"
                        className="fill-outline text-[8px] font-body"
                        fontSize="8"
                      >
                        {formatDate(day.date)}
                      </text>
                    )}
                    {/* Value on hover - show on top if > 0 */}
                    {day.amount > 0 && (
                      <text
                        x={x + 8}
                        y={y - 4}
                        textAnchor="middle"
                        className="fill-on-surface-variant text-[7px] font-body"
                        fontSize="7"
                      >
                        {day.amount}
                      </text>
                    )}
                  </g>
                )
              })}
              {/* Baseline */}
              <line
                x1="10"
                y1="140"
                x2={stats.xpHistory.length * 24 + 10}
                y2="140"
                className="stroke-outline-variant"
                strokeWidth="0.5"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Missions by Module */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              {t("missionsByModule")}
            </h2>
            {stats.missionsByModule.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{t("noMissions")}</p>
            ) : (
              <div className="space-y-3">
                {stats.missionsByModule.map((mod) => (
                  <div key={mod.module} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">{mod.label}</span>
                      <span className="text-on-surface font-medium">{mod.count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-lowest">
                      <div
                        className={`h-full rounded-full ${MODULE_COLOR[mod.module] ?? "bg-outline"}`}
                        style={{ width: `${(mod.count / maxModuleCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Attributes */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-5">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
              {t("attributes")}
            </h2>
            {stats.attributes.length === 0 ? (
              <p className="text-sm text-on-surface-variant">{t("noAttributes")}</p>
            ) : (
              <div className="space-y-3">
                {stats.attributes.map((attr) => (
                  <div key={attr.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-on-surface-variant">{attr.label}</span>
                      <span className="text-on-surface font-medium">{attr.value}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-lowest">
                      <div
                        className={`h-full rounded-full bg-${attr.color}`}
                        style={{ width: `${attr.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
      <div className="rounded-lg bg-surface-bright p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center">
          <span className={`material-symbols-outlined text-2xl ${accent}`}>{icon}</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{label}</p>
          <p className="font-headline text-2xl font-bold mt-1">{value}</p>
        </div>
      </div>
    </div>
  )
}
