import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
}

// GET /api/admin/misiones — list missions for the user's org
export async function GET() {
  const user = await requireCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Find the org role for this user
  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  if (!user.isSuperAdmin && (!orgRole || ROLE_RANK[orgRole.role] < ROLE_RANK["MANAGER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const organizationId = orgRole?.organizationId ?? user.organizationId

  const missions = await prisma.mission.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { userMissions: true } },
    },
  })

  // Add completedCount per mission
  const missionIds = missions.map((m) => m.id)
  const completedCounts = await prisma.userMission.groupBy({
    by: ["missionId"],
    where: { missionId: { in: missionIds }, status: "COMPLETED" },
    _count: { missionId: true },
  })
  const completedMap = Object.fromEntries(
    completedCounts.map((c) => [c.missionId, c._count.missionId])
  )

  const result = missions.map((m) => ({
    ...m,
    completedCount: completedMap[m.id] ?? 0,
  }))

  return NextResponse.json(result)
}

// POST /api/admin/misiones — create a mission
export async function POST(req: NextRequest) {
  const user = await requireCurrentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  if (!user.isSuperAdmin && (!orgRole || ROLE_RANK[orgRole.role] < ROLE_RANK["MANAGER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, module, icon, xpReward, priority, organizationId, objectives, startDate, dueDate, missionType, customReward } = body

  if (!title || !module || !icon || !organizationId) {
    return NextResponse.json(
      { error: "title, module, icon, and organizationId are required" },
      { status: 400 }
    )
  }

  const mission = await prisma.mission.create({
    data: {
      title,
      description: description ?? null,
      module,
      icon,
      xpReward: xpReward ?? 500,
      customReward: customReward ?? null,
      priority: priority ?? "NORMAL",
      isGlobal: false,
      organizationId,
      createdById: user.id,
      startDate: startDate ? new Date(startDate) : null,
      dueDate: dueDate ? new Date(dueDate) : null,
      missionType: missionType ?? "OBJECTIVE",
      objectives: {
        create: (objectives ?? []).map(
          (obj: { title: string; xpReward: number; order: number; icon: string }) => ({
            title: obj.title,
            xpReward: obj.xpReward ?? 100,
            order: obj.order,
            icon: obj.icon,
          })
        ),
      },
    },
    include: { objectives: { orderBy: { order: "asc" } } },
  })

  if (Array.isArray(body.skillIds) && body.skillIds.length > 0) {
    await prisma.missionSkill.createMany({
      data: body.skillIds.map((skillId: string) => ({ missionId: mission.id, skillId }))
    })
  }

  return NextResponse.json(mission, { status: 201 })
}
