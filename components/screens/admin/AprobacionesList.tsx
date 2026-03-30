"use client"

import Link from "next/link"
import { useTranslations } from "next-intl"
import type { MissionModule, ApprovalStatus } from "@prisma/client"

interface ApprovalUser {
  id: string
  name: string
  level: number
  avatarUrl: string | null
}

interface ApprovalMission {
  id: string
  title: string
  module: MissionModule
  icon: string
  xpReward: number
}

interface ApprovalUserMission {
  id: string
  completedAt: string | null
  user: ApprovalUser
  mission: ApprovalMission
}

export interface ApprovalWithDetails {
  id: string
  status: ApprovalStatus
  note: string | null
  createdAt: string
  userMission: ApprovalUserMission
}

const MODULE_COLOR: Record<MissionModule, string> = {
  VENTAS_LEADS: "text-secondary",
  PROYECTOS_CRONOGRAMA: "text-tertiary",
  ALIANZAS_CONTRATOS: "text-primary",
  INFORMES_CUMPLIMIENTO: "text-on-tertiary-container",
  ESTRATEGIA_EXPANSION: "text-outline",
}

const MODULE_BG: Record<MissionModule, string> = {
  VENTAS_LEADS: "bg-secondary/20",
  PROYECTOS_CRONOGRAMA: "bg-tertiary/20",
  ALIANZAS_CONTRATOS: "bg-primary/20",
  INFORMES_CUMPLIMIENTO: "bg-on-tertiary-container/20",
  ESTRATEGIA_EXPANSION: "bg-outline/20",
}

const MODULE_LABEL: Record<MissionModule, string> = {
  VENTAS_LEADS: "Ventas & Leads",
  PROYECTOS_CRONOGRAMA: "Proyectos",
  ALIANZAS_CONTRATOS: "Alianzas",
  INFORMES_CUMPLIMIENTO: "Informes",
  ESTRATEGIA_EXPANSION: "Estrategia",
}

const STATUS_STYLE: Record<ApprovalStatus, string> = {
  PENDING: "bg-primary/20 text-primary",
  APPROVED: "bg-secondary/20 text-secondary",
  REJECTED: "bg-error/20 text-error",
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Justo ahora"
  if (mins < 60) return `Hace ${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours}h`
  const days = Math.floor(hours / 24)
  return `Hace ${days}d`
}

export default function AprobacionesList({
  approvals,
}: {
  approvals: ApprovalWithDetails[]
}) {
  const t = useTranslations("aprobaciones")

  const STATUS_LABEL: Record<ApprovalStatus, string> = {
    PENDING: t("pending"),
    APPROVED: t("approved"),
    REJECTED: t("rejected"),
  }

  if (approvals.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-4 block">
            task_alt
          </span>
          <p className="text-on-surface font-body text-sm">
            {t("noPending")}
          </p>
          <p className="text-outline text-[10px] uppercase tracking-widest mt-2">
            {t("allReviewed")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {approvals.map((approval) => {
        const { userMission } = approval
        const { user, mission } = userMission

        return (
          <Link
            key={approval.id}
            href={`/admin/aprobaciones/${approval.id}`}
            className="group rounded-xl bg-surface-container-highest p-1 hover:scale-[1.02] transition-transform"
          >
            <div className="rounded-lg bg-surface-bright p-5 space-y-4 h-full flex flex-col">
              {/* Header: mission icon + title */}
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg ${MODULE_BG[mission.module]} flex items-center justify-center flex-shrink-0`}
                >
                  <span
                    className={`material-symbols-outlined text-xl ${MODULE_COLOR[mission.module]}`}
                  >
                    {mission.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-body font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                    {mission.title}
                  </h3>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest ${MODULE_COLOR[mission.module]}`}
                  >
                    {MODULE_LABEL[mission.module]}
                  </span>
                </div>
              </div>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-surface-container-lowest overflow-hidden flex-shrink-0">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-outline text-sm">
                        person
                      </span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-body font-semibold text-on-surface truncate">
                    {user.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] text-outline">{t("level", { n: user.level })}</p>
                    {userMission.completedAt && (
                      <>
                        <span className="w-0.5 h-0.5 bg-outline-variant rounded-full" />
                        <p className="text-[10px] text-outline">
                          {t("completed", { date: new Date(userMission.completedAt).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) })}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer: XP + status + date */}
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-primary">
                    +{mission.xpReward} XP
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${STATUS_STYLE[approval.status]}`}
                  >
                    {STATUS_LABEL[approval.status]}
                  </span>
                </div>
                <span className="text-[10px] text-outline">
                  {timeAgo(approval.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
