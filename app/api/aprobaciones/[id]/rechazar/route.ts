import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser, canApproveInOrg } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await requireCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const approval = await prisma.missionApproval.findUnique({
    where: { id },
    include: {
      userMission: {
        include: {
          user: true,
          mission: true,
        },
      },
    },
  })

  if (!approval) {
    return NextResponse.json({ error: "Approval not found" }, { status: 404 })
  }

  if (approval.status !== "PENDING") {
    return NextResponse.json({ error: "Approval already processed" }, { status: 409 })
  }

  const employee = approval.userMission.user
  const canApprove = employee.organizationId
    ? await canApproveInOrg(currentUser.id, employee.organizationId)
    : currentUser.isSuperAdmin
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (currentUser.id === employee.id) {
    return NextResponse.json({ error: "No puedes aprobar tus propias misiones" }, { status: 403 })
  }

  const body = await req.json()

  if (!body.note || typeof body.note !== "string" || body.note.trim().length === 0) {
    return NextResponse.json(
      { error: "Note is required when rejecting" },
      { status: 400 }
    )
  }

  await prisma.$transaction(async (tx) => {
    // 1. Update MissionApproval
    await tx.missionApproval.update({
      where: { id },
      data: {
        status: "REJECTED",
        note: body.note.trim(),
        reviewedAt: new Date(),
      },
    })

    // 2. Reset UserMission to IN_PROGRESS — keep progress at 100 so the employee
    //    only needs to re-submit (not redo their work). Clear completedAt.
    await tx.userMission.update({
      where: { id: approval.userMissionId },
      data: {
        status: "IN_PROGRESS",
        progress: 100,
        completedAt: null,
      },
    })

    // 3. Notify employee with reviewer info
    await tx.notification.create({
      data: {
        userId: employee.id,
        type: "MISSION_REJECTED",
        title: "Misión rechazada",
        body: `Tu misión '${approval.userMission.mission.title}' ha sido rechazada por ${currentUser.name}.\n\nMotivo: "${body.note.trim()}"`,
        data: {
          missionId: approval.userMission.mission.id,
          approvalId: id,
          reviewerName: currentUser.name,
          note: body.note.trim(),
        },
      },
    })
  })

  return NextResponse.json({ success: true })
}
