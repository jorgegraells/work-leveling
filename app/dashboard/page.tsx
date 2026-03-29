import ExecutiveQuestDashboard, {
  type ActiveProject,
  type PendingObjective,
  type ActivityItem,
} from "@/components/screens/ExecutiveQuestDashboard"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

function formatKredits(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) return redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      userMissions: {
        include: {
          mission: { include: { objectives: { orderBy: { order: "asc" } } } },
          objectives: { include: { objective: true } },
          approval: { select: { status: true } },
        },
      },
    },
  })

  if (!user) return redirect("/sign-in")

  // ── Active projects (not archived, and include COMPLETED with pending approval) ──
  const activeProjects: ActiveProject[] = user.userMissions
    .filter((um) => {
      if (um.status === "ARCHIVED") return false
      // Exclude fully approved completed missions from "active" list
      if (um.status === "COMPLETED" && um.approval?.status === "APPROVED") return false
      return true
    })
    .map((um) => {
      const completedObjs = um.objectives.filter((o) => o.status === "COMPLETED").length
      const totalObjs = um.mission.objectives.length
      return {
        id: um.id,
        missionId: um.missionId,
        title: um.mission.title,
        icon: um.mission.icon,
        module: um.mission.module,
        progress: um.progress,
        objectivesTotal: totalObjs,
        objectivesCompleted: completedObjs,
        status: um.status,
        approvalStatus: um.approval?.status ?? undefined,
      }
    })
    .sort((a, b) => {
      const order = { IN_PROGRESS: 0, PENDING: 1, COMPLETED: 2 }
      return (order[a.status as keyof typeof order] ?? 3) - (order[b.status as keyof typeof order] ?? 3)
    })

  // ── Pending objectives (IN_PROGRESS ones) ──
  const pendingObjectives: PendingObjective[] = []
  for (const um of user.userMissions) {
    if (um.status === "COMPLETED" || um.status === "ARCHIVED") continue
    for (const uo of um.objectives) {
      if (uo.status === "IN_PROGRESS") {
        pendingObjectives.push({
          id: uo.id,
          title: uo.objective.title,
          icon: uo.objective.icon,
          projectTitle: um.mission.title,
          missionId: um.missionId,
          xpReward: uo.objective.xpReward,
        })
      }
    }
  }

  // ── Recent activity (notifications) ──
  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 8,
  })

  const recentActivity: ActivityItem[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    createdAt: n.createdAt.toISOString(),
  }))

  // ── Counts ──
  const completedCount = user.userMissions.filter(
    (um) => um.status === "COMPLETED" && um.approval?.status === "APPROVED"
  ).length
  const inProgressCount = user.userMissions.filter(
    (um) => um.status === "IN_PROGRESS" || um.status === "PENDING" ||
    (um.status === "COMPLETED" && um.approval?.status !== "APPROVED")
  ).length

  // ── Rank progress ──
  const rankProgress = user.xpToNextLevel > 0
    ? Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))
    : 0

  return (
    <ExecutiveQuestDashboard
      userName={user.name}
      userTitle={user.title ?? "Executive"}
      userLevel={user.level}
      userAvatarUrl={user.avatarUrl}
      rankProgress={rankProgress}
      totalXp={user.xp}
      trophies={user.trophies}
      kredits={formatKredits(user.kredits)}
      activeProjects={activeProjects}
      pendingObjectives={pendingObjectives}
      recentActivity={recentActivity}
      completedCount={completedCount}
      inProgressCount={inProgressCount}
    />
  )
}
