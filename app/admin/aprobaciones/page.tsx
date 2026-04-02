import type { Metadata } from "next"
export const metadata: Metadata = { title: "Aprobaciones | Admin" }

import { getTranslations } from "next-intl/server"
import SidebarLayout from "@/components/layout/SidebarLayout"
import AprobacionesList from "@/components/screens/admin/AprobacionesList"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function AprobacionesPage() {
  const t = await getTranslations("aprobaciones")
  const user = await requireCurrentUser()

  // Build org filter: superadmin sees all; managers see only their org
  let orgFilter = {}
  if (!user.isSuperAdmin) {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: { userId: user.id, confirmed: true, role: { in: ["MANAGER", "ORG_ADMIN"] } },
    })
    if (orgRole) {
      orgFilter = { userMission: { user: { orgRoles: { some: { organizationId: orgRole.organizationId } } } } }
    }
  }

  const approvals = await prisma.missionApproval.findMany({
    where: {
      status: "PENDING",
      ...orgFilter,
    },
    include: {
      userMission: {
        select: {
          id: true,
          completedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              level: true,
              avatarUrl: true,
            },
          },
          mission: {
            select: {
              id: true,
              title: true,
              module: true,
              icon: true,
              xpReward: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("pendingTitle") },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">
              {t("pendingTitle")}
            </h1>
            <p className="text-outline text-[10px] uppercase tracking-widest mt-1">
              {t("pendingSubtitle")}
            </p>
          </div>
          <AprobacionesList approvals={JSON.parse(JSON.stringify(approvals))} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
