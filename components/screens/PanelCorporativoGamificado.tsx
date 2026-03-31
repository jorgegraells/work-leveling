"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTranslations } from "next-intl"
import SidebarLayout from "@/components/layout/SidebarLayout"
import DeadlineBadge from "@/components/ui/DeadlineBadge"
import { computeDeadlineInfo } from "@/lib/deadline"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProjectCard {
  id: string
  missionId: string
  title: string
  module: string
  moduleKey: string
  accentColor: string
  icon: string
  xpReward: number
  priority: string
  progress: number
  status: string // PENDING, IN_PROGRESS, COMPLETED, ARCHIVED
  objectivesTotal: number
  objectivesCompleted: number
  approvalStatus?: string // "PENDING" | "APPROVED" | "REJECTED" | undefined
  dueDate?: string | null
  completedAt?: string | null
}

export interface PanelCorporativoGamificadoProps {
  userName: string
  userLevel: number
  userTitle: string
  userAvatarUrl?: string | null
  projects: ProjectCard[]
  currentProject?: ProjectCard
}

// ---------------------------------------------------------------------------
// Accent helpers
// ---------------------------------------------------------------------------

const ACCENT_TEXT: Record<string, string> = {
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  primary: "text-primary",
  "on-tertiary-container": "text-on-tertiary-container",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PanelCorporativoGamificado({
  userName,
  userLevel,
  userTitle,
  userAvatarUrl,
  projects,
  currentProject,
}: PanelCorporativoGamificadoProps) {
  const router = useRouter()
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)
  const [completing, setCompleting] = useState(false)
  const [sortMode, setSortMode] = useState<"default" | "urgency" | "deadline">("default")

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const sync = () => {
      setCanLeft(el.scrollLeft > 5)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
    }
    el.addEventListener("scroll", sync)
    window.addEventListener("resize", sync)
    sync()
    return () => {
      el.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
    }
  }, [])

  const slide = (dir: "left" | "right") => {
    const el = carouselRef.current
    if (el) el.scrollLeft += dir === "right" ? el.clientWidth : -el.clientWidth
  }

  const handleComplete = async () => {
    if (!currentProject || completing) return
    setCompleting(true)
    try {
      const res = await fetch(
        `/api/misiones/${currentProject.missionId}/completar`,
        { method: "POST" }
      )
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setCompleting(false)
    }
  }

  const t = useTranslations("misiones")

  const URGENCY_ORDER: Record<string, number> = {
    OVERDUE: 0,
    DEADLINE_CRITICAL: 1,
    DUE_SOON: 2,
    ON_TRACK: 3,
    NO_DEADLINE: 4,
    COMPLETED_EARLY: 5,
    COMPLETED_ON_TIME: 5,
    COMPLETED_LATE: 6,
  }

  const sortedProjects = useMemo(() => {
    if (sortMode === "default") return projects
    if (sortMode === "urgency") {
      return [...projects].sort((a, b) => {
        const aStatus = computeDeadlineInfo(a.dueDate ?? null, a.completedAt ?? null).status
        const bStatus = computeDeadlineInfo(b.dueDate ?? null, b.completedAt ?? null).status
        return (URGENCY_ORDER[aStatus] ?? 99) - (URGENCY_ORDER[bStatus] ?? 99)
      })
    }
    if (sortMode === "deadline") {
      return [...projects].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
    }
    return projects
  }, [projects, sortMode])

  const headerUser = {
    name: userName,
    level: userLevel,
    title: userTitle,
    avatarUrl: userAvatarUrl,
  }

  const isEmpty = projects.length === 0

  return (
    <SidebarLayout user={headerUser}>
      <div className="flex-1 flex flex-col w-full relative">
        {/* Top wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />

        <div className="flex-1 bg-surface px-4 sm:px-8 py-6 flex flex-col max-w-[1600px] mx-auto w-full overflow-y-auto overflow-x-hidden">
          {/* Level badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-surface-container-lowest px-8 py-3 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(233,196,0,0.1)]">
              <span className="text-sm font-black text-primary tracking-[0.2em] uppercase">
                {t("levelBadge", { n: userLevel })}
              </span>
            </div>
          </div>

          {isEmpty ? (
            /* Empty state */
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <span className="material-symbols-outlined text-outline !text-7xl">
                assignment
              </span>
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                {t("noProjectsAssigned")}
              </h2>
              <p className="text-outline text-sm max-w-md text-center">
                {t("noProjectsHint")}
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center gap-12">
              {/* Current project header */}
              {currentProject && (
                <header className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-10 bg-surface-container-highest rounded-xl shadow-card-lg relative overflow-hidden">
                  <div className="absolute top-3 left-8">
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                      {t("currentProject")}
                    </span>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0 w-full md:w-auto">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3">
                          <span
                            className={`material-symbols-outlined text-2xl ${ACCENT_TEXT[currentProject.accentColor] ?? "text-primary"}`}
                            style={{
                              fontVariationSettings: "'FILL' 1",
                            }}
                          >
                            {currentProject.icon}
                          </span>
                          <h1 className="text-xl md:text-2xl font-headline font-semibold tracking-wide text-on-surface">
                            {currentProject.title}
                          </h1>
                          <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                            +{currentProject.xpReward} XP
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-primary/80">
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            {currentProject.priority}
                          </span>
                          <span className="w-1 h-1 bg-outline-variant rounded-full" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                            {t("missionsCount", { completed: currentProject.objectivesCompleted, total: currentProject.objectivesTotal })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-8 md:mt-0">
                    {currentProject.status === "COMPLETED" && currentProject.approvalStatus === "APPROVED" ? (
                      <span className="px-8 py-3 bg-secondary/20 text-secondary font-bold rounded-lg uppercase text-xs tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        {t("completedBadge")}
                      </span>
                    ) : currentProject.status === "COMPLETED" ? (
                      <span className="px-8 py-3 bg-primary/20 text-primary font-bold rounded-lg uppercase text-xs tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-base">hourglass_top</span>
                        {t("pendingReview")}
                      </span>
                    ) : currentProject.objectivesCompleted >=
                      currentProject.objectivesTotal &&
                      currentProject.objectivesTotal > 0 ? (
                      <button
                        onClick={handleComplete}
                        disabled={completing}
                        className="px-8 py-3 bg-secondary text-on-secondary-fixed font-bold rounded-lg shadow-lg shadow-secondary/10 hover:brightness-110 transition-all active:scale-95 uppercase text-xs tracking-widest disabled:opacity-50"
                      >
                        {completing ? t("sending") : t("complete")}
                      </button>
                    ) : (
                      <Link
                        href={`/misiones/${currentProject.missionId}`}
                        className="px-8 py-3 bg-primary text-on-primary font-bold rounded-lg shadow-lg shadow-primary/10 hover:brightness-110 transition-all active:scale-95 uppercase text-xs tracking-widest"
                      >
                        {t("viewMissions")}
                      </Link>
                    )}
                  </div>
                </header>
              )}

              {/* Sort controls */}
              <div className="flex items-center gap-2 px-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Ordenar:
                </span>
                {(["default", "urgency", "deadline"] as const).map((mode) => {
                  const labels = { default: "Por defecto", urgency: "Urgencia", deadline: "Plazo" }
                  const isActive = sortMode === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setSortMode(mode)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95 ${
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "text-outline hover:bg-surface-container-high"
                      }`}
                    >
                      {labels[mode]}
                    </button>
                  )
                })}
              </div>

              {/* Project cards carousel */}
              <div className="relative group flex items-center">
                <button
                  onClick={() => slide("left")}
                  disabled={!canLeft}
                  className="absolute -left-4 md:-left-12 z-30 p-4 bg-surface-container-highest border border-primary/20 rounded-full text-primary shadow-xl hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-3xl">
                    chevron_left
                  </span>
                </button>

                <div
                  ref={carouselRef}
                  className="flex-1 flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2 py-4"
                >
                  {sortedProjects.map((p) => {
                    const accentClass =
                      ACCENT_TEXT[p.accentColor] ?? "text-primary"
                    const progressLabel =
                      p.objectivesTotal > 0
                        ? `${p.objectivesCompleted}/${p.objectivesTotal} (${p.progress}%)`
                        : `${p.progress}%`

                    if (p.status === "ARCHIVED") {
                      return (
                        <div
                          key={p.id}
                          className="min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.33%-16px)] xl:min-w-[calc(25%-18px)] snap-start relative rounded-xl bg-surface-container-highest p-1"
                        >
                          <div className="h-full w-full rounded-lg bg-surface-container-lowest p-6 md:p-8 flex flex-col items-center text-center opacity-60 grayscale">
                            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-6 md:mb-8">
                              {p.module}
                            </p>
                            <div className="mb-6 md:mb-8 text-outline">
                              <span
                                className="material-symbols-outlined !text-5xl md:!text-6xl"
                                style={{
                                  fontVariationSettings: "'FILL' 1",
                                }}
                              >
                                {p.icon}
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold text-outline mb-auto px-2">
                              {p.title}
                            </h3>
                            <div className="w-full mt-6 md:mt-8 mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-bold text-outline/50 uppercase">
                                  {t("archived")}
                                </span>
                                <span className="text-[10px] font-bold text-outline/50">
                                  {p.progress}%
                                </span>
                              </div>
                              <div className="w-full bg-surface-variant/30 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="bg-primary/20 h-full rounded-full"
                                  style={{ width: `${p.progress}%` }}
                                />
                              </div>
                            </div>
                            <button
                              disabled
                              className="w-full min-h-[52px] bg-surface-variant text-outline font-bold py-3 rounded-md cursor-not-allowed uppercase text-[10px] tracking-widest"
                            >
                              {t("archivedBadge")}
                            </button>
                          </div>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={p.id}
                        href={`/misiones/${p.missionId}`}
                        className="min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.33%-16px)] xl:min-w-[calc(25%-18px)] snap-start rounded-xl bg-surface-container-highest p-1 transition-all duration-300 hover:scale-[1.02] block"
                      >
                        <div className="h-full w-full rounded-lg bg-surface-bright p-6 md:p-8 flex flex-col items-center text-center glossy-card">
                          <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-6 md:mb-8">
                            {p.module}
                          </p>
                          <div className={`mb-6 md:mb-8 ${accentClass}`}>
                            <span
                              className="material-symbols-outlined !text-5xl md:!text-6xl"
                              style={{
                                fontVariationSettings: "'FILL' 1",
                              }}
                            >
                              {p.icon}
                            </span>
                          </div>
                          <h3 className="text-sm font-semibold text-on-surface mb-auto px-2">
                            {p.title}
                          </h3>
                          <div className="w-full mt-6 md:mt-8 mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[10px] font-bold text-outline uppercase">
                                {t("progress")}
                              </span>
                              <span className="text-[10px] font-bold text-primary">
                                {progressLabel}
                              </span>
                            </div>
                            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-primary h-full rounded-full"
                                style={{ width: `${p.progress}%` }}
                              />
                            </div>
                            {p.dueDate && (
                              <div className="flex justify-center mt-2">
                                <DeadlineBadge dueDate={p.dueDate ?? null} completedAt={p.completedAt ?? null} compact />
                              </div>
                            )}
                          </div>
                          {p.status === "COMPLETED" && p.approvalStatus === "APPROVED" ? (
                            <button className="w-full min-h-[52px] bg-secondary text-on-secondary-fixed font-bold py-3 rounded-md shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {t("completedBadge")}
                            </button>
                          ) : p.status === "COMPLETED" ? (
                            <button className="w-full min-h-[52px] bg-primary/20 text-primary font-bold py-3 rounded-md transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                              <span className="material-symbols-outlined text-sm">hourglass_top</span>
                              {t("underReview")}
                            </button>
                          ) : (
                            <button className="w-full min-h-[52px] bg-primary text-on-primary font-bold py-3 rounded-md transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest">
                              {p.status === "PENDING"
                                ? t("pending")
                                : t("inProgress")}
                            </button>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>

                <button
                  onClick={() => slide("right")}
                  disabled={!canRight}
                  className="absolute -right-4 md:-right-12 z-30 p-4 bg-surface-container-highest border border-primary/20 rounded-full text-primary shadow-xl hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
                >
                  <span className="material-symbols-outlined text-3xl">
                    chevron_right
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
