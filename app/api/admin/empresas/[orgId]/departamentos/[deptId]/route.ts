import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// PATCH /api/admin/empresas/[orgId]/departamentos/[deptId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string; deptId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId, deptId } = await params
  const body = await req.json()
  const { name, managerId } = body

  const dept = await prisma.department.findFirst({
    where: { id: deptId, organizationId: orgId },
  })

  if (!dept) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 })
  }

  const updated = await prisma.department.update({
    where: { id: deptId },
    data: {
      ...(name !== undefined && { name }),
      ...(managerId !== undefined && { managerId }),
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/admin/empresas/[orgId]/departamentos/[deptId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string; deptId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId, deptId } = await params

  const dept = await prisma.department.findFirst({
    where: { id: deptId, organizationId: orgId },
  })

  if (!dept) {
    return NextResponse.json({ error: "Department not found" }, { status: 404 })
  }

  await prisma.department.delete({ where: { id: deptId } })

  return new NextResponse(null, { status: 204 })
}
