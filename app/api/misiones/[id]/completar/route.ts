import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { notifyOrgAdmins } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

// POST /api/misiones/[id]/completar — employee marks their mission as completed
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId: id } },
    include: { mission: true, approval: true },
  })

  if (!userMission) {
    return NextResponse.json({ error: "Mission not assigned to user" }, { status: 404 })
  }

  if (userMission.status === "COMPLETED" || userMission.status === "ARCHIVED") {
    return NextResponse.json({ error: "Mission already completed or archived" }, { status: 409 })
  }

  if (userMission.approval) {
    return NextResponse.json({ error: "Approval already exists" }, { status: 409 })
  }

  // Mark as completed (pending review)
  const updated = await prisma.userMission.update({
    where: { id: userMission.id },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
    },
  })

  // Find an approver: first look for ORG_ADMIN in the mission's org, then any super admin
  const missionOrgId = userMission.mission.organizationId
  let approverId: string | null = null

  if (missionOrgId) {
    const orgAdmin = await prisma.userOrganizationRole.findFirst({
      where: { organizationId: missionOrgId, role: { in: ["ORG_ADMIN", "MANAGER"] }, confirmed: true },
      orderBy: { createdAt: "asc" },
    })
    if (orgAdmin) approverId = orgAdmin.userId
  }

  // Fallback: any super admin
  if (!approverId) {
    const superAdmin = await prisma.user.findFirst({
      where: { isSuperAdmin: true },
      select: { id: true },
    })
    if (superAdmin) approverId = superAdmin.id
  }

  // Last fallback: the user's own org admin
  if (!approverId) {
    const ownOrgAdmin = await prisma.userOrganizationRole.findFirst({
      where: { organizationId: user.organizationId, role: "ORG_ADMIN" },
      orderBy: { createdAt: "asc" },
    })
    if (ownOrgAdmin) approverId = ownOrgAdmin.userId
  }

  if (!approverId) {
    // No admin at all — still create the approval with self as fallback
    approverId = user.id
  }

  const approval = await prisma.missionApproval.create({
    data: {
      userMissionId: updated.id,
      approverId,
      status: "PENDING",
    },
  })

  // Notify admins of the mission's org (or all super admins)
  if (missionOrgId) {
    await notifyOrgAdmins(
      missionOrgId,
      "MISSION_COMPLETED",
      "Misión completada pendiente de aprobación",
      `${user.name} ha completado la misión: ${userMission.mission.title}`
    )
  }

  return NextResponse.json({ approval })
}
