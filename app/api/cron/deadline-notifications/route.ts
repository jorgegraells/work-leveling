import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const now = new Date()
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000)
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000)

  let processed = 0

  // Find all active UserMissions with a dueDate set
  const activeMissions = await prisma.userMission.findMany({
    where: {
      status: { notIn: ["COMPLETED", "ARCHIVED"] },
      mission: {
        dueDate: { not: null },
      },
    },
    include: {
      mission: { select: { dueDate: true, title: true } },
    },
  })

  // Group 1: DUE_SOON — dueDate within 48h, not yet notified
  const dueSoonCandidates = activeMissions.filter((um) => {
    if (!um.mission.dueDate) return false
    if (um.dueSoonNotifiedAt) return false
    return um.mission.dueDate <= in48h && um.mission.dueDate > in24h
  })

  for (const um of dueSoonCandidates) {
    await prisma.$transaction([
      prisma.userMission.update({
        where: { id: um.id },
        data: { dueSoonNotifiedAt: now },
      }),
    ])
    await createNotification(
      um.userId,
      "DUE_SOON",
      `Plazo próximo: ${um.mission.title}`,
      `Tu misión "${um.mission.title}" vence en menos de 48 horas.`,
      { missionId: um.missionId, userMissionId: um.id }
    )
    processed++
  }

  // Group 2: DEADLINE_CRITICAL — dueDate within 24h, not yet notified
  const criticalCandidates = activeMissions.filter((um) => {
    if (!um.mission.dueDate) return false
    if (um.criticalNotifiedAt) return false
    return um.mission.dueDate <= in24h && um.mission.dueDate > now
  })

  for (const um of criticalCandidates) {
    await prisma.$transaction([
      prisma.userMission.update({
        where: { id: um.id },
        data: { criticalNotifiedAt: now },
      }),
    ])
    await createNotification(
      um.userId,
      "DEADLINE_CRITICAL",
      `¡CRÍTICO! Plazo en menos de 24h: ${um.mission.title}`,
      `Tu misión "${um.mission.title}" vence en menos de 24 horas. ¡Actúa ahora!`,
      { missionId: um.missionId, userMissionId: um.id }
    )
    processed++
  }

  // Group 3: OVERDUE — dueDate in the past, not yet notified
  const overdueCandidates = activeMissions.filter((um) => {
    if (!um.mission.dueDate) return false
    if (um.overdueNotifiedAt) return false
    return um.mission.dueDate < now
  })

  for (const um of overdueCandidates) {
    await prisma.$transaction([
      prisma.userMission.update({
        where: { id: um.id },
        data: { overdueNotifiedAt: now },
      }),
    ])
    await createNotification(
      um.userId,
      "OVERDUE",
      `Misión vencida: ${um.mission.title}`,
      `Tu misión "${um.mission.title}" ha superado su fecha límite.`,
      { missionId: um.missionId, userMissionId: um.id }
    )
    processed++
  }

  return NextResponse.json({ processed })
}
