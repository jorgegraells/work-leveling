import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/me/invitaciones — pending invitations for current user
export async function GET() {
  const user = await requireCurrentUser()

  const pending = await prisma.userOrganizationRole.findMany({
    where: { userId: user.id, confirmed: false },
    include: {
      organization: { select: { id: true, name: true, slug: true, plan: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(pending)
}
