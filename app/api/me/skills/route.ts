import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/me/skills — returns the current user's UserSkill records with skill details
export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const userSkills = await prisma.userSkill.findMany({
    where: { userId: user.id },
    include: {
      skill: {
        select: { name: true, slug: true, icon: true, color: true },
      },
    },
    orderBy: { level: "desc" },
  })

  return NextResponse.json(userSkills)
}
