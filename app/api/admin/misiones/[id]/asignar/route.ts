import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { createNotification } from "@/lib/notifications"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN: 3,
  MANAGER: 2,
  MEMBER: 1,
}

// POST /api/admin/misiones/[id]/asignar
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  })

  if (!user.isSuperAdmin && (!orgRole || ROLE_RANK[orgRole.role] < ROLE_RANK["MANAGER"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const mission = await prisma.mission.findUnique({ where: { id } })
  if (!mission) return NextResponse.json({ error: "Mission not found" }, { status: 404 })

  if (!user.isSuperAdmin && mission.organizationId !== null && mission.organizationId !== user.organizationId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { userIds, departmentId }: { userIds?: string[]; departmentId?: string } = body

  let targetUserIds: string[] = []

  if (departmentId) {
    // Find all users in the department
    const deptRoles = await prisma.userOrganizationRole.findMany({
      where: { departmentId },
      select: { userId: true },
    })
    targetUserIds = deptRoles.map((r) => r.userId)
  } else if (userIds && userIds.length > 0) {
    targetUserIds = userIds
  } else {
    return NextResponse.json(
      { error: "Provide userIds or departmentId" },
      { status: 400 }
    )
  }

  let assigned = 0
  for (const uid of targetUserIds) {
    const existing = await prisma.userMission.findUnique({
      where: { userId_missionId: { userId: uid, missionId: id } },
    })
    if (!existing) {
      // Fetch mission objectives to create user objectives
      const objectives = await prisma.missionObjective.findMany({
        where: { missionId: id },
        orderBy: { order: "asc" },
      })

      const userMission = await prisma.userMission.create({
        data: { userId: uid, missionId: id, status: "PENDING", progress: 0 },
      })

      // Create UserMissionObjective for each objective
      // First one is IN_PROGRESS, rest are LOCKED
      for (let i = 0; i < objectives.length; i++) {
        await prisma.userMissionObjective.create({
          data: {
            userMissionId: userMission.id,
            objectiveId: objectives[i].id,
            status: i === 0 ? "IN_PROGRESS" : "LOCKED",
          },
        })
      }

      await createNotification(
        uid,
        "MISSION_ASSIGNED",
        "Nueva misión asignada",
        `Se te ha asignado la misión: ${mission.title}`
      )
      assigned++
    }
  }

  return NextResponse.json({ assigned })
}
