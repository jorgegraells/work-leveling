import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser, canApproveInOrg } from "@/lib/auth-helpers"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"

const SCORE_KEYS = [
  "scoreLogica",
  "scoreCreatividad",
  "scoreLiderazgo",
  "scoreNegociacion",
  "scoreEstrategia",
  "scoreAnalisis",
  "scoreComunicacion",
  "scoreAdaptabilidad",
] as const

const SCORE_TO_ATTRIBUTE: Record<string, string> = {
  scoreLogica: "logica",
  scoreCreatividad: "creatividad",
  scoreLiderazgo: "liderazgo",
  scoreNegociacion: "negociacion",
  scoreEstrategia: "estrategia",
  scoreAnalisis: "analisis",
  scoreComunicacion: "comunicacion",
  scoreAdaptabilidad: "adaptabilidad",
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const currentUser = await requireCurrentUser()
  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Fetch approval to check org
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
  const canApprove = await canApproveInOrg(currentUser.id, employee.organizationId)
  if (!canApprove) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()

  // Validate all 8 scores are integers 1-5
  for (const key of SCORE_KEYS) {
    const val = body[key]
    if (typeof val !== "number" || !Number.isInteger(val) || val < 1 || val > 5) {
      return NextResponse.json(
        { error: `${key} must be an integer between 1 and 5` },
        { status: 400 }
      )
    }
  }

  const note = body.note ?? null
  const mission = approval.userMission.mission

  const result = await prisma.$transaction(async (tx) => {
    // 1. Update MissionApproval
    const updatedApproval = await tx.missionApproval.update({
      where: { id },
      data: {
        status: "APPROVED",
        note,
        scoreLogica: body.scoreLogica,
        scoreCreatividad: body.scoreCreatividad,
        scoreLiderazgo: body.scoreLiderazgo,
        scoreNegociacion: body.scoreNegociacion,
        scoreEstrategia: body.scoreEstrategia,
        scoreAnalisis: body.scoreAnalisis,
        scoreComunicacion: body.scoreComunicacion,
        scoreAdaptabilidad: body.scoreAdaptabilidad,
        reviewedAt: new Date(),
      },
    })

    // 2. Update UserAttributes
    for (const scoreKey of SCORE_KEYS) {
      const attrKey = SCORE_TO_ATTRIBUTE[scoreKey]
      const scoreValue = body[scoreKey] as number

      const attribute = await tx.attribute.findUnique({
        where: { key: attrKey },
      })

      if (attribute) {
        const existing = await tx.userAttribute.findUnique({
          where: {
            userId_attributeId: {
              userId: employee.id,
              attributeId: attribute.id,
            },
          },
        })

        const currentValue = existing?.value ?? 0
        const newValue = Math.min(100, currentValue + scoreValue * 4)

        await tx.userAttribute.upsert({
          where: {
            userId_attributeId: {
              userId: employee.id,
              attributeId: attribute.id,
            },
          },
          update: { value: newValue },
          create: {
            userId: employee.id,
            attributeId: attribute.id,
            value: newValue,
          },
        })
      }
    }

    // 3. Add XP
    const xpGain = mission.xpReward
    const newXp = employee.xp + xpGain

    // 4. Recalculate level
    const newLevel = Math.floor(Math.sqrt(newXp) / Math.sqrt(500)) + 1
    const xpToNextLevel = Math.max(0, (newLevel + 1) ** 2 * 500 - newXp)

    await tx.user.update({
      where: { id: employee.id },
      data: {
        xp: newXp,
        level: newLevel,
        xpToNextLevel,
      },
    })

    // 5. Create XpEvent
    await tx.xpEvent.create({
      data: {
        userId: employee.id,
        amount: xpGain,
        reason: `Misión aprobada: ${mission.title}`,
      },
    })

    // 6. Notify employee
    await tx.notification.create({
      data: {
        userId: employee.id,
        type: "MISSION_APPROVED",
        title: "Misión aprobada",
        body: `Tu misión '${mission.title}' ha sido aprobada. +${xpGain} XP`,
      },
    })

    // 7. Check if leveled up
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

    return { approval: updatedApproval, xpGain, newLevel }
  })

  return NextResponse.json(result)
}
