import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser, canApproveInOrg } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// POST /api/aprobaciones/objetivos/[userMissionObjectiveId]
// Manager approves or rejects a single UserMissionObjective.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userMissionObjectiveId: string }> }
) {
  const { userMissionObjectiveId } = await params
  const currentUser = await requireCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Load the objective with its context
  const userObjective = await prisma.userMissionObjective.findUnique({
    where: { id: userMissionObjectiveId },
    include: {
      userMission: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              organizationId: true,
              isSuperAdmin: true,
              xp: true,
              level: true,
              kredits: true,
            },
          },
          mission: {
            select: {
              id: true,
              title: true,
              xpReward: true,
              priority: true,
              dueDate: true,
              kreditsReward: true,
            },
          },
        },
      },
      objective: true,
    },
  })

  if (!userObjective) {
    return NextResponse.json({ error: "Objective not found" }, { status: 404 })
  }

  if (!userObjective.submittedAt) {
    return NextResponse.json({ error: "Objective has not been submitted yet" }, { status: 400 })
  }

  if (userObjective.managerApproved !== null) {
    return NextResponse.json({ error: "Objective already reviewed" }, { status: 409 })
  }

  const employee = userObjective.userMission.user

  // Check manager permission for the org
  const canApprove = employee.organizationId
    ? await canApproveInOrg(currentUser.id, employee.organizationId)
    : currentUser.isSuperAdmin
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const action: "approve" | "reject" = body.action
  const note: string | undefined = body.note

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 })
  }

  if (action === "reject" && !note?.trim()) {
    return NextResponse.json({ error: "A note is required when rejecting" }, { status: 400 })
  }

  const approved = action === "approve"

  const updated = await prisma.userMissionObjective.update({
    where: { id: userMissionObjectiveId },
    data: {
      managerApproved: approved,
      managerNote: note ?? null,
      managerApprovedAt: new Date(),
    },
  })

  // After updating the objective, if approved, check if all objectives are now approved
  if (approved) {
    const allObjectives = await prisma.userMissionObjective.findMany({
      where: { userMissionId: userObjective.userMissionId },
    })

    const allApproved = allObjectives.length > 0 && allObjectives.every((o) => o.managerApproved === true)

    if (allApproved) {
      const mission = userObjective.userMission.mission

      // XP multipliers
      let xpMultiplier = 1.0
      if (mission.priority === "ALTA") xpMultiplier += 0.2
      const completedAt = new Date()
      if (mission.dueDate && completedAt < mission.dueDate) xpMultiplier += 0.1
      const xpGain = Math.round(mission.xpReward * xpMultiplier)
      const newXp = employee.xp + xpGain
      const newLevel = Math.floor(Math.sqrt(newXp) / Math.sqrt(500)) + 1
      const xpToNextLevel = Math.max(0, (newLevel + 1) ** 2 * 500 - newXp)

      await prisma.$transaction(async (tx) => {
        // Mark UserMission as completed
        await tx.userMission.update({
          where: { id: userObjective.userMissionId },
          data: { status: "COMPLETED", progress: 100, completedAt },
        })

        // Award XP + level
        await tx.user.update({
          where: { id: employee.id },
          data: { xp: newXp, level: newLevel, xpToNextLevel },
        })

        // Award kredits if mission has kreditsReward
        if (mission.kreditsReward && mission.kreditsReward > 0) {
          await tx.user.update({
            where: { id: employee.id },
            data: { kredits: { increment: mission.kreditsReward } },
          })
        }

        // XP event
        await tx.xpEvent.create({
          data: {
            userId: employee.id,
            amount: xpGain,
            reason: xpMultiplier > 1
              ? `Objetivo completado: ${mission.title} (×${xpMultiplier.toFixed(1)})`
              : `Objetivo completado: ${mission.title}`,
          },
        })

        // Notify employee
        await tx.notification.create({
          data: {
            userId: employee.id,
            type: "MISSION_APPROVED",
            title: "¡Objetivo completado!",
            body: `Has completado el objetivo "${mission.title}". +${xpGain} XP`,
            data: { missionId: mission.id, xpGain },
          },
        })

        // Level up notification
        if (newLevel > employee.level) {
          await tx.notification.create({
            data: {
              userId: employee.id,
              type: "LEVEL_UP",
              title: "¡Subiste de nivel!",
              body: `Has alcanzado el nivel ${newLevel}. ¡Sigue así!`,
            },
          })
        }
      })
    }
  }

  // Notify the employee
  const mission = userObjective.userMission.mission
  const objectiveTitle = userObjective.objective.title
  const notifType = approved ? "MISSION_OBJECTIVE_APPROVED" : "MISSION_OBJECTIVE_REJECTED"
  const notifTitle = approved ? "Misión aprobada" : "Misión rechazada"
  const notifBody = approved
    ? `Tu misión "${objectiveTitle}" en el proyecto "${mission.title}" ha sido aprobada por ${currentUser.name}.`
    : `Tu misión "${objectiveTitle}" en el proyecto "${mission.title}" fue rechazada por ${currentUser.name}${note ? `: "${note}"` : "."}`

  await prisma.notification.create({
    data: {
      userId: employee.id,
      type: notifType,
      title: notifTitle,
      body: notifBody,
      data: {
        userMissionObjectiveId,
        objectiveTitle,
        missionTitle: mission.title,
        approverName: currentUser.name,
        note: note ?? "",
        approved,
      },
    },
  })

  return NextResponse.json(updated)
}
