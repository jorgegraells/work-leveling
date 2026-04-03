"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { MissionModule } from "@prisma/client"

// ─── Types ───────────────────────────────────────────────────────────────────

interface MissionObjective {
  id: string
  title: string
  icon: string
  order: number
  xpReward: number
}

interface UserMissionObjectiveRecord {
  id: string
  objectiveId: string
  status: string
  submittedAt: string | null
  managerApproved: boolean | null
  managerNote: string | null
  managerApprovedAt: string | null
}

interface Organization {
  id: string
  name: string
}

interface Mission {
  id: string
  title: string
  module: MissionModule
  icon: string
  xpReward: number
  description: string | null
  organization: Organization | null
  objectives: MissionObjective[]
}

interface Employee {
  id: string
  name: string
  level: number
  avatarUrl: string | null
  title: string | null
}

interface UserMission {
  id: string
  user: Employee
  mission: Mission
  objectives: UserMissionObjectiveRecord[]
}

export interface UserObjectiveWithContext {
  id: string
  objectiveId: string
  status: string
  submittedAt: string | null
  managerApproved: boolean | null
  managerNote: string | null
  managerApprovedAt: string | null
  objective: MissionObjective
  userMission: UserMission
}

// ─── Constants ───────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getObjectiveStatus(obj: UserMissionObjectiveRecord): "approved" | "rejected" | "submitted" | "pending" {
  if (obj.managerApproved === true) return "approved"
  if (obj.managerApproved === false) return "rejected"
  if (obj.submittedAt) return "submitted"
  return "pending"
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function AprobacionObjetivoDetail({
  userObjective,
}: {
  userObjective: UserObjectiveWithContext
}) {
  const t = useTranslations("aprobacionObjetivo")
  const tCommon = useTranslations("common")
  const router = useRouter()

  const { objective, userMission } = userObjective
  const { user, mission } = userMission

  const MODULE_LABEL: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const [note, setNote] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAlreadyReviewed = userObjective.managerApproved !== null
  const isApproved = userObjective.managerApproved === true
  const isRejected = userObjective.managerApproved === false

  async function handleApprove() {
    setLoading("approve")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/objetivos/${userObjective.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t("unknownError"))
      }
      router.push("/admin/aprobaciones")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"))
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!note.trim()) {
      setError(t("noteRequired"))
      return
    }
    setLoading("reject")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/objetivos/${userObjective.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", note }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? t("unknownError"))
      }
      router.push("/admin/aprobaciones")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"))
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Header: objective + mission info ── */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6 space-y-4">
          {/* Objective */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-lg ${MODULE_BG[mission.module]} flex items-center justify-center flex-shrink-0`}
            >
              <span className={`material-symbols-outlined text-2xl ${MODULE_COLOR[mission.module]}`}>
                {objective.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {objective.title}
              </h2>
              <p className="text-sm text-on-surface-variant mt-0.5">{mission.title}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${MODULE_COLOR[mission.module]}`}>
                  {MODULE_LABEL[mission.module]}
                </span>
                {mission.organization && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-outline border border-outline/30 px-2 py-0.5 rounded-full">
                    {mission.organization.name}
                  </span>
                )}
                <span className="text-[10px] font-bold text-primary">+{objective.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Employee card ── */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            {t("employee")}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-xl">person</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-body font-semibold text-on-surface">{user.name}</h3>
              <p className="text-[10px] text-primary uppercase tracking-widest">
                {tCommon("level")} {user.level}
                {user.title ? ` - ${user.title}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Progress context: all objectives in parent mission ── */}
      {mission.objectives.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("progressContext")}
            </p>
            <div className="space-y-2">
              {mission.objectives.map((obj) => {
                const userObj = userMission.objectives.find((uo) => uo.objectiveId === obj.id)
                const isCurrentObj = obj.id === userObjective.objectiveId
                const objStatus = userObj ? getObjectiveStatus(userObj) : "pending"

                const statusColor =
                  objStatus === "approved" ? "text-secondary" :
                  objStatus === "rejected" ? "text-error" :
                  objStatus === "submitted" ? "text-primary" :
                  "text-outline"

                const statusIcon =
                  objStatus === "approved" ? "check_circle" :
                  objStatus === "rejected" ? "cancel" :
                  objStatus === "submitted" ? "schedule" :
                  "radio_button_unchecked"

                const statusFill = objStatus === "approved" || objStatus === "rejected"
                  ? "'FILL' 1"
                  : "'FILL' 0"

                return (
                  <div
                    key={obj.id}
                    className={`flex items-center gap-3 p-2.5 rounded-lg transition-colors ${
                      isCurrentObj
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-surface-container-lowest"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-base flex-shrink-0 ${statusColor}`}
                      style={{ fontVariationSettings: statusFill }}
                    >
                      {statusIcon}
                    </span>
                    <span className={`text-sm flex-1 min-w-0 truncate ${isCurrentObj ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>
                      {obj.title}
                    </span>
                    {isCurrentObj && (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary flex-shrink-0">
                        ← {t("currentObjective")}
                      </span>
                    )}
                    <span className="text-[10px] text-outline flex-shrink-0">+{obj.xpReward} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Action card (only if not yet reviewed) ── */}
      {!isAlreadyReviewed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("title")}
            </p>

            {/* Reject textarea */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                {t("rejectPlaceholder")}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t("rejectPlaceholder")}
                rows={3}
                className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            {error && <p className="text-error text-sm font-body">{error}</p>}

            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={handleApprove}
                disabled={loading !== null}
                className="px-8 py-3 bg-secondary text-on-secondary rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "approve" && (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                )}
                {t("approveBtn")}
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={loading !== null}
                className="px-8 py-3 bg-error/80 text-on-error rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "reject" && (
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                )}
                {t("rejectBtn")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Already reviewed card ── */}
      {isAlreadyReviewed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 text-center space-y-4">
            <span className="material-symbols-outlined text-3xl mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }} aria-hidden="true">
              {isApproved ? "verified" : "cancel"}
            </span>
            <p className={`font-body text-sm font-semibold ${isApproved ? "text-secondary" : "text-error"}`}>
              {isApproved ? t("alreadyApproved") : t("alreadyRejected")}
            </p>
            {userObjective.managerNote && (
              <p className="text-on-surface-variant text-sm italic">
                &ldquo;{userObjective.managerNote}&rdquo;
              </p>
            )}
            {isRejected && (
              <button
                type="button"
                onClick={() => router.push("/admin/aprobaciones")}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-primary/30 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                {t("backToApprovals")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
