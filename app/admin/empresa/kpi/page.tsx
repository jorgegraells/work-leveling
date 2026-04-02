export const dynamic = "force-dynamic"

import type { Metadata } from "next"
export const metadata: Metadata = { title: "KPIs | Admin" }

import { getTranslations } from "next-intl/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import SidebarLayout from "@/components/layout/SidebarLayout"
import KpiDashboard from "@/components/screens/kpi/KpiDashboard"
import { aggregateTimeliness, buildMonthBuckets, classifyTimeliness } from "@/lib/kpi-helpers"
import type { TimelinessRecord } from "@/lib/kpi-helpers"
import type { TopPerformer } from "@/components/screens/kpi/TopPerformersLeaderboard"
import type { DeptRow } from "@/components/screens/kpi/DepartmentBreakdownTable"

interface SearchParams {
  window?: string
  dept?: string
}

export default async function KpiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const user = await requireCurrentUser()
  const t = await getTranslations("admin")
  const tKpi = await getTranslations("kpi")
  const params = await searchParams

  const cookieStore = await cookies()
  const selectedOrgId = cookieStore.get("selected-org-id")?.value
  const orgId = selectedOrgId ?? user.organizationId

  if (!orgId) redirect("/empresas")

  let forceDeptId: string | null = null

  if (!user.isSuperAdmin) {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: {
        userId: user.id,
        organizationId: orgId,
        confirmed: true,
        role: { in: ["ORG_ADMIN", "MANAGER"] },
      },
    })
    if (!orgRole) redirect("/dashboard")
    if (orgRole.role === "MANAGER" && orgRole.departmentId) {
      forceDeptId = orgRole.departmentId
    }
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  })
  if (!org) redirect("/empresas")

  const windowParam = params.window
  const windowDays = [30, 60, 90].includes(Number(windowParam)) ? (Number(windowParam) as 30 | 60 | 90) : 30
  const windowStart = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000)

  const deptIdParam = forceDeptId ?? params.dept ?? null

  // Fetch completed UserMissions in window
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
      mission: {
        select: {
          dueDate: true,
          xpReward: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          level: true,
          orgRoles: {
            where: { organizationId: orgId },
            select: {
              departmentId: true,
              department: { select: { name: true } },
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

  // Build timeliness records
  const tlRecords: TimelinessRecord[] = userMissions.map(um => ({
    completedAt: um.completedAt,
    dueDate: um.mission.dueDate,
    userId: um.userId,
    departmentId: um.user.orgRoles[0]?.departmentId ?? null,
  }))

  const timeliness = aggregateTimeliness(tlRecords)
  const trend = buildMonthBuckets(tlRecords, windowDays <= 30 ? 6 : windowDays <= 60 ? 6 : 9, "es")

  // XP earned in window
  const xpEarnedInWindow = userMissions.reduce((sum, um) => {
    return sum + um.user.xpEvents.reduce((s, e) => s + e.amount, 0)
  }, 0)

  // Also fetch assigned missions for completionRate (all statuses)
  const missionsAssignedCount = await prisma.userMission.count({
    where: {
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
  })

  const missionsCompleted = userMissions.length
  const completionRate = missionsAssignedCount > 0 ? Math.round((missionsCompleted / missionsAssignedCount) * 100) : 0

  // Build top performers
  const userMap = new Map<string, {
    userId: string
    name: string
    avatarUrl: string | null
    level: number
    completedCount: number
    withDeadline: number
    onTimeCount: number
    departmentId: string | null
    departmentName: string | null
  }>()

  for (const um of userMissions) {
    const uid = um.userId
    if (!userMap.has(uid)) {
      userMap.set(uid, {
        userId: uid,
        name: um.user.name,
        avatarUrl: um.user.avatarUrl,
        level: um.user.level,
        completedCount: 0,
        withDeadline: 0,
        onTimeCount: 0,
        departmentId: um.user.orgRoles[0]?.departmentId ?? null,
        departmentName: um.user.orgRoles[0]?.department?.name ?? null,
      })
    }
    const entry = userMap.get(uid)!
    entry.completedCount++
    if (um.mission.dueDate && um.completedAt) {
      entry.withDeadline++
      const cat = classifyTimeliness(um.completedAt, um.mission.dueDate)
      if (cat === "EARLY" || cat === "ON_TIME") entry.onTimeCount++
    }
  }

  // Get assigned counts per user for completion rate
  const userAssignedCounts = await prisma.userMission.groupBy({
    by: ["userId"],
    where: {
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
    _count: { id: true },
  })
  const assignedMap = new Map(userAssignedCounts.map(r => [r.userId, r._count.id]))

  const topPerformers: TopPerformer[] = Array.from(userMap.values())
    .map(u => ({
      userId: u.userId,
      name: u.name,
      avatarUrl: u.avatarUrl,
      level: u.level,
      completedCount: u.completedCount,
      assignedCount: assignedMap.get(u.userId) ?? u.completedCount,
      completionRate: assignedMap.has(u.userId)
        ? Math.round((u.completedCount / assignedMap.get(u.userId)!) * 100)
        : 100,
      onTimePct: u.withDeadline > 0 ? Math.round((u.onTimeCount / u.withDeadline) * 100) : 0,
      departmentId: u.departmentId,
      departmentName: u.departmentName,
    }))
    .sort((a, b) => b.completedCount - a.completedCount || b.onTimePct - a.onTimePct)
    .slice(0, 10)

  // Build department breakdown
  let byDepartment: DeptRow[] = []
  if (!deptIdParam) {
    const departments = await prisma.department.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true },
    })

    byDepartment = departments.map(dept => {
      const deptRecords = tlRecords.filter(r => r.departmentId === dept.id)
      if (deptRecords.length === 0) return null
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
    }).filter((d): d is DeptRow => d !== null)
  }

  return (
    <SidebarLayout
      user={{
        name: user.name,
        level: user.level,
        title: user.title ?? "Executive",
        avatarUrl: user.avatarUrl,
      }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("breadcrumbCompanyDashboard"), href: "/admin/empresa" },
        { label: tKpi("title") },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          <KpiDashboard
            timeliness={timeliness}
            trend={trend}
            topPerformers={topPerformers}
            byDepartment={byDepartment}
            window={windowDays}
            orgName={org.name}
            xpEarnedInWindow={xpEarnedInWindow}
            missionsCompleted={missionsCompleted}
            completionRate={completionRate}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
