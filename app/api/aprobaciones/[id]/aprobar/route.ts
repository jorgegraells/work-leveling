import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser, canApproveInOrg } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { calcSkillLevel } from "@/lib/skills"

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

  let result: Awaited<ReturnType<typeof prisma.$transaction>>
  try {
    result = await prisma.$transaction(async (tx) => {
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

    // 2b. Award skill points for skills tagged on this mission
    const missionSkills = await tx.missionSkill.findMany({
      where: { missionId: mission.id },
      select: { skillId: true },
    })
    for (const { skillId } of missionSkills) {
      const skillPts = Math.round(mission.xpReward * 0.2)
      const existing = await tx.userSkill.findUnique({
        where: { userId_skillId: { userId: employee.id, skillId } },
      })
      const newPoints = (existing?.points ?? 0) + skillPts
      const newSkillLevel = calcSkillLevel(newPoints)
      await tx.userSkill.upsert({
        where: { userId_skillId: { userId: employee.id, skillId } },
        update: { points: newPoints, level: newSkillLevel },
        create: { userId: employee.id, skillId, points: newPoints, level: newSkillLevel },
      })
      // Notify if skill level increased
      if (newSkillLevel > (existing?.level ?? 0)) {
        const skillRecord = await tx.skill.findUnique({ where: { id: skillId }, select: { name: true } })
        await tx.notification.create({
          data: {
            userId: employee.id,
            type: "SKILL_LEVEL_UP",
            title: "¡Nueva habilidad desbloqueada!",
            body: `Has alcanzado el nivel ${newSkillLevel} en ${skillRecord?.name ?? "tu habilidad"}`,
            data: { skillId, skillName: skillRecord?.name, newLevel: newSkillLevel },
          },
        })
      }
    }

    // 3. Add XP
    let xpMultiplier = 1.0
    // +20% for ALTA priority
    if (mission.priority === "ALTA") xpMultiplier += 0.2
    // +10% for early completion (completedAt before dueDate)
    const completedAt = approval.userMission.completedAt ?? new Date()
    if (mission.dueDate && completedAt < mission.dueDate) xpMultiplier += 0.1
    const xpGain = Math.round(mission.xpReward * xpMultiplier)
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
        reason: xpMultiplier > 1 ? `Misión aprobada: ${mission.title} (×${xpMultiplier.toFixed(1)})` : `Misión aprobada: ${mission.title}`,
      },
    })

    // 6. Notify employee with note and scores
    const noteText = note ? `\n\nNota del revisor: "${note}"` : ""
    await tx.notification.create({
      data: {
        userId: employee.id,
        type: "MISSION_APPROVED",
        title: "Misión aprobada",
        body: `Tu misión '${mission.title}' ha sido aprobada por ${currentUser.name}. +${xpGain} XP${noteText}`,
        data: {
          missionId: mission.id,
          approvalId: id,
          approverName: currentUser.name,
          note: note ?? "",
          xpGain,
          scores: {
            logica: body.scoreLogica,
            creatividad: body.scoreCreatividad,
            liderazgo: body.scoreLiderazgo,
            negociacion: body.scoreNegociacion,
            estrategia: body.scoreEstrategia,
            analisis: body.scoreAnalisis,
            comunicacion: body.scoreComunicacion,
            adaptabilidad: body.scoreAdaptabilidad,
          },
        },
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
    }, { timeout: 30000, maxWait: 35000 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[aprobar] transaction failed:", msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }

  return NextResponse.json(result)
}
