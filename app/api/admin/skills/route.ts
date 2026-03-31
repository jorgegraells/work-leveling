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

// POST /api/admin/skills — creates a skill (superAdmin only)
export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json()
  const { name, slug, icon, color } = body

  if (!name || !slug) {
    return NextResponse.json(
      { error: "name and slug are required" },
      { status: 400 }
    )
  }

  const skill = await prisma.skill.create({
    data: {
      name,
      slug,
      icon: icon ?? "star",
      color: color ?? "primary",
    },
  })

  return NextResponse.json(skill, { status: 201 })
}
