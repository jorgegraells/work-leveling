import ProyectoDetail from "@/components/screens/admin/ProyectoDetail"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

interface Props {
  params: Promise<{ missionId: string }>
}

export default async function ProyectoDetailPage({ params }: Props) {
  const { missionId } = await params
  const user = await requireCurrentUser()

  const mission = await prisma.mission.findUnique({
    where: { id: missionId },
    include: {
      objectives: { orderBy: { order: "asc" } },
      userMissions: {
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, level: true } },
          approval: true,
        },
      },
    },
  })

  if (!mission) return redirect("/admin/proyectos")

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive" }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Proyectos", href: "/admin/proyectos" },
        { label: mission.title },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full overflow-y-auto">
          <ProyectoDetail
            mission={JSON.parse(JSON.stringify(mission))}
            assignments={JSON.parse(JSON.stringify(mission.userMissions))}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
