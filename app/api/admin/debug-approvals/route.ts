import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await requireCurrentUser()
  if (!user.isSuperAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const all = await prisma.missionApproval.findMany({
    include: {
      userMission: {
        include: {
          user: { select: { name: true, email: true } },
          mission: { select: { title: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  })

  return NextResponse.json(all)
}
