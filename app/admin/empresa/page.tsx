export const dynamic = "force-dynamic"

import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresaDashboard from "@/components/screens/EmpresaDashboard"

export default async function EmpresaDashboardPage() {
  const user = await requireCurrentUser()

  const cookieStore = await cookies()
  const selectedOrgId = cookieStore.get("selected-org-id")?.value
  const orgId = selectedOrgId ?? user.organizationId

  if (!orgId) redirect("/empresas")

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
  }

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    select: { id: true, name: true },
  })

  if (!org) redirect("/empresas")

  const departments = await prisma.department.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const orgRoles = await prisma.userOrganizationRole.findMany({
    where: { organizationId: orgId, confirmed: true },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          level: true,
          xp: true,
          userMissions: {
            select: {
              status: true,
              progress: true,
              mission: { select: { module: true } },
            },
          },
        },
      },
      department: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const members = orgRoles.map((r) => {
    const missions = r.user.userMissions
    const activeMissions = missions.filter(
      (m) => m.status === "IN_PROGRESS" || m.status === "PENDING"
    ).length
    const completedMissions = missions.filter((m) => m.status === "COMPLETED").length
    const archivedMissions = missions.filter((m) => m.status === "ARCHIVED").length
    const avgProgress =
      missions.length > 0
        ? Math.round(missions.reduce((sum, m) => sum + m.progress, 0) / missions.length)
        : 0

    return {
      id: r.user.id,
      name: r.user.name,
      avatarUrl: r.user.avatarUrl,
      level: r.user.level,
      xp: r.user.xp,
      role: r.role as string,
      departmentId: r.department?.id ?? null,
      departmentName: r.department?.name ?? null,
      activeMissions,
      completedMissions,
      archivedMissions,
      avgProgress,
    }
  })

  const allMissions = orgRoles.flatMap((r) => r.user.userMissions)

  const statusCounts = {
    PENDING: allMissions.filter((m) => m.status === "PENDING").length,
    IN_PROGRESS: allMissions.filter((m) => m.status === "IN_PROGRESS").length,
    COMPLETED: allMissions.filter((m) => m.status === "COMPLETED").length,
    ARCHIVED: allMissions.filter((m) => m.status === "ARCHIVED").length,
  }

  const moduleCounts: Record<string, number> = {}
  for (const m of allMissions) {
    const key = m.mission.module
    moduleCounts[key] = (moduleCounts[key] ?? 0) + 1
  }

  const missionStats = {
    byStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
    byModule: Object.entries(moduleCounts).map(([module, count]) => ({ module, count })),
    total: allMissions.length,
    active: statusCounts.IN_PROGRESS + statusCounts.PENDING,
    completed: statusCounts.COMPLETED,
    archived: statusCounts.ARCHIVED,
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
        { label: "Dashboard Empresa" },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          <EmpresaDashboard
            org={org}
            departments={departments}
            members={members}
            missionStats={missionStats}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
