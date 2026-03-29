import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// PATCH /api/me/invitaciones/[roleId] — accept invitation
export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const user = await requireCurrentUser()
  const { roleId } = await params

  const role = await prisma.userOrganizationRole.findUnique({
    where: { id: roleId },
  })

  if (!role || role.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  if (role.confirmed) {
    return NextResponse.json({ error: "Already confirmed" }, { status: 400 })
  }

  const updated = await prisma.userOrganizationRole.update({
    where: { id: roleId },
    data: { confirmed: true },
  })

  return NextResponse.json(updated)
}

// DELETE /api/me/invitaciones/[roleId] — reject invitation
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  const user = await requireCurrentUser()
  const { roleId } = await params

  const role = await prisma.userOrganizationRole.findUnique({
    where: { id: roleId },
  })

  if (!role || role.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  await prisma.userOrganizationRole.delete({ where: { id: roleId } })

  return new Response(null, { status: 204 })
}
