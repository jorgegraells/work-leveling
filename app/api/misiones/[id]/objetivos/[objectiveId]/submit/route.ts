import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// POST /api/misiones/[id]/objetivos/[objectiveId]/submit
// Employee marks a UserMissionObjective as submitted for manager review.
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; objectiveId: string }> }
) {
  const { id: missionId, objectiveId } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Find the UserMission belonging to this user
  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
    include: {
      objectives: {
        include: { objective: true },
      },
    },
  })

  if (!userMission) {
    return NextResponse.json({ error: "Mission not assigned to user" }, { status: 404 })
  }

  if (userMission.status === "ARCHIVED") {
    return NextResponse.json({ error: "Mission is archived" }, { status: 409 })
  }

  // Find the specific UserMissionObjective
  const userObjective = userMission.objectives.find(
    (o) => o.objectiveId === objectiveId
  )

  if (!userObjective) {
    return NextResponse.json({ error: "Objective not found for this mission" }, { status: 404 })
  }

  if (userObjective.status === "LOCKED" && userObjective.managerApproved !== false) {
    return NextResponse.json({ error: "Objective is locked" }, { status: 403 })
  }

  if (userObjective.submittedAt) {
    if (userObjective.managerApproved === null) {
      // Still pending review — can't re-submit yet
      return NextResponse.json({ error: "Objective is pending review" }, { status: 409 })
    }
    if (userObjective.managerApproved === true) {
      // Already approved
      return NextResponse.json({ error: "Objective already approved" }, { status: 409 })
    }
    // managerApproved === false (rejected) → allow re-submission, reset review data
  }

  // Mark as submitted and completed
  const updated = await prisma.userMissionObjective.update({
    where: { id: userObjective.id },
    data: {
      submittedAt: new Date(),
      completedAt: new Date(),
      status: "COMPLETED",
      // Reset any previous manager decision if re-submitted
      managerApproved: null,
      managerNote: null,
      managerApprovedAt: null,
    },
  })

  return NextResponse.json(updated)
}
