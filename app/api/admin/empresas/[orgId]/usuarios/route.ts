import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { createNotification } from "@/lib/notifications"
import type { Role } from "@prisma/client"

// GET /api/admin/empresas/[orgId]/usuarios
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params

  const members = await prisma.userOrganizationRole.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          level: true,
          title: true,
        },
      },
      department: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(members)
}

// POST /api/admin/empresas/[orgId]/usuarios — assign a user to the org
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params
  const body = await req.json()
  const { userEmail, role, departmentId } = body as {
    userEmail: string
    role: Role
    departmentId?: string
  }

  if (!userEmail || !role) {
    return NextResponse.json({ error: "userEmail and role are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email: userEmail } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  // Get org name for the notification
  const org = await prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } })

  // Upsert: if the user already has a role in this org, update it
  const orgRole = await prisma.userOrganizationRole.upsert({
    where: { userId_organizationId: { userId: user.id, organizationId: orgId } },
    create: {
      userId: user.id,
      organizationId: orgId,
      role,
      departmentId: departmentId ?? null,
      confirmed: false, // requires user confirmation
    },
    update: {
      role,
      departmentId: departmentId ?? null,
    },
  })

  // Notify the user about the invitation
  await createNotification(
    user.id,
    "MISSION_ASSIGNED", // reusing type for now
    "Invitación a empresa",
    `Has sido invitado a ${org?.name ?? "una empresa"} como ${role}. Ve a Empresas para aceptar.`
  )

  return NextResponse.json(orgRole, { status: 201 })
}
