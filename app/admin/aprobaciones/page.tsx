import type { Metadata } from "next"
export const metadata: Metadata = { title: "Aprobaciones | Admin" }

import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"
import Link from "next/link"
import SidebarLayout from "@/components/layout/SidebarLayout"
import AprobacionesList from "@/components/screens/admin/AprobacionesList"
import AprobacionesObjetivosList from "@/components/screens/admin/AprobacionesObjetivosList"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function AprobacionesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const t = await getTranslations("aprobaciones")
  const user = await requireCurrentUser()

  // ---------------------------------------------------------------------------
  // Selected org + allOrgs toggle
  // ---------------------------------------------------------------------------
  const cookieStore = await cookies()
  const selectedOrgId = cookieStore.get("selected-org-id")?.value ?? null
  const resolvedParams = await searchParams
  const showAllOrgs = !selectedOrgId || resolvedParams.allOrgs === "true"

  // ---------------------------------------------------------------------------
  // Org filter for UserMissionObjective query
  // UserMissionObjective → UserMission → Mission → organizationId
  // ---------------------------------------------------------------------------
  type MissionOrgFilter =
    | { mission: { organizationId: string } }
    | Record<string, never>

  const missionOrgFilter: MissionOrgFilter =
    !showAllOrgs && selectedOrgId
      ? { mission: { organizationId: selectedOrgId } }
      : {}

  // ---------------------------------------------------------------------------
  // Query pending objective submissions
  // ---------------------------------------------------------------------------
  const pendingObjectivesRaw = await prisma.userMissionObjective.findMany({
    where: {
      submittedAt: { not: null },
      managerApproved: null,
      userMission: {
        status: { not: "ARCHIVED" },
        ...missionOrgFilter,
      },
    },
    include: {
      objective: { select: { title: true, icon: true, xpReward: true } },
      userMission: {
        include: {
          user: { select: { id: true, name: true, level: true, avatarUrl: true } },
          mission: {
            select: {
              id: true,
              title: true,
              module: true,
              icon: true,
              xpReward: true,
              dueDate: true,
              priority: true,
              organizationId: true,
              organization: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { submittedAt: "asc" },
  })

  // ---------------------------------------------------------------------------
  // Legacy MissionApproval query (kept for backwards compatibility)
  // ---------------------------------------------------------------------------
  let orgFilter = {}
  if (user.isSuperAdmin) {
    if (!showAllOrgs && selectedOrgId) {
      orgFilter = { userMission: { mission: { organizationId: selectedOrgId } } }
    }
  } else {
    const orgRole = await prisma.userOrganizationRole.findFirst({
      where: { userId: user.id, confirmed: true, role: { in: ["MANAGER", "ORG_ADMIN"] } },
    })
    if (orgRole) {
      orgFilter = { userMission: { user: { orgRoles: { some: { organizationId: orgRole.organizationId } } } } }
    }
  }

  const approvalInclude = {
    userMission: {
      select: {
        id: true,
        completedAt: true,
        user: {
          select: { id: true, name: true, level: true, avatarUrl: true },
        },
        mission: {
          select: { id: true, title: true, module: true, icon: true, xpReward: true },
        },
      },
    },
  }

  const approvals = await prisma.missionApproval.findMany({
    where: { status: "PENDING", ...orgFilter },
    include: approvalInclude,
    orderBy: { createdAt: "desc" },
  })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const rejectedApprovals = await prisma.missionApproval.findMany({
    where: { status: "REJECTED", reviewedAt: { gte: sevenDaysAgo }, ...orgFilter },
    include: approvalInclude,
    orderBy: { reviewedAt: "desc" },
  })

  // Serialize dates for client components
  const pendingObjectives = JSON.parse(JSON.stringify(pendingObjectivesRaw))

  // ---------------------------------------------------------------------------
  // Toggle URL
  // ---------------------------------------------------------------------------
  const toggleHref = showAllOrgs
    ? "/admin/aprobaciones"
    : "/admin/aprobaciones?allOrgs=true"

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
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-10 overflow-y-auto">

          {/* Page header + org toggle */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-headline font-bold text-on-surface">
                {t("pendingTitle")}
              </h1>
              <p className="text-outline text-[10px] uppercase tracking-widest mt-1">
                {t("pendingSubtitle")}
              </p>
            </div>

            {selectedOrgId && (
              <Link
                href={toggleHref}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-highest hover:bg-surface-bright transition-colors active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-sm text-outline">
                  {showAllOrgs ? "filter_alt" : "language"}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">
                  {showAllOrgs ? t("currentOrgToggle") : t("allOrgsToggle")}
                </span>
              </Link>
            )}
          </div>

          {/* PRIMARY: per-objective submissions */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("pendingObjectivesTitle")}
            </p>
            <AprobacionesObjetivosList
              pendingObjectives={pendingObjectives}
              selectedOrgId={selectedOrgId}
              showAllOrgs={showAllOrgs}
            />
          </div>

          {/* SECONDARY: legacy mission-level approvals (only show if any exist) */}
          {(approvals.length > 0 || rejectedApprovals.length > 0) && (
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Aprobaciones de misión (legacy)
              </p>
              <AprobacionesList
                approvals={JSON.parse(JSON.stringify(approvals))}
                rejectedApprovals={JSON.parse(JSON.stringify(rejectedApprovals))}
              />
            </div>
          )}

        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
