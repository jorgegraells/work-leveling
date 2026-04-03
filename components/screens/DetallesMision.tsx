"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import SidebarLayout from "@/components/layout/SidebarLayout"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ObjectiveData {
  id: string
  title: string
  xpReward: number
  order: number
  icon: string
  status: string // LOCKED | IN_PROGRESS | COMPLETED
  submittedAt?: string | null
  managerApproved?: boolean | null
  managerNote?: string | null
  userMissionObjectiveId?: string | null
}

export interface DetallesMisionProps {
  missionId: string
  userMissionId: string
  title: string
  description: string | null
  module: string
  moduleKey: string
  accentColor: string
  icon: string
  xpReward: number
  priority: string
  progress: number
  status: string // PENDING | IN_PROGRESS | COMPLETED | ARCHIVED
  approvalStatus?: string // "PENDING" | "APPROVED" | "REJECTED" | undefined
  objectives: ObjectiveData[]
  objectivesCompleted: number
  objectivesTotal: number
}

// ---------------------------------------------------------------------------
// Accent helpers
// ---------------------------------------------------------------------------

const ACCENT_MAP: Record<string, { text: string; bg: string; border: string }> = {
  secondary: {
    text: "text-secondary",
    bg: "bg-secondary-container/30",
    border: "border-secondary/20",
  },
  tertiary: {
    text: "text-tertiary",
    bg: "bg-tertiary-container/30",
    border: "border-tertiary/20",
  },
  primary: {
    text: "text-primary",
    bg: "bg-primary-container/30",
    border: "border-primary/20",
  },
  "on-tertiary-container": {
    text: "text-on-tertiary-container",
    bg: "bg-tertiary-container/20",
    border: "border-on-tertiary-container/20",
  },
}

// ---------------------------------------------------------------------------
// ObjectiveCard
// ---------------------------------------------------------------------------

