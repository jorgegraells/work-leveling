import ProyectoDetail from "@/components/screens/admin/ProyectoDetail"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

interface Props {
  params: Promise<{ missionId: string }>
}

export default async function ObjetivoDetailPage({ params }: Props) {
  const { missionId } = await params
  const user = await requireCurrentUser()
  const t = await getTranslations("admin")

  const [mission, skills] = await Promise.all([
    prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        objectives: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        skills: { include: { skill: true } },
        userMissions: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, level: true } },
            approval: true,
          },
        },
      },
    }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!mission) return redirect("/admin/objetivos")

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("breadcrumbProjects"), href: "/admin/objetivos" },
        { label: mission.title },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          <ProyectoDetail
            mission={JSON.parse(JSON.stringify(mission))}
            assignments={JSON.parse(JSON.stringify(mission.userMissions))}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
