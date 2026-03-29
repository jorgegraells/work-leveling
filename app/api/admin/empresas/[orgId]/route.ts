import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/admin/empresas/[orgId]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: { select: { users: true, missions: true, departments: true } },
      departments: {
        include: {
          manager: { select: { id: true, name: true, avatarUrl: true } },
          _count: { select: { members: true } },
        },
      },
      subscription: true,
    },
  })

  if (!org) {
    return NextResponse.json({ error: "Organization not found" }, { status: 404 })
  }

  return NextResponse.json(org)
}

// PATCH /api/admin/empresas/[orgId]
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params
  const body = await req.json()
  const { name, slug, plan, seats, logoUrl } = body

  // Check slug uniqueness if changing
  if (slug) {
    const existing = await prisma.organization.findFirst({
      where: { slug, NOT: { id: orgId } },
    })
    if (existing) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
    }
  }

  const org = await prisma.organization.update({
    where: { id: orgId },
    data: {
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(plan !== undefined && { plan }),
      ...(seats !== undefined && { seats }),
      ...(logoUrl !== undefined && { logoUrl }),
    },
  })

  return NextResponse.json(org)
}

// DELETE /api/admin/empresas/[orgId]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const { orgId } = await params

  await prisma.organization.delete({ where: { id: orgId } })

  return new NextResponse(null, { status: 204 })
}
