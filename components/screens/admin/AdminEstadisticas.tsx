"use client"

import { useTranslations } from "next-intl"

interface AdminStats {
  totalMissions: number
  totalAssigned: number
  completionRate: number
  pendingApprovals: number
  topPerformers: { name: string; level: number; xp: number; completedMissions: number }[]
  missionsByModule: { module: string; count: number; label: string }[]
}

const MODULE_COLOR: Record<string, string> = {
  VENTAS_LEADS: "bg-secondary",
  PROYECTOS_CRONOGRAMA: "bg-tertiary",
  ALIANZAS_CONTRATOS: "bg-primary",
  INFORMES_CUMPLIMIENTO: "bg-on-tertiary-container",
  ESTRATEGIA_EXPANSION: "bg-outline",
}

export default function AdminEstadisticas({ stats }: { stats: AdminStats }) {
  const t = useTranslations("adminEstadisticas")
  const maxModuleCount = Math.max(...stats.missionsByModule.map((m) => m.count), 1)

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-2xl font-bold mb-8">{t("title")}</h1>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KpiCard icon="military_tech"   label={t("kpiMissions")}   value={String(stats.totalMissions)}     accent="text-primary" />
        <KpiCard icon="assignment"      label={t("kpiAssigned")}   value={String(stats.totalAssigned)}     accent="text-tertiary" />
        <KpiCard icon="percent"         label={t("kpiCompletion")} value={`${stats.completionRate}%`}      accent="text-secondary" />
        <KpiCard icon="pending_actions" label={t("kpiPending")}    value={String(stats.pendingApprovals)}  accent="text-error" />
      </div>

      {/* Top Performers */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card mb-8">
        <div className="rounded-lg bg-surface-bright p-5">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            {t("topPerformers")}
          </h2>
          {stats.topPerformers.length === 0 ? (
            <p className="text-sm text-on-surface-variant">{t("noPerformers")}</p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-outline">
                    <th className="text-left py-2 pr-4">{t("colRank")}</th>
                    <th className="text-left py-2 pr-4">{t("colName")}</th>
                    <th className="text-left py-2 pr-4">{t("colLevel")}</th>
                    <th className="text-right py-2 pr-4">{t("colXp")}</th>
                    <th className="text-right py-2">{t("colMissions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topPerformers.map((p, i) => (
                    <tr
                      key={`${p.name}-${i}`}
                      className="border-t border-surface-container-highest"
                    >
                      <td className="py-2.5 pr-4 text-outline">{i + 1}</td>
                      <td className="py-2.5 pr-4 text-on-surface font-medium">{p.name}</td>
                      <td className="py-2.5 pr-4">
                        <span className="inline-flex items-center gap-1 text-primary text-xs font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                          <span className="material-symbols-outlined text-xs">star</span>
                          {p.level}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-right text-on-surface-variant">
                        {p.xp.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right text-on-surface-variant">
                        {p.completedMissions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

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
