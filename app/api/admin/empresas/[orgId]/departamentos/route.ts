import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/admin/empresas/[orgId]/departamentos
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params

  const depts = await prisma.department.findMany({
    where: { organizationId: orgId },
    include: {
      manager: { select: { id: true, name: true, avatarUrl: true } },
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  })

  return NextResponse.json(depts)
}

// POST /api/admin/empresas/[orgId]/departamentos
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params
  const body = await req.json()
  const { name, managerId } = body

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  const dept = await prisma.department.create({
    data: {
      name,
      organizationId: orgId,
      managerId: managerId ?? null,
    },
  })

  return NextResponse.json(dept, { status: 201 })
}
