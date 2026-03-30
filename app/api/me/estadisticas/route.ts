import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await requireCurrentUser()

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [xpEvents, missionsByModule, totalCompleted, attributes] = await Promise.all([
    prisma.xpEvent.findMany({
      where: { userId: user.id, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.userMission.groupBy({
      by: ["missionId"],
      where: { userId: user.id, status: { in: ["COMPLETED", "ARCHIVED"] } },
      _count: true,
    }),
    prisma.userMission.count({
      where: { userId: user.id, status: { in: ["COMPLETED", "ARCHIVED"] } },
    }),
    prisma.userAttribute.findMany({
      where: { userId: user.id },
      include: { attribute: true },
    }),
  ])

  // Get missions for module info
  const missionIds = missionsByModule.map((m) => m.missionId)
  const missions = missionIds.length > 0
    ? await prisma.mission.findMany({
        where: { id: { in: missionIds } },
        select: { id: true, module: true },
      })
    : []

  const MODULE_LABEL: Record<string, string> = {
    VENTAS_LEADS: "Ventas & Leads",
    PROYECTOS_CRONOGRAMA: "Proyectos & Cronograma",
    ALIANZAS_CONTRATOS: "Alianzas & Contratos",
    INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
    ESTRATEGIA_EXPANSION: "Estrategia & Expansión",
  }

  // Aggregate completed missions by module
  const moduleCountMap = new Map<string, number>()
  for (const entry of missionsByModule) {
    const mission = missions.find((m) => m.id === entry.missionId)
    if (mission) {
      const current = moduleCountMap.get(mission.module) ?? 0
      moduleCountMap.set(mission.module, current + entry._count)
    }
  }

  const missionsByModuleResult = Array.from(moduleCountMap.entries()).map(([mod, count]) => ({
    module: mod,
    count,
    label: MODULE_LABEL[mod] ?? mod,
  }))

  // Group XP by day
  const xpByDay = new Map<string, number>()
  for (const event of xpEvents) {
    const day = event.createdAt.toISOString().slice(0, 10)
    xpByDay.set(day, (xpByDay.get(day) ?? 0) + event.amount)
  }

  // Fill all 30 days
  const xpHistory: { date: string; amount: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    xpHistory.push({ date: key, amount: xpByDay.get(key) ?? 0 })
  }

  return NextResponse.json({
    xpHistory,
    missionsByModule: missionsByModuleResult,
    totalCompleted,
    totalXp: user.xp,
    level: user.level,
    attributes: attributes.map((ua) => ({
      label: ua.attribute.label,
      value: ua.value,
      color: ua.attribute.color,
    })),
  })
}
