import ProyectosList from "@/components/screens/admin/ProyectosList"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function ProyectosPage() {
  const user = await requireCurrentUser()

  const missions = await prisma.mission.findMany({
    where: { organizationId: user.organizationId },
    include: {
      objectives: { orderBy: { order: "asc" } },
      _count: { select: { userMissions: true } },
      userMissions: { where: { status: "COMPLETED" }, select: { id: true } },
      createdBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  const missionsWithStats = missions.map((m) => ({
    ...m,
    completedCount: m.userMissions.length,
    userMissions: undefined,
  }))

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Proyectos" },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-8 overflow-y-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-headline font-bold text-on-surface">Proyectos & Misiones</h1>
              <p className="text-outline text-[10px] uppercase tracking-widest mt-1">Gestión de misiones de la organización</p>
            </div>
            <Link
              href="/admin/proyectos/nuevo"
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95"
            >
              Nueva Misión
            </Link>
          </div>
          <ProyectosList missions={JSON.parse(JSON.stringify(missionsWithStats))} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
