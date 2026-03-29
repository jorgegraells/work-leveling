import { NextRequest, NextResponse } from "next/server"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/admin/empresas — list all orgs (super admin only)
export async function GET() {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, departments: true } },
      subscription: { select: { status: true, quantity: true } },
    },
  })

  return NextResponse.json(orgs)
}

// POST /api/admin/empresas — create a new org
export async function POST(req: NextRequest) {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return result

  const body = await req.json()
  const { name, slug, plan, seats, clerkOrgId } = body

  if (!name || !slug || !clerkOrgId) {
    return NextResponse.json(
      { error: "name, slug, and clerkOrgId are required" },
      { status: 400 }
    )
  }

  // Check for slug uniqueness
  const existing = await prisma.organization.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: "Slug already taken" }, { status: 409 })
  }

  const org = await prisma.organization.create({
    data: {
      name,
      slug,
      clerkOrgId,
      plan: plan ?? "FREE",
      seats: seats ?? 5,
    },
  })

  return NextResponse.json(org, { status: 201 })
}
