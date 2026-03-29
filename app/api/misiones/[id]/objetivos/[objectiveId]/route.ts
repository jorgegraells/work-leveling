import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// PATCH /api/misiones/[id]/objetivos/[objectiveId]
// Marks a UserMissionObjective as COMPLETED and unlocks the next one.
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; objectiveId: string }> }
) {
  const { id: missionId, objectiveId } = await params
  const user = await requireCurrentUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Find the UserMission
  const userMission = await prisma.userMission.findUnique({
    where: { userId_missionId: { userId: user.id, missionId } },
    include: {
      objectives: {
        include: { objective: true },
      },
      mission: {
        include: {
          objectives: { orderBy: { order: "asc" } },
        },
      },
    },
  })

  if (!userMission) {
    return NextResponse.json(
      { error: "Mission not assigned to user" },
      { status: 404 }
    )
  }

  if (
    userMission.status === "COMPLETED" ||
    userMission.status === "ARCHIVED"
  ) {
    return NextResponse.json(
      { error: "Mission already completed or archived" },
      { status: 409 }
    )
  }

  // Find the UserMissionObjective
  const userObjective = userMission.objectives.find(
    (o) => o.objectiveId === objectiveId
  )

  if (!userObjective) {
    return NextResponse.json(
      { error: "Objective not found for this mission" },
      { status: 404 }
    )
  }

  if (userObjective.status === "COMPLETED") {
    return NextResponse.json(
      { error: "Objective already completed" },
      { status: 409 }
    )
  }

  if (userObjective.status === "LOCKED") {
    return NextResponse.json(
      { error: "Objective is locked" },
      { status: 403 }
    )
  }

  // Mark this objective as COMPLETED
  await prisma.userMissionObjective.update({
    where: { id: userObjective.id },
    data: {
      status: "COMPLETED",
      completedAt: new Date(),
    },
  })

  // Find the current objective's order
  const currentObjective = userMission.mission.objectives.find(
    (o) => o.id === objectiveId
  )
  const currentOrder = currentObjective?.order ?? 0

  // Unlock the next objective (order + 1)
  const nextObjective = userMission.mission.objectives.find(
    (o) => o.order === currentOrder + 1
  )

  if (nextObjective) {
    const nextUserObjective = userMission.objectives.find(
      (o) => o.objectiveId === nextObjective.id
    )
    if (nextUserObjective && nextUserObjective.status === "LOCKED") {
      await prisma.userMissionObjective.update({
        where: { id: nextUserObjective.id },
        data: { status: "IN_PROGRESS" },
      })
    }
  }

  // Calculate new progress
  const totalObjectives = userMission.mission.objectives.length
  // Count completed including the one we just completed
  const completedCount =
    userMission.objectives.filter(
      (o) => o.status === "COMPLETED" || o.objectiveId === objectiveId
    ).length
  const newProgress =
    totalObjectives > 0
      ? Math.round((completedCount / totalObjectives) * 100)
      : 0

  // Update UserMission progress and status
  const newStatus =
    userMission.status === "PENDING" ? "IN_PROGRESS" : userMission.status

  await prisma.userMission.update({
    where: { id: userMission.id },
    data: {
      progress: newProgress,
      status: newStatus,
    },
  })

  return NextResponse.json({
    progress: newProgress,
    objectiveCompleted: objectiveId,
    nextUnlocked: nextObjective?.id ?? null,
  })
}
