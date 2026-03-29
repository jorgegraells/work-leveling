import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await requireCurrentUser()

  return NextResponse.json({
    name: user.name,
    email: user.email,
    title: user.title,
    avatarUrl: user.avatarUrl,
  })
}

export async function PATCH(req: NextRequest) {
  const user = await requireCurrentUser()
  const body = await req.json()

  const data: { name?: string; title?: string; avatarUrl?: string | null } = {}
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim()
  }
  if (typeof body.title === "string") {
    data.title = body.title.trim() || null
  }
  if (body.avatarUrl === null || (typeof body.avatarUrl === "string")) {
    data.avatarUrl = typeof body.avatarUrl === "string" && body.avatarUrl.trim()
      ? body.avatarUrl.trim()
      : null
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    select: { name: true, email: true, title: true, avatarUrl: true },
    data,
  })

  return NextResponse.json(updated)
}
