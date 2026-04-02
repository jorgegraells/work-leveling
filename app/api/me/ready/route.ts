import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET /api/me/ready — returns 200 if the DB user record exists, 202 if not yet
export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ ready: false }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: { id: true },
  })

  if (!user) return NextResponse.json({ ready: false }, { status: 202 })
  return NextResponse.json({ ready: true }, { status: 200 })
}
