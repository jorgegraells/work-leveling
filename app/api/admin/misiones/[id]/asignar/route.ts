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
      await prisma.userMission.create({
        data: { userId: uid, missionId: id, status: "PENDING", progress: 0 },
      })
      // Notify user
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
