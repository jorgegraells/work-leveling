import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { aggregateTimeliness, classifyTimeliness } from "@/lib/kpi-helpers"
import type { TimelinessRecord } from "@/lib/kpi-helpers"

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
      include: { department: true },
    })
    if (!orgRole) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    orgId = orgRole.organizationId
    // Managers are scoped to their department
    if (orgRole.role === "MANAGER" && orgRole.departmentId) {
      forceDeptId = orgRole.departmentId
    }
  }

  const deptIdParam = forceDeptId ?? searchParams.get("departmentId") ?? null

  // Build where clause for UserMission
  const userMissions = await prisma.userMission.findMany({
    where: {
      status: "COMPLETED",
      completedAt: { gte: windowStart },
      user: {
        orgRoles: {
          some: {
            organizationId: orgId,
            confirmed: true,
            ...(deptIdParam ? { departmentId: deptIdParam } : {}),
          },
        },
      },
    },
    select: {
      completedAt: true,
      userId: true,
      mission: { select: { dueDate: true } },
      user: {
        select: {
          orgRoles: {
            where: { organizationId: orgId },
            select: { departmentId: true, organizationId: true },
          },
        },
      },
    },
  })

  const records: TimelinessRecord[] = userMissions.map(um => ({
    completedAt: um.completedAt,
    dueDate: um.mission.dueDate,
    userId: um.userId,
    departmentId: um.user.orgRoles.find(r => r.organizationId === orgId)?.departmentId ?? null,
  }))

  const aggregate = aggregateTimeliness(records)

  // Build per-department breakdown if not filtered to a dept
  let byDepartment: {
    departmentId: string
    departmentName: string
    total: number
    withDeadline: number
    onTimePct: number
    latePct: number
    avgDelayDays: number | null
  }[] = []

  if (!deptIdParam) {
    const departments = await prisma.department.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    })

    byDepartment = departments.map(dept => {
      const deptRecords = records.filter(r => r.departmentId === dept.id)
      const agg = aggregateTimeliness(deptRecords)
      return {
        departmentId: dept.id,
        departmentName: dept.name,
        total: agg.total,
        withDeadline: agg.withDeadline,
        onTimePct: agg.onTimePct,
        latePct: agg.latePct,
        avgDelayDays: agg.avgDelayDays,
      }
    }).filter(d => d.total > 0)
  }

  // Build per-user classification for advanced use
  const byUser = Object.values(
    records.reduce<Record<string, { userId: string; total: number; early: number; onTime: number; late: number }>>((acc, r) => {
      if (!r.userId) return acc
      if (!acc[r.userId]) acc[r.userId] = { userId: r.userId, total: 0, early: 0, onTime: 0, late: 0 }
      acc[r.userId].total++
      const cat = classifyTimeliness(r.completedAt, r.dueDate)
      if (cat === "EARLY") acc[r.userId].early++
      else if (cat === "ON_TIME") acc[r.userId].onTime++
      else if (cat === "LATE") acc[r.userId].late++
      return acc
    }, {})
  )

  return NextResponse.json({
    window: windowDays,
    windowStart: windowStart.toISOString(),
    aggregate,
    byDepartment,
    byUser,
  })
}
