import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/admin/skills — returns all skills ordered by name
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const skills = await prisma.skill.findMany({
    orderBy: { name: "asc" },
  })

  return NextResponse.json(skills)
}

// POST /api/admin/skills — creates a custom skill (org admins and managers allowed)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Must be superAdmin, or have an org role of MANAGER/ORG_ADMIN
  if (!user.isSuperAdmin) {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: { userId: user.id, confirmed: true, role: { in: ["MANAGER", "ORG_ADMIN"] } },
    })
    if (!orgRole) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  const body = await req.json()
  const { name } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 })
  }

  // Auto-generate slug from name
  const slug = name.trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")

  // If slug already exists, return the existing skill
  const existing = await prisma.skill.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json(existing, { status: 200 })
  }

  const skill = await prisma.skill.create({
    data: {
      name: name.trim(),
      slug,
      icon: "star",
      color: "primary",
      category: "Personalizado",
    },
  })

  return NextResponse.json(skill, { status: 201 })
}
