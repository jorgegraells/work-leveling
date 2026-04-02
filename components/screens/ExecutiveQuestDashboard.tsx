"use client"

import { useTranslations } from "next-intl"
import SidebarLayout from "@/components/layout/SidebarLayout"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ActiveProject {
  id: string
  missionId: string
  title: string
  icon: string
  module: string
  progress: number
  objectivesTotal: number
  objectivesCompleted: number
  status: string
  approvalStatus?: string
}

export interface PendingObjective {
  id: string
  title: string
  icon: string
  projectTitle: string
  missionId: string
  xpReward: number
}

export interface ActivityItem {
  id: string
  type: "MISSION_COMPLETED" | "MISSION_APPROVED" | "MISSION_REJECTED" | "MISSION_ASSIGNED" | "LEVEL_UP" | string
  title: string
  body: string
  createdAt: string
}

export interface DashboardProps {
  userName: string
  userTitle: string
  userLevel: number
  userAvatarUrl?: string | null
  rankProgress: number
  totalXp: number
  trophies: number
  kredits: string
  activeProjects: ActiveProject[]
  pendingObjectives: PendingObjective[]
  recentActivity: ActivityItem[]
  completedCount: number
  inProgressCount: number
  pendingApprovalCount?: number
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ACTIVITY_ICON: Record<string, string> = {
  MISSION_COMPLETED: "check_circle",
  MISSION_APPROVED:  "verified",
  MISSION_REJECTED:  "cancel",
  MISSION_ASSIGNED:  "assignment",
  LEVEL_UP:          "arrow_upward",
}

const ACTIVITY_COLOR: Record<string, string> = {
  MISSION_COMPLETED: "text-secondary",
  MISSION_APPROVED:  "text-primary",
  MISSION_REJECTED:  "text-error",
  MISSION_ASSIGNED:  "text-tertiary",
  LEVEL_UP:          "text-primary",
}

function timeAgo(dateStr: string, nowLabel: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return nowLabel
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  return `${days}d`
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExecutiveQuestDashboard({
  userName,
  userTitle,
  userLevel,
  userAvatarUrl,
  rankProgress,
  totalXp,
  trophies,
  kredits,
  activeProjects,
  pendingObjectives,
  recentActivity,
  completedCount,
  inProgressCount,
  pendingApprovalCount,
}: DashboardProps) {
  const t = useTranslations("dashboard")
  const tc = useTranslations("common")
  const headerUser = { name: userName, level: userLevel, title: userTitle, avatarUrl: userAvatarUrl }

  return (
    <SidebarLayout user={headerUser}>
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />

        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-8 overflow-y-auto">

          {/* ── Welcome header ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-headline font-black text-on-surface">
                {t("welcome", { name: userName.split(" ")[0] })}
              </h1>
              <p className="text-outline text-[10px] uppercase tracking-widest mt-1">{userTitle}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-surface-container-lowest px-5 py-2 rounded-full border border-primary/20">
                <span className="text-xs font-black text-primary tracking-[0.15em] uppercase">
                  {t("levelBadge", { n: userLevel })}
                </span>
              </div>
              <div className="bg-surface-container-lowest px-4 py-2 rounded-full border border-outline-variant/20">
                <span className="text-xs font-bold text-outline tracking-wider">
                  {rankProgress}% → {userLevel + 1}
                </span>
              </div>
            </div>
          </div>

          {/* ── Pending approvals banner ── */}
          {pendingApprovalCount != null && pendingApprovalCount > 0 && (
            <div className="rounded-xl bg-surface-container-highest p-1">
              <div className="rounded-lg bg-surface-bright px-4 py-3 flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  pending_actions
                </span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-on-surface">
                    {pendingApprovalCount} {pendingApprovalCount === 1 ? "misión pendiente de revisión" : "misiones pendientes de revisión"}
                  </p>
                  <p className="text-xs text-outline">Tu manager revisará tu trabajo pronto</p>
                </div>
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 animate-pulse" />
              </div>
            </div>
          )}

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: tc("xpTotal"),     value: totalXp.toLocaleString(), icon: "bolt",          color: "text-primary" },
              { label: tc("inProgress"),  value: String(inProgressCount),  icon: "pending",       color: "text-tertiary" },
              { label: tc("completed"),   value: String(completedCount),   icon: "task_alt",      color: "text-secondary" },
              { label: tc("trophies"),    value: String(trophies),         icon: "emoji_events",  color: "text-primary" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-xl bg-surface-container-highest p-1">
                <div className="bg-surface-bright rounded-lg p-5 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center ${kpi.color}`}>
                    <span className="material-symbols-outlined">{kpi.icon}</span>
                  </div>
                  <div>
                    <div className="text-xl font-headline font-black text-on-surface">{kpi.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-outline">{kpi.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Main grid: Projects + Objectives ── */}
          <div className="grid grid-cols-12 gap-6">

            {/* Active projects */}
            <div className="col-span-12 lg:col-span-7 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <div className="bg-surface-bright rounded-lg h-full p-6 border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface">{t("activeProjects")}</h3>
                    <p className="text-outline text-[9px] uppercase tracking-widest mt-0.5">{t("currentAssignments")}</p>
                  </div>
                  <Link href="/objetivos" className="text-primary text-[10px] font-bold uppercase tracking-widest hover:underline">
                    {t("viewAll")}
                  </Link>
                </div>

                {activeProjects.length > 0 ? (
                  <div className="space-y-3">
                    {activeProjects.map((p) => (
                      <Link
                        key={p.id}
                        href={`/objetivos/${p.missionId}`}
                        className="flex items-center gap-4 p-4 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high transition-colors group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary flex-shrink-0">
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">{p.title}</div>
                          <div className="text-[9px] text-outline uppercase tracking-wider">{p.objectivesCompleted}/{p.objectivesTotal} {tc("missions")}</div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          {p.status === "COMPLETED" && p.approvalStatus !== "APPROVED" ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/20 text-primary flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs">hourglass_top</span>
                              {tc("underReview")}
                            </span>
                          ) : p.status === "COMPLETED" && p.approvalStatus === "APPROVED" ? (
                            <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-secondary/20 text-secondary flex items-center gap-1">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                              {tc("completedBadge")}
                            </span>
                          ) : (
                            <>
                              <div className="w-20 bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                                <div className="bg-primary h-full rounded-full" style={{ width: `${p.progress}%` }} />
                              </div>
                              <span className="text-[10px] font-bold text-primary min-w-[35px] text-right">{p.progress}%</span>
                            </>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-outline/30 mb-3">folder_open</span>
                    <p className="text-outline text-sm">{t("noActiveProjects")}</p>
                    <p className="text-outline/60 text-xs mt-1">{t("adminWillAssign")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending objectives today */}
            <div className="col-span-12 lg:col-span-5 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <div className="bg-surface-bright rounded-lg h-full p-6 border border-outline-variant/10">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-headline font-bold text-on-surface">{t("pendingMissions")}</h3>
                    <p className="text-outline text-[9px] uppercase tracking-widest mt-0.5">{t("tasksToComplete")}</p>
                  </div>
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold">
                    {pendingObjectives.length}
                  </div>
                </div>

                {pendingObjectives.length > 0 ? (
                  <div className="space-y-2">
                    {pendingObjectives.map((obj) => (
                      <Link
                        key={obj.id}
                        href={`/objetivos/${obj.missionId}`}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-container-lowest transition-colors group"
                      >
                        <div className="w-8 h-8 rounded bg-surface-container-lowest flex items-center justify-center text-tertiary flex-shrink-0 group-hover:text-primary transition-colors">
                          <span className="material-symbols-outlined text-lg">{obj.icon}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-on-surface truncate">{obj.title}</div>
                          <div className="text-[9px] text-outline uppercase tracking-wider truncate">{obj.projectTitle}</div>
                        </div>
                        <span className="text-[9px] font-bold text-primary">+{obj.xpReward} XP</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-5xl text-secondary/40 mb-3">task_alt</span>
                    <p className="text-outline text-sm">{t("allCaughtUp")}</p>
                    <p className="text-outline/60 text-xs mt-1">{t("noPendingMissions")}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Bottom row: Activity + Quick stats ── */}
          <div className="grid grid-cols-12 gap-6">

            {/* Recent activity */}
            <div className="col-span-12 md:col-span-8 rounded-xl bg-surface-container-highest p-1">
              <div className="bg-surface-bright rounded-lg h-full p-6 border border-outline-variant/10">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">{t("recentActivity")}</h3>

                {recentActivity.length > 0 ? (
                  <div className="space-y-2">
                    {recentActivity.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 py-2">
                        <span className={`material-symbols-outlined text-lg ${ACTIVITY_COLOR[a.type] ?? "text-outline"}`}>
                          {ACTIVITY_ICON[a.type] ?? "info"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-on-surface">{a.title}</span>
                          <span className="text-xs text-outline ml-2">{a.body}</span>
                        </div>
                        <span className="text-[9px] text-outline/60 flex-shrink-0">{timeAgo(a.createdAt, tc("now"))}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-outline text-sm py-4">{t("noRecentActivity")}</p>
                )}
              </div>
            </div>

            {/* Quick stats */}
            <div className="col-span-12 md:col-span-4 rounded-xl bg-surface-container-highest p-1">
              <div className="bg-surface-bright rounded-lg h-full p-6 border border-outline-variant/10 flex flex-col justify-between">
                <h3 className="text-lg font-headline font-bold text-on-surface mb-4">{t("summary")}</h3>
                <div className="space-y-4 flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{tc("kredits")}</span>
                    <span className="text-secondary font-black text-lg">{kredits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{tc("trophies")}</span>
                    <span className="text-primary font-black text-lg">{trophies}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{tc("xpTotal")}</span>
                    <span className="text-on-surface font-black text-lg">{totalXp.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  href="/perfil"
                  className="mt-6 w-full py-3 bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary rounded-md font-bold uppercase text-[10px] tracking-widest text-center block hover:brightness-110 transition-all active:scale-95"
                >
                  {t("viewFullProfile")}
                </Link>
              </div>
            </div>
          </div>

        </div>

        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
