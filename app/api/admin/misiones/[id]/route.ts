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

async function assertCanManage(userId: string, isSuperAdmin: boolean) {
  if (isSuperAdmin) return true
  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  })
  return orgRole && ROLE_RANK[orgRole.role] >= ROLE_RANK["MANAGER"]
}

// GET /api/admin/misiones/[id] — mission detail with objectives + assignment stats
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canManage = await assertCanManage(user.id, user.isSuperAdmin)
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const mission = await prisma.mission.findUnique({
    where: { id },
    include: {
      objectives: { orderBy: { order: "asc" } },
      _count: { select: { userMissions: true } },
    },
  })

  if (!mission) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const completedCount = await prisma.userMission.count({
    where: { missionId: id, status: "COMPLETED" },
  })

  const assignments = await prisma.userMission.findMany({
    where: { missionId: id },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, level: true } },
      approval: { select: { status: true } },
    },
    orderBy: { startedAt: "desc" },
  })

  return NextResponse.json({ mission: { ...mission, completedCount }, assignments })
}

// PATCH /api/admin/misiones/[id] — update mission + objectives
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canManage = await assertCanManage(user.id, user.isSuperAdmin)
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json()
  const { title, description, module, icon, xpReward, priority, objectives } = body

  // Update mission fields
  const updated = await prisma.mission.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(module !== undefined && { module }),
      ...(icon !== undefined && { icon }),
      ...(xpReward !== undefined && { xpReward }),
      ...(priority !== undefined && { priority }),
    },
  })

  // If objectives array provided, replace them all
  if (Array.isArray(objectives)) {
    // Delete old objectives
    await prisma.missionObjective.deleteMany({ where: { missionId: id } })
    // Create new ones
    if (objectives.length > 0) {
      await prisma.missionObjective.createMany({
        data: objectives.map(
          (obj: { title: string; xpReward: number; order: number; icon: string }) => ({
            missionId: id,
            title: obj.title,
            xpReward: obj.xpReward ?? 100,
            order: obj.order,
            icon: obj.icon,
          })
        ),
      })
    }
  }

  const result = await prisma.mission.findUnique({
    where: { id },
    include: { objectives: { orderBy: { order: "asc" } } },
  })

  return NextResponse.json({ mission: updated, objectives: result?.objectives ?? [] })
}

// DELETE /api/admin/misiones/[id] — archive mission (set all userMissions to ARCHIVED)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const user = await requireCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const canManage = await assertCanManage(user.id, user.isSuperAdmin)
  if (!canManage) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  // Archive all userMissions for this mission
  await prisma.userMission.updateMany({
    where: { missionId: id },
    data: { status: "ARCHIVED" },
  })

  return NextResponse.json({ archived: true })
}
