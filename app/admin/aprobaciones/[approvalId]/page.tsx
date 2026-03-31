import { redirect } from "next/navigation"
import SidebarLayout from "@/components/layout/SidebarLayout"
import AprobacionDetail from "@/components/screens/admin/AprobacionDetail"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

export default async function AprobacionDetailPage({
  params,
}: {
  params: Promise<{ approvalId: string }>
}) {
  const { approvalId } = await params
  const user = await requireCurrentUser()
  const t = await getTranslations("admin")

  const approval = await prisma.missionApproval.findUnique({
    where: { id: approvalId },
    include: {
      userMission: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              level: true,
              avatarUrl: true,
              title: true,
            },
          },
          mission: {
            include: {
              objectives: {
                orderBy: { order: "asc" },
              },
            },
          },
        },
      },
    },
  })

  if (!approval) {
    redirect("/admin/aprobaciones")
  }

  const missionTitle = approval.userMission.mission.title

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("breadcrumbApprovals"), href: "/admin/aprobaciones" },
        { label: missionTitle },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-8 overflow-y-auto">
          <AprobacionDetail approval={JSON.parse(JSON.stringify(approval))} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
