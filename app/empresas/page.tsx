import type { Metadata } from "next"
export const metadata: Metadata = { title: "Empresas | Work Leveling", description: "Gestiona tus organizaciones" }

import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresasSwitcher from "@/components/screens/EmpresasSwitcher"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { Plan, Role } from "@prisma/client"
import { getTranslations } from "next-intl/server"

export default async function EmpresasPage() {
  const user = await requireCurrentUser()
  const t = await getTranslations("empresas")

  // Confirmed org memberships
  const confirmedRoles = await prisma.userOrganizationRole.findMany({
    where: { userId: user.id, confirmed: true },
    include: { organization: true },
  })

  const orgs = confirmedRoles.map((or) => ({
    id: or.organization.id,
    name: or.organization.name,
    slug: or.organization.slug,
    plan: or.organization.plan as Plan,
    role: or.role as Role,
  }))

  // Pending invitations
  const pendingRoles = await prisma.userOrganizationRole.findMany({
    where: { userId: user.id, confirmed: false },
    include: { organization: { select: { id: true, name: true, slug: true, plan: true } } },
  })

  const pendingInvitations = pendingRoles.map((pr) => ({
    id: pr.id,
    role: pr.role as Role,
    organization: {
      id: pr.organization.id,
      name: pr.organization.name,
      slug: pr.organization.slug,
      plan: pr.organization.plan as Plan,
    },
  }))

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: t("breadcrumb") }]}
    >
      <div className="px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full">
        <h1 className="font-headline text-2xl font-bold text-on-surface mb-8">{t("breadcrumb")}</h1>
        <EmpresasSwitcher
          orgs={orgs}
          currentOrgId={user.organizationId ?? ""}
          pendingInvitations={pendingInvitations}
        />
      </div>
    </SidebarLayout>
  )
}
