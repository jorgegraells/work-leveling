import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({ role: null, isSuperAdmin: false, orgId: null })
  }

  // Find the user's primary org role (first one found)
  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: { userId: user.id },
    select: { role: true, organizationId: true },
  })

  return NextResponse.json({
    role: orgRole?.role ?? null,
    isSuperAdmin: user.isSuperAdmin,
    orgId: orgRole?.organizationId ?? null,
  })
}
