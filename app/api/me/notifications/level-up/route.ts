import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

// GET — returns unread LEVEL_UP notifications and marks them as read
export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ notifications: [] })

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id, type: "LEVEL_UP", read: false },
    orderBy: { createdAt: "asc" },
  })

  if (notifications.length > 0) {
    await prisma.notification.updateMany({
      where: { id: { in: notifications.map((n) => n.id) } },
      data: { read: true },
    })
  }

  return NextResponse.json({ notifications })
}
