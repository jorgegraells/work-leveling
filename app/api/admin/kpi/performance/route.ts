import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { classifyTimeliness } from "@/lib/kpi-helpers"

export interface TopPerformer {
  userId: string
  name: string
  avatarUrl: string | null
  level: number
  completedCount: number
  assignedCount: number
  completionRate: number
  onTimePct: number
  departmentId: string | null
  departmentName: string | null
}

export async function GET(req: NextRequest) {
  const user = await requireCurrentUser()

  const { searchParams } = req.nextUrl
  const windowParam = searchParams.get("window") ?? "30"
  const windowDays = [30, 60, 90].includes(Number(windowParam)) ? Number(windowParam) : 30
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)

  let orgId: string
  let forceDeptId: string | null = null

  if (user.isSuperAdmin) {
    const qOrgId = searchParams.get("orgId")
    if (!qOrgId) return NextResponse.json({ error: "orgId required for super admin" }, { status: 400 })
    orgId = qOrgId
  } else {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: {
        userId: user.id,
        confirmed: true,
        role: { in: ["ORG_ADMIN", "MANAGER"] },
      },
    })
    if (!orgRole) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    orgId = orgRole.organizationId
    if (orgRole.role === "MANAGER" && orgRole.departmentId) {
      forceDeptId = orgRole.departmentId
    }
  }

  const deptIdParam = forceDeptId ?? searchParams.get("departmentId") ?? null

  // Get all org members in window scope
  const orgRoles = await prisma.userOrganizationRole.findMany({
    where: {
      organizationId: orgId,
      confirmed: true,
      ...(deptIdParam ? { departmentId: deptIdParam } : {}),
    },
    select: {
      userId: true,
      departmentId: true,
      department: { select: { name: true } },
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          level: true,
          userMissions: {
            where: {
              OR: [
                { status: "COMPLETED", completedAt: { gte: windowStart } },
                { status: { in: ["PENDING", "IN_PROGRESS"] } },
              ],
            },
            select: {
              status: true,
              completedAt: true,
              mission: { select: { dueDate: true } },
            },
          },
          xpEvents: {
            where: { createdAt: { gte: windowStart } },
            select: { amount: true },
          },
        },
      },
    },
  })

  let xpEarnedInWindow = 0
  let missionsAssigned = 0
  let missionsCompleted = 0

  const performers: TopPerformer[] = []

  for (const orgRole of orgRoles) {
    const u = orgRole.user
    const completedInWindow = u.userMissions.filter(
      m => m.status === "COMPLETED" && m.completedAt && new Date(m.completedAt) >= windowStart
    )
    const totalAssigned = u.userMissions.length
    const completedCount = completedInWindow.length

    // XP in window for this user
    const userXp = u.xpEvents.reduce((sum, e) => sum + e.amount, 0)
    xpEarnedInWindow += userXp
    missionsAssigned += totalAssigned
    missionsCompleted += completedCount

    // On-time rate for completed in window
    const withDeadline = completedInWindow.filter(m => m.mission.dueDate && m.completedAt)
    const onTimeCount = withDeadline.filter(m => {
      const cat = classifyTimeliness(m.completedAt, m.mission.dueDate)
      return cat === "EARLY" || cat === "ON_TIME"
    }).length
    const onTimePct = withDeadline.length > 0 ? Math.round((onTimeCount / withDeadline.length) * 100) : 0
    const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0

    if (completedCount > 0) {
      performers.push({
        userId: u.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        level: u.level,
        completedCount,
        assignedCount: totalAssigned,
        completionRate,
        onTimePct,
        departmentId: orgRole.departmentId ?? null,
        departmentName: orgRole.department?.name ?? null,
      })
    }
  }

  // Sort by completedCount desc, then onTimePct desc
  performers.sort((a, b) => b.completedCount - a.completedCount || b.onTimePct - a.onTimePct)
  const topPerformers = performers.slice(0, 10)

  const completionRate = missionsAssigned > 0 ? Math.round((missionsCompleted / missionsAssigned) * 100) : 0

  return NextResponse.json({
    window: windowDays,
    windowStart: windowStart.toISOString(),
    xpEarnedInWindow,
    missionsAssigned,
    missionsCompleted,
    completionRate,
    topPerformers,
  })
}
