import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await requireCurrentUser()
  if (user instanceof NextResponse) return user
  return NextResponse.json({ avatarUrl: user.avatarUrl ?? null })
}

export async function POST(req: Request) {
  const user = await requireCurrentUser()
  if (user instanceof NextResponse) return user

  const body = await req.json().catch(() => null)
  if (!body || typeof body.avatarUrl !== "string") {
    return NextResponse.json({ error: "avatarUrl is required" }, { status: 400 })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { avatarUrl: body.avatarUrl },
  })

  return NextResponse.json({ success: true })
}
