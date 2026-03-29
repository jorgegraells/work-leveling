import { NextRequest, NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET /api/notificaciones
// ?count=true → { unread: number }
// without count → { notifications, unreadCount }
export async function GET(req: NextRequest) {
  const user = await requireCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const countOnly = req.nextUrl.searchParams.get("count") === "true"

  if (countOnly) {
    const unread = await prisma.notification.count({
      where: { userId: user.id, read: false },
    })
    return NextResponse.json({ unread })
  }

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({
      where: { userId: user.id, read: false },
    }),
  ])

  return NextResponse.json({ notifications, unreadCount })
}

// PATCH /api/notificaciones — mark as read
export async function PATCH(req: NextRequest) {
  const user = await requireCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const ids: string[] | undefined = body.ids

  if (ids && Array.isArray(ids) && ids.length > 0) {
    await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        userId: user.id,
      },
      data: { read: true },
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    })
  }

  return NextResponse.json({ success: true })
}
