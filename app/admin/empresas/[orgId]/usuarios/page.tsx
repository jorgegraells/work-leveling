import SidebarLayout from "@/components/layout/SidebarLayout"
import UsuariosOrg from "@/components/screens/admin/UsuariosOrg"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function UsuariosOrgPage({
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
    select: { id: true, name: true },
  })

  if (!org) notFound()

  const members = await prisma.userOrganizationRole.findMany({
    where: { organizationId: orgId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          level: true,
          title: true,
        },
      },
      department: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const departments = await prisma.department.findMany({
    where: { organizationId: orgId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  })

  const membersData = members.map((m) => ({
    id: m.id,
    role: m.role,
    userId: m.userId,
    user: {
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      level: m.user.level,
      title: m.user.title,
    },
    department: m.department ? { id: m.department.id, name: m.department.name } : null,
    createdAt: m.createdAt.toISOString(),
  }))

  return (
    <SidebarLayout user={{ name: user.name, level: user.level, title: user.title ?? "Super Admin", avatarUrl: user.avatarUrl }}>
      <UsuariosOrg
        orgId={orgId}
        orgName={org.name}
        members={membersData}
        departments={departments}
      />
    </SidebarLayout>
  )
}
