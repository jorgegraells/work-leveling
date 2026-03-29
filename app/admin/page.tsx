import SidebarLayout from "@/components/layout/SidebarLayout"
import AdminDashboard from "@/components/screens/admin/AdminDashboard"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function AdminPage() {
  // Layout already verified super admin, but we need the user object for SidebarLayout
  const result = await requireSuperAdmin()
  if (result instanceof Response) return null

  const user = result

  // Aggregate stats
  const [totalOrgs, totalUsers, pendingApprovals] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.missionApproval.count({ where: { status: "PENDING" } }),
  ])

  return (
    <SidebarLayout user={{ name: user.name, level: user.level, title: user.title ?? "Super Admin", avatarUrl: user.avatarUrl }}>
      <AdminDashboard
        totalOrgs={totalOrgs}
        totalUsers={totalUsers}
        pendingApprovals={pendingApprovals}
      />
    </SidebarLayout>
  )
}
