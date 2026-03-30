import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import type { Role } from "@prisma/client"

// ---------------------------------------------------------------------------
// Get current authenticated user from DB (null if not found)
// ---------------------------------------------------------------------------

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
  })
}

// ---------------------------------------------------------------------------
// Get current user or redirect to sign-in
// ---------------------------------------------------------------------------

export async function requireCurrentUser() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  })

  if (!user) redirect("/sign-in")
  return user
}

// ---------------------------------------------------------------------------
// Require super admin or return 403 response
// ---------------------------------------------------------------------------

export async function requireSuperAdmin() {
  const user = await requireCurrentUser()

  if (!user.isSuperAdmin) {
    return new Response("Forbidden", { status: 403 })
  }

  return user
}

// ---------------------------------------------------------------------------
// Require super admin OR org-level manager/admin role, or return 403
// ---------------------------------------------------------------------------

export async function requireAdminAccess() {
  const user = await requireCurrentUser()

  if (user.isSuperAdmin) return user

  // Check if user has at least MANAGER role in any org
  const orgRole = await prisma.userOrganizationRole.findFirst({
    where: {
      userId: user.id,
      confirmed: true,
      role: { in: ["MANAGER", "ORG_ADMIN"] },
    },
    include: { organization: true },
  })

  if (!orgRole) {
    return new Response("Forbidden", { status: 403 })
  }

  return user
}

// ---------------------------------------------------------------------------
// Get a user's role in a specific organization (null if not a member)
// ---------------------------------------------------------------------------

export async function getUserOrgRole(userId: string, organizationId: string) {
  return prisma.userOrganizationRole.findUnique({
    where: { userId_organizationId: { userId, organizationId } },
    include: { organization: true, department: true },
  })
}

// ---------------------------------------------------------------------------
// Require a minimum role in an org, or return 403
// Role hierarchy: SUPER_ADMIN > ORG_ADMIN > MANAGER > MEMBER
// ---------------------------------------------------------------------------

const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 4,
  ORG_ADMIN:   3,
  MANAGER:     2,
  MEMBER:      1,
}

export async function requireOrgRole(organizationId: string, minRole: Role) {
  const user = await requireCurrentUser()

  // Super admins bypass all org-level checks
  if (user.isSuperAdmin) return { user, orgRole: null }

  const orgRole = await getUserOrgRole(user.id, organizationId)

  if (!orgRole || ROLE_RANK[orgRole.role] < ROLE_RANK[minRole]) {
    return new Response("Forbidden", { status: 403 })
  }

  return { user, orgRole }
}

// ---------------------------------------------------------------------------
// Check if current user can manage approvals for an org
// (ORG_ADMIN or MANAGER)
// ---------------------------------------------------------------------------

export async function canApproveInOrg(userId: string, organizationId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return false
  if (user.isSuperAdmin) return true

  const orgRole = await getUserOrgRole(userId, organizationId)
  if (!orgRole) return false

  return ROLE_RANK[orgRole.role] >= ROLE_RANK["MANAGER"]
}
