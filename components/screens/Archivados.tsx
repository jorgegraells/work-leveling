"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED"
type MissionModule = "VENTAS_LEADS" | "PROYECTOS_CRONOGRAMA" | "ALIANZAS_CONTRATOS" | "INFORMES_CUMPLIMIENTO" | "ESTRATEGIA_EXPANSION"

interface ArchivedMission {
  id: string
  status: string
  updatedAt: string
  mission: {
    id: string
    title: string
    icon: string
    module: MissionModule
    xpReward: number
  }
  approval: {
    status: ApprovalStatus
    note: string | null
    reviewedAt: string | null
    approver: { name: string } | null
  } | null
}

// MODULE_LABELS built inside component using t() for localization

const MODULE_COLOR: Record<MissionModule, { text: string; bg: string }> = {
  VENTAS_LEADS:          { text: "text-secondary",               bg: "bg-secondary/10" },
  PROYECTOS_CRONOGRAMA:  { text: "text-tertiary",                bg: "bg-tertiary/10" },
  ALIANZAS_CONTRATOS:    { text: "text-primary",                 bg: "bg-primary/10" },
  INFORMES_CUMPLIMIENTO: { text: "text-on-tertiary-container",   bg: "bg-on-tertiary-container/10" },
  ESTRATEGIA_EXPANSION:  { text: "text-outline",                 bg: "bg-outline/10" },
}


export default function Archivados({ archivedMissions }: { archivedMissions: ArchivedMission[] }) {
  const t = useTranslations("archivados")
  const tCommon = useTranslations("common")
  const [expanded, setExpanded] = useState<string | null>(null)

  const MODULE_LABELS: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const approvalStyle: Record<ApprovalStatus, { label: string; icon: string; className: string }> = {
    APPROVED: { label: t("approved"), icon: "check_circle", className: "text-secondary" },
    REJECTED: { label: t("rejected"), icon: "cancel",       className: "text-error" },
    PENDING:  { label: t("pending"),  icon: "pending",      className: "text-primary" },
  }

  if (archivedMissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <span className="material-symbols-outlined text-5xl text-outline">archive</span>
        <p className="text-sm text-outline">{t("empty")}</p>
        <p className="text-[10px] text-outline/60">{t("emptyHint")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {archivedMissions.map((um) => {
        const moduleColor = MODULE_COLOR[um.mission.module]
        const approvalInfo = um.approval ? approvalStyle[um.approval.status] : null
        const date = new Date(um.updatedAt).toLocaleDateString("es-ES", {
          day: "2-digit", month: "short", year: "numeric",
        })
        const isExpanded = expanded === um.id

        return (
          <div
            key={um.id}
            className="rounded-xl bg-surface-container-highest p-1"
          >
            <div className="rounded-lg bg-surface-bright overflow-hidden">
              <button
                onClick={() => setExpanded(isExpanded ? null : um.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-surface-container-high/30 transition-colors"
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${moduleColor.bg}`}>
                  <span className={`material-symbols-outlined text-xl ${moduleColor.text}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    {um.mission.icon}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${moduleColor.bg} ${moduleColor.text}`}>
                      {MODULE_LABELS[um.mission.module]}
                    </span>
                    {approvalInfo && (
                      <span className={`text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${approvalInfo.className}`}>
                        <span className="material-symbols-outlined text-xs"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          {approvalInfo.icon}
                        </span>
                        {approvalInfo.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-on-surface truncate">{um.mission.title}</p>
                  <p className="text-[11px] text-on-surface/50 mt-0.5">
                    {um.approval?.status === "APPROVED" ? `+${um.mission.xpReward} XP · ` : ""}
                    {t("archivedOn", { date })}
                  </p>
                </div>

                <span className={`material-symbols-outlined text-outline transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}>
                  expand_more
                </span>
              </button>

              {/* Expanded: approval note */}
              {isExpanded && um.approval && (
                <div className="px-4 pb-4 border-t border-outline-variant/10">
                  <div className="mt-3 p-3 bg-surface-container-lowest rounded-lg space-y-2">
                    {um.approval.approver && (
                      <p className="text-[10px] text-outline">
                        {t("reviewedBy")} <span className="text-on-surface font-semibold">{um.approval.approver.name}</span>
                        {um.approval.reviewedAt && (
                          <> {t("reviewedOn")} {new Date(um.approval.reviewedAt).toLocaleDateString()}</>
                        )}
                      </p>
                    )}
                    {um.approval.note && (
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1">{t("reviewerNote")}</p>
                        <p className="text-sm text-on-surface">{um.approval.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