function ObjectiveCard({
  obj,
  missionId,
  onCompleted,
  onSubmit,
  isCompleting,
  isSubmitting,
}: {
  obj: ObjectiveData
  missionId: string
  onCompleted: () => void
  onSubmit: () => void
  isCompleting: boolean
  isSubmitting: boolean
}) {
  const t = useTranslations("detallesMision")

  // Determine submission / manager review state
  const isSubmitted = !!obj.submittedAt
  const isApproved = obj.managerApproved === true
  const isRejected = obj.managerApproved === false
  const isPendingReview = isSubmitted && obj.managerApproved === null

  if (obj.status === "COMPLETED") {
    return (
      <div className={`group relative p-6 rounded-xl transition-all flex items-start gap-6 overflow-hidden border ${
        isApproved
          ? "bg-secondary/10 border-secondary/20"
          : isRejected
            ? "bg-error/10 border-error/20"
            : isPendingReview
              ? "bg-primary/10 border-primary/20"
              : "bg-surface-container-low border-transparent hover:border-secondary/20"
      }`}>
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <span className="material-symbols-outlined text-[120px]">
            check_circle
          </span>
        </div>
        <div className={`w-14 h-14 rounded-xl flex items-center justify-center border flex-shrink-0 ${
          isApproved
            ? "bg-secondary-container/20 border-secondary/20"
            : isRejected
              ? "bg-error/20 border-error/20"
              : "bg-secondary-container/20 border-secondary/20"
        }`}>
          <span className={`material-symbols-outlined text-3xl ${
            isApproved ? "text-secondary" : isRejected ? "text-error" : "text-secondary"
          }`}>
            {obj.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-3 flex-wrap">
            {isApproved && (
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {t("objManagerApproved")}
              </span>
            )}
            {isRejected && (
              <span className="text-[10px] font-bold text-error uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">cancel</span>
                {t("objManagerRejected")}
              </span>
            )}
            {isPendingReview && (
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">hourglass_top</span>
                {t("objSubmittedPending")}
              </span>
            )}
            {!isSubmitted && (
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                {t("objCompleted")}
              </span>
            )}
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              +{obj.xpReward} XP
            </span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface">
            {obj.title}
          </h3>
          {isRejected && obj.managerNote && (
            <p className="text-xs text-error/80 italic mt-1">"{obj.managerNote}"</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {isApproved && (
            <span
              className="material-symbols-outlined text-secondary"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
          )}
          {isRejected && (
            <span className="material-symbols-outlined text-error">cancel</span>
          )}
          {isPendingReview && (
            <span className="material-symbols-outlined text-primary">hourglass_top</span>
          )}
          {/* Show submit button if completed but not yet submitted (or rejected — allow resubmit) */}
          {(!isSubmitted || isRejected) && (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-primary/20 border border-primary/30 text-primary font-bold rounded-md hover:bg-primary/30 transition-all active:scale-95 uppercase text-[10px] tracking-widest disabled:opacity-50"
            >
              {isSubmitting ? "..." : t("objSubmitForReview")}
            </button>
          )}
        </div>
      </div>
    )
  }

  if (obj.status === "IN_PROGRESS") {
    return (
      <div className="group bg-surface-bright p-6 rounded-xl shadow-xl flex items-center gap-6 border border-secondary/40">
        <div className="w-14 h-14 bg-secondary-container/40 rounded-xl flex items-center justify-center border border-secondary/50 animate-pulse flex-shrink-0">
          <span className="material-symbols-outlined text-secondary text-3xl">
            {obj.icon}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">
              {t("objInProgress")}
            </span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
              +{obj.xpReward} XP
            </span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface">
            {obj.title}
          </h3>
        </div>
        <button
          onClick={onCompleted}
          disabled={isCompleting}
          className="px-4 py-2 bg-secondary text-on-secondary-fixed font-bold rounded-md shadow-lg shadow-secondary/10 hover:brightness-110 transition-all active:scale-95 uppercase text-[10px] tracking-widest flex-shrink-0 disabled:opacity-50"
        >
          {isCompleting ? "..." : t("objComplete")}
        </button>
      </div>
    )
  }

  // LOCKED
  return (
    <div className="group bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 opacity-60 grayscale">
      <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-outline text-3xl">
          lock
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
            {t("objLocked")}
          </span>
          <span className="w-1 h-1 bg-outline-variant rounded-full" />
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
            +{obj.xpReward} XP
          </span>
        </div>
        <h3 className="font-headline font-bold text-lg text-outline">
          {obj.title}
        </h3>
      </div>
      <span className="material-symbols-outlined text-outline-variant flex-shrink-0">
        lock_open
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DetallesMision({
  missionId,
  title,
  description,
  module,
  accentColor,
  icon,
  xpReward,
  priority,
  progress,
  status,
  approvalStatus,
  objectives,
  objectivesCompleted,
  objectivesTotal,
}: DetallesMisionProps) {
  const router = useRouter()
  const t = useTranslations("detallesMision")
  const [completingObj, setCompletingObj] = useState<string | null>(null)
  const [submittingObj, setSubmittingObj] = useState<string | null>(null)
  const [completingProject, setCompletingProject] = useState(false)
  const [completeError, setCompleteError] = useState<string | null>(null)

  const accent = ACCENT_MAP[accentColor] ?? ACCENT_MAP.primary

  const allDone = objectivesTotal > 0 && objectivesCompleted >= objectivesTotal

  const canCompleteProject =
    allDone &&
    status !== "COMPLETED" &&
    status !== "ARCHIVED"

  const handleCompleteObjective = async (objectiveId: string) => {
    setCompletingObj(objectiveId)
    try {
      const res = await fetch(
        `/api/misiones/${missionId}/objetivos/${objectiveId}`,
        { method: "PATCH" }
      )
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setCompletingObj(null)
    }
  }

  const handleSubmitObjective = async (objectiveId: string) => {
    setSubmittingObj(objectiveId)
    try {
      const res = await fetch(
        `/api/misiones/${missionId}/objetivos/${objectiveId}/submit`,
        { method: "POST" }
      )
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setSubmittingObj(null)
    }
  }

  const handleCompleteProject = async () => {
    setCompletingProject(true)
    setCompleteError(null)
    try {
      const res = await fetch(`/api/misiones/${missionId}/completar`, {
        method: "POST",
      })
      if (res.ok) {
        router.refresh()
      } else {
        const body = await res.json().catch(() => ({}))
        setCompleteError(body?.error ?? `Error ${res.status}`)
      }
    } catch {
      setCompleteError("Error de conexión")
    } finally {
      setCompletingProject(false)
    }
  }

  return (
    <SidebarLayout>
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col w-full relative">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Breadcrumb & Back */}
            <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
              <Link
                href="/objetivos"
                className="group flex items-center gap-3 px-6 py-3 wood-bezel rounded-xl border border-outline-variant/10 hover:border-secondary/30 transition-all active:scale-95"
              >
                <span className="material-symbols-outlined text-secondary">
                  arrow_back
                </span>
                <span className="font-headline font-extrabold text-xs uppercase tracking-[0.2em] text-on-surface">
                  {t("backToProjects")}
                </span>
              </Link>
              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-widest border flex items-center gap-1.5 ${
                    status === "COMPLETED" && approvalStatus === "APPROVED"
                      ? "bg-secondary/20 border-secondary/20 text-secondary"
                      : status === "COMPLETED"
                        ? "bg-primary/20 border-primary/20 text-primary"
                        : `${accent.bg} ${accent.border} ${accent.text}`
                  }`}
                >
                  {status === "COMPLETED" && approvalStatus === "APPROVED" ? (
                    <>
                      <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {t("statusCompleted")}
                    </>
                  ) : status === "COMPLETED" ? (
                    <>
                      <span className="material-symbols-outlined text-xs">hourglass_top</span>
                      {t("statusPendingReview")}
                    </>
                  ) : status === "ARCHIVED"
                    ? t("statusArchived")
                    : t("statusActive")}
                </span>
                <span className="px-3 py-1 bg-surface-container-highest text-outline text-[10px] font-bold uppercase rounded-full tracking-widest border border-outline/10">
                  {priority}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="mb-12 relative">
              <div className="flex items-center gap-4 mb-3">
                <span
                  className={`material-symbols-outlined !text-4xl ${accent.text}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {icon}
                </span>
                <span className="text-[10px] font-bold text-outline uppercase tracking-widest">
                  {module}
                </span>
              </div>
              <h1 className="font-headline font-black text-4xl md:text-5xl text-on-surface leading-tight tracking-tighter uppercase max-w-3xl">
                {title}
              </h1>
              {description && (
                <p className="text-outline text-sm mt-4 max-w-2xl">
                  {description}
                </p>
              )}
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left column -- 7 cols */}
              <div className="lg:col-span-7 space-y-8">
                {/* Progress Module */}
                <section className="p-1 bg-surface-container-highest rounded-xl shadow-2xl">
                  <div className="bg-surface-bright rounded-lg p-8">
                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline mb-1">
                          {t("statusLabel")}
                        </p>
                        <h3 className="font-headline font-extrabold text-2xl text-on-surface">
                          {status === "COMPLETED" && approvalStatus === "APPROVED"
                            ? t("statusProjectCompleted")
                            : status === "COMPLETED"
                              ? t("statusPendingReviewLong")
                              : status === "ARCHIVED"
                                ? t("statusArchivedLong")
                                : t("statusInProgress")}
                        </h3>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-4xl font-headline font-black ${accent.text}`}
                        >
                          {progress}%
                        </span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-6 w-full bg-surface-container-high rounded-full overflow-hidden p-1">
                      <div
                        className="h-full bg-secondary rounded-full shadow-[0_0_20px_rgba(120,220,119,0.4)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline-variant">
                      <span>
                        {t("missionsCount", { completed: objectivesCompleted, total: objectivesTotal })}
                      </span>
                      <span>{t("xpTotal", { xp: xpReward })}</span>
                    </div>
                  </div>
                </section>

                {/* Objectives */}
                <div className="space-y-4">
                  <h4 className="font-headline font-extrabold text-sm uppercase tracking-widest text-outline ml-2">
                    {t("dailyMissions")}
                  </h4>
                  {objectives.map((obj) => (
                    <ObjectiveCard
                      key={obj.id}
                      obj={obj}
                      missionId={missionId}
                      onCompleted={() => handleCompleteObjective(obj.id)}
                      onSubmit={() => handleSubmitObjective(obj.id)}
                      isCompleting={completingObj === obj.id}
                      isSubmitting={submittingObj === obj.id}
                    />
                  ))}
                  {objectives.length === 0 && (
                    <div className="text-center py-12 text-outline">
                      <span className="material-symbols-outlined !text-5xl mb-4 block">
                        assignment
                      </span>
                      <p className="text-sm">
                        {t("noMissions")}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right column -- 5 cols */}
              <div className="lg:col-span-5 space-y-8">
                {/* Rewards */}
                <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
                  <h4 className="font-headline font-black text-xl mb-6 uppercase tracking-tight text-on-surface">
                    {t("rewardsTitle")}
                  </h4>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-primary">
                            military_tech
                          </span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">
                          {t("xpLabel")}
                        </span>
                      </div>
                      <span className="text-lg font-headline font-black text-primary">
                        {xpReward.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Complete project action */}
                <div className="p-6 wood-bezel rounded-xl flex flex-col gap-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-outline">
                    {canCompleteProject
                      ? t("actionAllDone")
                      : status === "COMPLETED" && approvalStatus === "APPROVED"
                        ? t("actionApproved")
                        : status === "COMPLETED"
                          ? t("actionSentForApproval")
                          : t("actionCompleteMissions")}
                  </h4>
                  <p className="text-sm font-medium text-on-surface leading-snug">
                    {canCompleteProject
                      ? t("descAllDone")
                      : status === "COMPLETED" && approvalStatus === "APPROVED"
                        ? t("descApproved")
                        : status === "COMPLETED"
                          ? t("descSentForApproval")
                          : t("descRemaining", { count: objectivesTotal - objectivesCompleted })}
                  </p>
                  {status === "COMPLETED" && approvalStatus !== "APPROVED" && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-lg">hourglass_top</span>
                      <p className="text-xs text-primary font-medium">
                        {t("pendingReviewNote")}
                      </p>
                    </div>
                  )}
                  {canCompleteProject ? (
                    <>
                      <button
                        onClick={handleCompleteProject}
                        disabled={completingProject}
                        className="mt-2 w-full py-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-black text-xs uppercase tracking-[0.2em] rounded-md shadow-lg active:scale-95 transition-all disabled:opacity-50"
                      >
                        {completingProject
                          ? t("sendingButton")
                          : t("completeProjectButton")}
                      </button>
                      {completeError && (
                        <p className="text-error text-xs font-medium text-center mt-2">{completeError}</p>
                      )}
                    </>
                  ) : status === "COMPLETED" && approvalStatus === "APPROVED" ? (
                    <div className="mt-2 w-full py-4 bg-secondary/20 text-secondary font-black text-xs uppercase tracking-[0.2em] rounded-md text-center flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      {t("completedBadge")}
                    </div>
                  ) : status === "COMPLETED" ? (
                    <div className="mt-2 w-full py-4 bg-primary/20 text-primary font-black text-xs uppercase tracking-[0.2em] rounded-md text-center flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">hourglass_top</span>
                      {t("pendingBadge")}
                    </div>
                  ) : (
                    <div className="mt-2 w-full py-4 bg-surface-variant text-outline font-black text-xs uppercase tracking-[0.2em] rounded-md text-center cursor-not-allowed">
                      {t("completeProjectButton")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  )
}
