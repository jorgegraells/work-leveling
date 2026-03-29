import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

// PATCH /api/admin/empresas/[orgId]/usuarios/[userId] — change role
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId, userId } = await params
  const body = await req.json()
  const { role, departmentId } = body as { role?: Role; departmentId?: string | null }

  const orgRole = await prisma.userOrganizationRole.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  if (!orgRole) {
    return NextResponse.json({ error: "User is not a member of this organization" }, { status: 404 })
  }

  const updated = await prisma.userOrganizationRole.update({
    where: { userId_organizationId: { userId, organizationId: orgId } },
    data: {
      ...(role !== undefined && { role }),
      ...(departmentId !== undefined && { departmentId }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/admin/empresas/[orgId]/usuarios/[userId] — remove from org
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string; userId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId, userId } = await params

  const orgRole = await prisma.userOrganizationRole.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  if (!orgRole) {
    return NextResponse.json({ error: "User is not a member of this organization" }, { status: 404 })
  }

  await prisma.userOrganizationRole.delete({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  })

  return new NextResponse(null, { status: 204 })
}
