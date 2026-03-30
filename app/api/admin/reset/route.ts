import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// POST /api/admin/reset — SUPER_ADMIN only
// Wipes all gameplay data while preserving orgs, users, and missions templates
export async function POST(req: Request) {
  const user = await requireCurrentUser()

  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { scope } = await req.json().catch(() => ({ scope: "gameplay" }))

  if (scope === "full") {
    // Full reset: delete all user missions, approvals, notifications, XP events, and reset user stats
    await prisma.$transaction([
      prisma.missionApproval.deleteMany(),
      prisma.userMissionObjective.deleteMany(),
      prisma.userMission.deleteMany(),
      prisma.xpEvent.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.user.updateMany({
        data: { xp: 0, xpToNextLevel: 1000, level: 1, trophies: 0, kredits: 0 },
      }),
    ])
    return NextResponse.json({ ok: true, message: "Full gameplay reset complete" })
  }

  // Default: gameplay reset (same as full for now)
  await prisma.$transaction([
    prisma.missionApproval.deleteMany(),
    prisma.userMissionObjective.deleteMany(),
    prisma.userMission.deleteMany(),
    prisma.xpEvent.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.user.updateMany({
      data: { xp: 0, xpToNextLevel: 1000, level: 1, trophies: 0, kredits: 0 },
    }),
  ])

  return NextResponse.json({ ok: true, message: "Gameplay reset complete" })
}
