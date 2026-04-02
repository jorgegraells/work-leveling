import type { Metadata } from "next"
export const metadata: Metadata = { title: "Estadísticas | Work Leveling", description: "Tu progreso y estadísticas de gamificación" }

import SidebarLayout from "@/components/layout/SidebarLayout"
import Estadisticas from "@/components/screens/Estadisticas"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

export default async function EstadisticasPage() {
  const user = await requireCurrentUser()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [xpEvents, completedMissions, attributes] = await Promise.all([
    prisma.xpEvent.findMany({
      where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userMission.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: { mission: { select: { module: true } } },
    }),
    prisma.userAttribute.findMany({
      where: { userId: user.id },
      include: { attribute: true },
      distinct: ["attributeId"],
    }),
  ])

  const t = await getTranslations("estadisticas")
  const tCommon = await getTranslations("common")
  const MODULE_LABEL: Record<string, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  // Group XP by day
  const xpByDay = new Map<string, number>()
  for (const event of xpEvents) {
    const day = event.createdAt.toISOString().slice(0, 10)
    xpByDay.set(day, (xpByDay.get(day) ?? 0) + event.amount)
  }

  const xpHistory: { date: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    xpHistory.push({ date: key, amount: xpByDay.get(key) ?? 0 })
  }

  // Missions by module
  const moduleCountMap = new Map<string, number>()
  for (const um of completedMissions) {
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
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: t("breadcrumb") }]}
    >
      <Estadisticas
        stats={{
          xpHistory,
          missionsByModule,
          totalCompleted: completedMissions.length,
          totalXp: user.xp,
          level: user.level,
          attributes: attributes.map((ua) => ({
            label: ua.attribute.label,
            value: ua.value,
            color: ua.attribute.color,
          })),
        }}
      />
    </SidebarLayout>
  )
}
