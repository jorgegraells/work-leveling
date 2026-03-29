import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresasList from "@/components/screens/admin/EmpresasList"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function EmpresasPage() {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return null

  const user = result

  const orgs = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { users: true, departments: true } },
      subscription: { select: { status: true } },
    },
  })

  const empresas = orgs.map((org) => ({
    id: org.id,
    name: org.name,
    slug: org.slug,
    plan: org.plan,
    seats: org.seats,
    userCount: org._count.users,
    departmentCount: org._count.departments,
    subscriptionStatus: org.subscription?.status ?? null,
    createdAt: org.createdAt.toISOString(),
  }))

  return (
    <SidebarLayout user={{ name: user.name, level: user.level, title: user.title ?? "Super Admin" }}>
      <EmpresasList empresas={empresas} />
    </SidebarLayout>
  )
}
