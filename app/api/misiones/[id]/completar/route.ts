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

  // Find the UserMission for this user + mission
  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId: id } },
    include: { mission: true },
  })

  if (!userMission) {
    return NextResponse.json({ error: "Mission not assigned to user" }, { status: 404 })
  }

  if (userMission.status === "COMPLETED" || userMission.status === "ARCHIVED") {
    return NextResponse.json({ error: "Mission already completed or archived" }, { status: 409 })
  }

  // Mark as completed
  const updated = await prisma.userMission.update({
    where: { id: userMission.id },
    data: {
      status: "COMPLETED",
      progress: 100,
      completedAt: new Date(),
    },
  })

  // Find first ORG_ADMIN for the user's org
  const firstAdmin = await prisma.userOrganizationRole.findFirst({
    where: {
      organizationId: user.organizationId,
      role: "ORG_ADMIN",
    },
    orderBy: { createdAt: "asc" },
  })

  if (!firstAdmin) {
    return NextResponse.json({ error: "No admin found for org" }, { status: 500 })
  }

  // Create approval record
  const approval = await prisma.missionApproval.create({
    data: {
      userMissionId: updated.id,
      approverId: firstAdmin.userId,
      status: "PENDING",
    },
  })

  // Notify all org admins
  await notifyOrgAdmins(
    user.organizationId,
    "MISSION_COMPLETED",
    "Misión completada pendiente de aprobación",
    `${user.name} ha completado la misión: ${userMission.mission.title}`
  )

  return NextResponse.json({ approval })
}
