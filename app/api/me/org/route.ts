import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const user = await requireCurrentUser()

  const body = await req.json().catch(() => null)
  if (!body || typeof body.orgId !== "string") {
    return NextResponse.json({ error: "orgId is required" }, { status: 400 })
  }

  const { orgId } = body

  // Verify user belongs to this org (superadmin bypasses)
  if (!user.isSuperAdmin) {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: { userId: user.id, organizationId: orgId, confirmed: true },
    })
    if (!orgRole) {
      return NextResponse.json({ error: "Not a member of this organization" }, { status: 403 })
    }
  }

  const cookieStore = await cookies()
  cookieStore.set("selected-org-id", orgId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: "lax",
  })

  return NextResponse.json({ success: true })
}
