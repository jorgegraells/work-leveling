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

  if (userObjective.status === "LOCKED") {
    return NextResponse.json({ error: "Objective is locked" }, { status: 403 })
  }

  if (userObjective.submittedAt) {
    return NextResponse.json({ error: "Objective already submitted" }, { status: 409 })
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
