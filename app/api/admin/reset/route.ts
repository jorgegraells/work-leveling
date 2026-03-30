import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// POST /api/admin/reset — SUPER_ADMIN only
export async function POST(req: Request) {
  const user = await requireCurrentUser()

  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { scope } = await req.json().catch(() => ({ scope: "gameplay" }))

  if (scope === "full") {
    // True full wipe: delete everything except the superadmin user
    // Order matters due to foreign key constraints
    await prisma.$transaction([
      // Gameplay
      prisma.missionApproval.deleteMany(),
      prisma.userMissionObjective.deleteMany(),
      prisma.userMission.deleteMany(),
      prisma.xpEvent.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.userAttribute.deleteMany(),
      // Org membership
      prisma.userOrganizationRole.deleteMany(),
      prisma.department.deleteMany(),
      // Mission templates
      prisma.missionObjective.deleteMany(),
      prisma.mission.deleteMany(),
      // Organizations
      prisma.subscription.deleteMany(),
      prisma.organization.deleteMany(),
      // Users (keep superadmin)
      prisma.user.deleteMany({ where: { isSuperAdmin: false } }),
      // Reset superadmin stats
      prisma.user.updateMany({
        where: { isSuperAdmin: true },
        data: { xp: 0, xpToNextLevel: 1000, level: 1, trophies: 0, kredits: 0, organizationId: null },
      }),
    ])
    return NextResponse.json({ ok: true, message: "Full wipe complete — only superadmin remains" })
  }

  // Gameplay-only reset: keeps users, orgs, and mission templates
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
