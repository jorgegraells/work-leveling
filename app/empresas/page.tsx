import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresasSwitcher from "@/components/screens/EmpresasSwitcher"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Plan, Role } from "@prisma/client"

export default async function EmpresasPage() {
  const user = await requireCurrentUser()

  const orgRoles = await prisma.userOrganizationRole.findMany({
    where: { userId: user.id },
    include: { organization: true },
  })

  const orgs = orgRoles.map((or) => ({
    id: or.organization.id,
    name: or.organization.name,
    slug: or.organization.slug,
    plan: or.organization.plan as Plan,
    role: or.role as Role,
  }))

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: "Empresas" }]}
    >
      <EmpresasSwitcher orgs={orgs} currentOrgId={user.organizationId} />
    </SidebarLayout>
  )
}
