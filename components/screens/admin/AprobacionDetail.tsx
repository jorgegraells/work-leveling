"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Textarea } from "@/components/ui/textarea"
import type { MissionModule, ApprovalStatus } from "@prisma/client"

interface Objective {
  id: string
  title: string
  icon: string
  order: number
  xpReward: number
}

interface ApprovalMission {
  id: string
  title: string
  description: string | null
  module: MissionModule
  icon: string
  xpReward: number
  objectives: Objective[]
}

interface ApprovalUser {
  id: string
  name: string
  level: number
  avatarUrl: string | null
  title: string | null
}

interface UserMissionObjectiveDetail {
  id: string
  objectiveId: string
  status: string
  submittedAt: string | null
  managerApproved: boolean | null
  managerNote: string | null
  managerApprovedAt: string | null
  objective: Objective
}

interface ApprovalUserMission {
  id: string
  user: ApprovalUser
  mission: ApprovalMission
  objectives: UserMissionObjectiveDetail[]
}

export interface ApprovalWithFullDetails {
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

// MODULE_LABEL and ATTRIBUTES built inside component using t() for localization

type ScoreKey =
  | "scoreLogica"
  | "scoreCreatividad"
  | "scoreLiderazgo"
  | "scoreNegociacion"
  | "scoreEstrategia"
  | "scoreAnalisis"
  | "scoreComunicacion"
  | "scoreAdaptabilidad"

interface AttributeConfig {
  key: ScoreKey
  label: string
  color: string
  bgColor: string
}

export default function AprobacionDetail({
  approval,
}: {
  approval: ApprovalWithFullDetails
}) {
  const t = useTranslations("aprobaciones")
  const tCommon = useTranslations("common")
  const tAttr = useTranslations("attributes")
  const router = useRouter()
  const { userMission } = approval
  const { user, mission } = userMission

  const MODULE_LABEL: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const LEFT_ATTRIBUTES: AttributeConfig[] = [
    { key: "scoreLogica",      label: tAttr("logica"),      color: "bg-primary",               bgColor: "bg-primary/30" },
    { key: "scoreCreatividad", label: tAttr("creatividad"), color: "bg-tertiary",              bgColor: "bg-tertiary/30" },
    { key: "scoreLiderazgo",   label: tAttr("liderazgo"),   color: "bg-secondary",             bgColor: "bg-secondary/30" },
    { key: "scoreNegociacion", label: tAttr("negociacion"), color: "bg-on-tertiary-container", bgColor: "bg-on-tertiary-container/30" },
  ]

  const RIGHT_ATTRIBUTES: AttributeConfig[] = [
    { key: "scoreEstrategia",    label: tAttr("estrategia"),    color: "bg-outline",   bgColor: "bg-outline/30" },
    { key: "scoreAnalisis",      label: tAttr("analisis"),      color: "bg-tertiary",  bgColor: "bg-tertiary/30" },
    { key: "scoreComunicacion",  label: tAttr("comunicacion"),  color: "bg-secondary", bgColor: "bg-secondary/30" },
    { key: "scoreAdaptabilidad", label: tAttr("adaptabilidad"), color: "bg-primary",   bgColor: "bg-primary/30" },
  ]

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    scoreLogica: 3,
    scoreCreatividad: 3,
    scoreLiderazgo: 3,
    scoreNegociacion: 3,
    scoreEstrategia: 3,
    scoreAnalisis: 3,
    scoreComunicacion: 3,
    scoreAdaptabilidad: 3,
  })
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Per-objective review state
  const [objNotes, setObjNotes] = useState<Record<string, string>>({})
  const [objLoading, setObjLoading] = useState<Record<string, "approve" | "reject" | null>>({})
  const [objErrors, setObjErrors] = useState<Record<string, string | null>>({})
  const [localObjectives, setLocalObjectives] = useState<UserMissionObjectiveDetail[]>(
    userMission.objectives
  )

  const isAlreadyProcessed = approval.status !== "PENDING"

  const allObjectivesApproved =
    localObjectives.length === 0 ||
    localObjectives.every((o) => o.managerApproved === true)

  async function handleApprove() {
    setLoading("approve")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/${approval.id}/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, note: note || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("errorApproving"))
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
      setError(t("rejectReasonRequired"))
      return
    }
    setLoading("reject")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/${approval.id}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("errorRejecting"))
      }
      router.push("/admin/aprobaciones")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"))
    } finally {
      setLoading(null)
    }
  }

  async function handleObjectiveAction(objId: string, action: "approve" | "reject") {
    const note = objNotes[objId] ?? ""
    if (action === "reject" && !note.trim()) {
      setObjErrors((prev) => ({ ...prev, [objId]: t("rejectReasonRequired") }))
      return
    }
    setObjLoading((prev) => ({ ...prev, [objId]: action }))
    setObjErrors((prev) => ({ ...prev, [objId]: null }))
    try {
      const res = await fetch(`/api/aprobaciones/objetivos/${objId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: note || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || t("unknownError"))
      }
      const updated = await res.json()
      setLocalObjectives((prev) =>
        prev.map((o) =>
          o.id === objId
            ? {
                ...o,
                managerApproved: updated.managerApproved,
                managerNote: updated.managerNote,
                managerApprovedAt: updated.managerApprovedAt,
              }
            : o
        )
      )
    } catch (err) {
      setObjErrors((prev) => ({
        ...prev,
        [objId]: err instanceof Error ? err.message : t("unknownError"),
      }))
    } finally {
      setObjLoading((prev) => ({ ...prev, [objId]: null }))
    }
  }

  function ScoreSelector({ attr }: { attr: AttributeConfig }) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {attr.label}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((val) => {
            const isSelected = scores[attr.key] >= val
            return (
              <button
                key={val}
                type="button"
                disabled={isAlreadyProcessed}
                onClick={() =>
                  setScores((prev) => ({ ...prev, [attr.key]: val }))
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? `${attr.color} text-surface`
                    : "bg-surface-container-lowest text-outline hover:bg-surface-container-high"
                }`}
              >
                {val}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mission Info Card */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-lg ${MODULE_BG[mission.module]} flex items-center justify-center flex-shrink-0`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${MODULE_COLOR[mission.module]}`}
              >
                {mission.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {mission.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${MODULE_COLOR[mission.module]}`}
                >
                  {MODULE_LABEL[mission.module]}
                </span>
                <span className="text-[10px] font-bold text-primary">
                  +{mission.xpReward} XP
                </span>
              </div>
              {mission.description && (
                <p className="text-sm text-on-surface-variant mt-3">
                  {mission.description}
                </p>
              )}
            </div>
          </div>

          {/* Objectives */}
          {mission.objectives.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {t("objectives")}
              </p>
              <div className="space-y-1.5">
                {mission.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="flex items-center gap-2 text-sm text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-secondary text-base">
                      check_circle
                    </span>
                    <span>{obj.title}</span>
                    <span className="text-[10px] text-outline ml-auto">
                      +{obj.xpReward} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Info */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            {t("employee")}
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-xl">
                    person
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-body font-semibold text-on-surface">
                {user.name}
              </h3>
              <p className="text-[10px] text-primary uppercase tracking-widest">
                {t("level", { n: user.level })}
                {user.title ? ` - ${user.title}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Per-objective review */}
      {localObjectives.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("missionObjectives")}
            </p>
            <div className="space-y-4">
              {localObjectives.map((obj) => {
                const isApproved = obj.managerApproved === true
                const isRejected = obj.managerApproved === false
                const isReviewed = obj.managerApproved !== null
                const isSubmitted = !!obj.submittedAt
                const loadingState = objLoading[obj.id] ?? null
                const objError = objErrors[obj.id] ?? null

                return (
                  <div
                    key={obj.id}
                    className={`rounded-lg p-4 space-y-3 ${
                      isApproved
                        ? "bg-secondary/10 border border-secondary/20"
                        : isRejected
                          ? "bg-error/10 border border-error/20"
                          : isSubmitted
                            ? "bg-primary/10 border border-primary/20"
                            : "bg-surface-container-lowest border border-outline-variant/15"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-highest flex items-center justify-center flex-shrink-0">
                        <span className={`material-symbols-outlined text-base ${
                          isApproved ? "text-secondary" : isRejected ? "text-error" : "text-outline"
                        }`}>
                          {obj.objective.icon}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-on-surface">{obj.objective.title}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {!isSubmitted && (
                            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                              {t("objNotSubmitted")}
                            </span>
                          )}
                          {isSubmitted && !isReviewed && (
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                              {t("objPendingReview")}
                            </span>
                          )}
                          {isApproved && (
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {t("objApproved")}
                            </span>
                          )}
                          {isRejected && (
                            <span className="text-[10px] font-bold text-error uppercase tracking-widest flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">cancel</span>
                              {t("objRejected")}
                            </span>
                          )}
                          <span className="text-[10px] text-primary font-bold">+{obj.objective.xpReward} XP</span>
                        </div>
                        {isReviewed && obj.managerNote && (
                          <p className="text-xs text-on-surface-variant mt-1 italic">"{obj.managerNote}"</p>
                        )}
                      </div>
                    </div>

                    {/* Review controls — only if submitted and not yet reviewed and approval is still pending */}
                    {isSubmitted && !isReviewed && !isAlreadyProcessed && (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={objNotes[obj.id] ?? ""}
                          onChange={(e) =>
                            setObjNotes((prev) => ({ ...prev, [obj.id]: e.target.value }))
                          }
                          placeholder={t("notePlaceholder")}
                          rows={2}
                          className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface placeholder:text-outline text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-primary resize-none"
                        />
                        {objError && (
                          <p className="text-error text-xs">{objError}</p>
                        )}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={loadingState !== null}
                            onClick={() => handleObjectiveAction(obj.id, "approve")}
                            className="px-4 py-1.5 bg-secondary text-on-secondary rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {loadingState === "approve" && (
                              <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                            )}
                            {t("approve")}
                          </button>
                          <button
                            type="button"
                            disabled={loadingState !== null}
                            onClick={() => handleObjectiveAction(obj.id, "reject")}
                            className="px-4 py-1.5 bg-error/80 text-on-error rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            {loadingState === "reject" && (
                              <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                            )}
                            {t("reject")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Warning if not all approved */}
            {!isAlreadyProcessed && !allObjectivesApproved && (
              <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                <span className="material-symbols-outlined text-primary text-base">warning</span>
                <p className="text-xs text-primary font-medium">{t("allMissionsRequired")}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Attribute Scores */}
      {!isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("scoreByAttribute")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {LEFT_ATTRIBUTES.map((attr) => (
                  <ScoreSelector key={attr.key} attr={attr} />
                ))}
              </div>
              <div className="space-y-4">
                {RIGHT_ATTRIBUTES.map((attr) => (
                  <ScoreSelector key={attr.key} attr={attr} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note + Actions */}
      {!isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("noteRequired")}
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("notePlaceholder")}
              className="bg-surface-container-lowest border-outline-variant/30 text-on-surface placeholder:text-outline text-sm min-h-24"
            />

            {error && (
              <p className="text-error text-sm font-body">{error}</p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleApprove}
                disabled={loading !== null || !allObjectivesApproved}
                title={!allObjectivesApproved ? t("allMissionsRequired") : undefined}
                className="px-8 py-3 bg-secondary text-on-secondary rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "approve" && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                )}
                {t("approve")}
              </button>
              <button
                onClick={handleReject}
                disabled={loading !== null}
                className="px-8 py-3 bg-error/80 text-on-error rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "reject" && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                )}
                {t("reject")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already processed state */}
      {isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-outline mb-2 block">
              {approval.status === "APPROVED" ? "verified" : "cancel"}
            </span>
            <p className="text-on-surface font-body text-sm">
              {approval.status === "APPROVED" ? t("alreadyApproved") : t("alreadyRejected")}
            </p>
            {approval.note && (
              <p className="text-on-surface-variant text-sm mt-2">
                {t("noteLabel", { note: approval.note })}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
