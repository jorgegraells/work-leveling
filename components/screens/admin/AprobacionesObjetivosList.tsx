"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { MissionModule } from "@prisma/client"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ObjectiveInfo {
  title: string
  icon: string
  xpReward: number
}

interface MissionInfo {
  id: string
  title: string
  module: MissionModule
  icon: string
  xpReward: number
  dueDate: string | null
  priority: string
  organizationId: string | null
  organization: { id: string; name: string } | null
}

interface UserInfo {
  id: string
  name: string
  level: number
  avatarUrl: string | null
}

interface UserMissionInfo {
  user: UserInfo
  mission: MissionInfo
}

export interface PendingObjectiveItem {
  id: string
  submittedAt: string | null
  objective: ObjectiveInfo
  userMission: UserMissionInfo
}

interface Props {
  pendingObjectives: PendingObjectiveItem[]
  selectedOrgId: string | null
  showAllOrgs: boolean
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

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

const PRIORITY_STYLE: Record<string, string> = {
  ALTA: "bg-error/20 text-error",
  NORMAL: "bg-outline/20 text-outline",
  BAJA: "bg-secondary/20 text-secondary",
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string, t: (key: string, values?: Record<string, number>) => string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t("justNow")
  if (mins < 60) return t("minutesAgo", { mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t("hoursAgo", { hours })
  const days = Math.floor(hours / 24)
  return t("daysAgo", { days })
}

function isDueSoon(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false
  const diff = new Date(dueDateStr).getTime() - Date.now()
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000 // within 3 days
}

function isOverdue(dueDateStr: string | null): boolean {
  if (!dueDateStr) return false
  return new Date(dueDateStr).getTime() < Date.now()
}

// ---------------------------------------------------------------------------
// Card sub-component
// ---------------------------------------------------------------------------

function ObjectiveCard({
  item,
  showOrg,
}: {
  item: PendingObjectiveItem
  showOrg: boolean
}) {
  const t = useTranslations("aprobaciones")
  const tCommon = useTranslations("common")
  const tNotif = useTranslations("notificaciones")

  const MODULE_LABEL: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const { objective, userMission } = item
  const { user, mission } = userMission

  const priorityStyle = PRIORITY_STYLE[mission.priority] ?? PRIORITY_STYLE["NORMAL"]
  const dueSoon = isDueSoon(mission.dueDate)
  const overdue = isOverdue(mission.dueDate)

  return (
    <Link
      href={`/admin/aprobaciones/objetivos/${item.id}`}
      className="group rounded-xl bg-surface-container-highest p-1 hover:scale-[1.02] transition-transform"
    >
      <div className="rounded-lg bg-surface-bright p-5 space-y-4 h-full flex flex-col">
        {/* Header: objective icon + title */}
        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-lg ${MODULE_BG[mission.module]} flex items-center justify-center flex-shrink-0`}
          >
            <span className={`material-symbols-outlined text-xl ${MODULE_COLOR[mission.module]}`}>
              {objective.icon}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-body font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
              {objective.title}
            </h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${MODULE_COLOR[mission.module]}`}>
              {MODULE_LABEL[mission.module]}
            </p>
          </div>
        </div>

        {/* Parent mission */}
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-surface-container-lowest">
          <span className={`material-symbols-outlined text-sm ${MODULE_COLOR[mission.module]}`}>
            {mission.icon}
          </span>
          <p className="text-[11px] text-outline truncate flex-1">{mission.title}</p>
        </div>

        {/* Company badge (when showing all orgs) */}
        {showOrg && mission.organization && (
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-outline">business</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {mission.organization.name}
            </span>
          </div>
        )}

        {/* User info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-surface-container-lowest overflow-hidden flex-shrink-0">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-sm">person</span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-body font-semibold text-on-surface truncate">{user.name}</p>
            <p className="text-[10px] text-outline">{t("level", { n: user.level })}</p>
          </div>
        </div>

        {/* Footer row */}
        <div className="mt-auto flex items-center justify-between pt-2 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-primary">+{objective.xpReward} XP</span>
            <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${priorityStyle}`}>
              {mission.priority}
            </span>
            {overdue && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-error/20 text-error">
                VENCIDO
              </span>
            )}
            {!overdue && dueSoon && (
              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                PRÓXIMO
              </span>
            )}
          </div>
          {item.submittedAt && (
            <span className="text-[10px] text-outline">{timeAgo(item.submittedAt, tNotif)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AprobacionesObjetivosList({
  pendingObjectives,
  selectedOrgId: _selectedOrgId,
  showAllOrgs,
}: Props) {
  const t = useTranslations("aprobaciones")

  type SortMode = "urgency" | "company"
  const [sortMode, setSortMode] = useState<SortMode>("urgency")

  const sorted = [...pendingObjectives].sort((a, b) => {
    if (sortMode === "company") {
      const aName = a.userMission.mission.organization?.name ?? ""
      const bName = b.userMission.mission.organization?.name ?? ""
      if (aName !== bName) return aName.localeCompare(bName)
    }
    // Default / fallback: submittedAt asc (oldest first = most urgent)
    const aTime = a.submittedAt ? new Date(a.submittedAt).getTime() : 0
    const bTime = b.submittedAt ? new Date(b.submittedAt).getTime() : 0
    return aTime - bTime
  })

  if (pendingObjectives.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-4 block">
            task_alt
          </span>
          <p className="text-on-surface font-body text-sm">{t("noObjectivesPending")}</p>
          <p className="text-outline text-[10px] uppercase tracking-widest mt-2">
            {t("allReviewed")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Sort toggle */}
      <div className="flex items-center gap-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
          {t("sortByUrgency") === t("sortByUrgency") ? "Ordenar:" : "Sort:"}
        </p>
        <button
          onClick={() => setSortMode("urgency")}
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
            sortMode === "urgency"
              ? "bg-primary/20 text-primary"
              : "text-outline hover:text-on-surface"
          }`}
        >
          {t("sortByUrgency")}
        </button>
        <button
          onClick={() => setSortMode("company")}
          className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full transition-colors ${
            sortMode === "company"
              ? "bg-primary/20 text-primary"
              : "text-outline hover:text-on-surface"
          }`}
        >
          {t("sortByCompany")}
        </button>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((item) => (
          <ObjectiveCard key={item.id} item={item} showOrg={showAllOrgs} />
        ))}
      </div>
    </div>
  )
}
