import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser, canApproveInOrg } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// POST /api/aprobaciones/[id]/reabrir
// Admin re-opens a REJECTED approval back to PENDING without waiting for employee
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await requireCurrentUser()

  const approval = await prisma.missionApproval.findUnique({
    where: { id },
    include: {
      userMission: {
        include: { user: true, mission: true },
      },
    },
  })

  if (!approval) {
    return NextResponse.json({ error: "Approval not found" }, { status: 404 })
  }

  if (approval.status !== "REJECTED") {
    return NextResponse.json({ error: "Only rejected approvals can be re-opened" }, { status: 409 })
  }

  const employee = approval.userMission.user
  const canApprove = employee.organizationId
    ? await canApproveInOrg(currentUser.id, employee.organizationId)
    : currentUser.isSuperAdmin
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.$transaction(async (tx) => {
    await tx.missionApproval.update({
      where: { id },
      data: {
        status: "PENDING",
        note: null,
        reviewedAt: null,
        scoreLogica: null,
        scoreCreatividad: null,
        scoreLiderazgo: null,
        scoreNegociacion: null,
        scoreEstrategia: null,
        scoreAnalisis: null,
        scoreComunicacion: null,
        scoreAdaptabilidad: null,
      },
    })

    await tx.userMission.update({
      where: { id: approval.userMissionId },
      data: { status: "COMPLETED", progress: 100, completedAt: new Date() },
    })
  })

  return NextResponse.json({ success: true })
}
