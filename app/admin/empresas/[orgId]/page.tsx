import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresaDetail from "@/components/screens/admin/EmpresaDetail"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function EmpresaDetailPage({
  params,
}: {
  params: Promise<{ orgId: string }>
}) {
  const { orgId } = await params

  const result = await requireSuperAdmin()
  if (result instanceof Response) return null

  const user = result

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: {
      _count: { select: { users: true, missions: true, departments: true } },
      departments: {
        include: {
          manager: { select: { id: true, name: true, avatarUrl: true } },
          members: { include: { user: { select: { id: true, name: true } } } },
          _count: { select: { members: true } },
        },
      },
      users: {
        select: { id: true, name: true },
      },
      subscription: true,
    },
  })

  if (!org) notFound()

  const orgUsers = org.users.map((u) => ({ id: u.id, name: u.name }))

  const departmentsDetailed = org.departments.map((dept) => ({
    id: dept.id,
    name: dept.name,
    manager: dept.manager ? { id: dept.manager.id, name: dept.manager.name } : null,
    members: dept.members.map((m) => ({
      id: m.id,
      user: { id: m.user.id, name: m.user.name },
      role: m.role,
    })),
  }))

  const orgData = {
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    seats: org.seats,
    logoUrl: org.logoUrl,
    userCount: org._count.users,
    missionCount: org._count.missions,
    departmentCount: org._count.departments,
    subscription: org.subscription
      ? {
          status: org.subscription.status,
          quantity: org.subscription.quantity,
          currentPeriodEnd: org.subscription.currentPeriodEnd.toISOString(),
        }
      : null,
    departments: org.departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      memberCount: dept._count.members,
      manager: dept.manager
        ? { id: dept.manager.id, name: dept.manager.name, avatarUrl: dept.manager.avatarUrl }
        : null,
    })),
    createdAt: org.createdAt.toISOString(),
  }

  return (
    <SidebarLayout user={{ name: user.name, level: user.level, title: user.title ?? "Super Admin", avatarUrl: user.avatarUrl }}>
      <EmpresaDetail org={orgData} departments={departmentsDetailed} users={orgUsers} />
    </SidebarLayout>
  )
}
