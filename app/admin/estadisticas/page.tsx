import SidebarLayout from "@/components/layout/SidebarLayout"
import AdminEstadisticas from "@/components/screens/admin/AdminEstadisticas"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function AdminEstadisticasPage() {
  const user = await requireCurrentUser()
  const t = await getTranslations("adminEstadisticas")
  const tCommon = await getTranslations("common")

  // Check authorization: super admin or org admin
  if (!user.isSuperAdmin) {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: {
        userId: user.id,
        role: { in: ["ORG_ADMIN", "SUPER_ADMIN"] },
      },
    })
    if (!orgRole) redirect("/dashboard")
  }

  const orgId = user.organizationId

  const MODULE_LABEL: Record<string, string> = {
    VENTAS_LEADS:          tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA:  tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS:    tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION:  tCommon("moduleEstrategia"),
  }

  // Get org user IDs
  const orgUsers = await prisma.user.findMany({
    where: { organizationId: orgId },
    select: { id: true },
  })
  const orgUserIds = orgUsers.map((u) => u.id)

  const [totalMissions, totalAssigned, totalCompleted, pendingApprovals] = await Promise.all([
    prisma.mission.count({
      where: { OR: [{ organizationId: orgId }, { isGlobal: true }] },
    }),
    prisma.userMission.count({
      where: { userId: { in: orgUserIds } },
    }),
    prisma.userMission.count({
      where: { userId: { in: orgUserIds }, status: "COMPLETED" },
    }),
    prisma.missionApproval.count({
      where: {
        status: "PENDING",
        userMission: { userId: { in: orgUserIds } },
      },
    }),
  ])

  const completionRate = totalAssigned > 0 ? Math.round((totalCompleted / totalAssigned) * 100) : 0

  // Top performers
  const topPerformers = await prisma.user.findMany({
    where: { organizationId: orgId },
    orderBy: { xp: "desc" },
    take: 10,
    select: {
      name: true,
      level: true,
      xp: true,
      _count: { select: { userMissions: { where: { status: "COMPLETED" } } } },
    },
  })

  // Missions by module
  const missionsByModuleRaw = await prisma.userMission.findMany({
    where: { userId: { in: orgUserIds }, status: "COMPLETED" },
    include: { mission: { select: { module: true } } },
  })

  const moduleCountMap = new Map<string, number>()
  for (const um of missionsByModuleRaw) {
    const mod = um.mission.module
    moduleCountMap.set(mod, (moduleCountMap.get(mod) ?? 0) + 1)
  }

  const missionsByModule = Array.from(moduleCountMap.entries()).map(([mod, count]) => ({
    module: mod,
    count,
    label: MODULE_LABEL[mod] ?? mod,
  }))

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Admin", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("title") },
      ]}
    >
      <AdminEstadisticas
        stats={{
          totalMissions,
          totalAssigned,
          completionRate,
          pendingApprovals,
          topPerformers: topPerformers.map((u) => ({
            name: u.name,
            level: u.level,
            xp: u.xp,
            completedMissions: u._count.userMissions,
          })),
          missionsByModule,
        }}
      />
    </SidebarLayout>
  )
}
