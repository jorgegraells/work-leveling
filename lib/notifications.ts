import { prisma } from "@/lib/prisma"
import type { NotificationType } from "@prisma/client"

// ---------------------------------------------------------------------------
// Create a notification for a user
// ---------------------------------------------------------------------------

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, string | number | boolean | null>
) {
  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      data: data ?? undefined,
    },
  })
}

// ---------------------------------------------------------------------------
// Notify all ORG_ADMINs and MANAGERs of an organization
// ---------------------------------------------------------------------------

export async function notifyOrgAdmins(
  organizationId: string,
  type: NotificationType,
  title: string,
  body: string,
  data?: Record<string, string | number | boolean | null>
) {
  const approvers = await prisma.userOrganizationRole.findMany({
    where: {
      organizationId,
      role: { in: ["ORG_ADMIN", "MANAGER"] },
    },
    select: { userId: true },
  })

  await prisma.notification.createMany({
    data: approvers.map((a) => ({
      userId: a.userId,
      type,
      title,
      body,
      data: data ?? undefined,
    })),
  })
}

// ---------------------------------------------------------------------------
// Get unread count for a user
// ---------------------------------------------------------------------------

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, read: false },
  })
}
