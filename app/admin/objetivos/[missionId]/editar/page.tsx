import ProyectoForm from "@/components/screens/admin/ProyectoForm"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ missionId: string }> }): Promise<Metadata> {
  const { missionId } = await params
  const mission = await prisma.mission.findUnique({ where: { id: missionId }, select: { title: true } })
  return { title: mission ? `Editar: ${mission.title} | Admin` : "Editar Objetivo | Admin" }
}

interface Props {
  params: Promise<{ missionId: string }>
}

export default async function EditarObjetivoPage({ params }: Props) {
  const { missionId } = await params
  const user = await requireCurrentUser()
  const t = await getTranslations("admin")

  const [mission, orgs, skills] = await Promise.all([
    prisma.mission.findUnique({
      where: { id: missionId },
      include: {
        objectives: { orderBy: { order: "asc" } },
        createdBy: { select: { name: true } },
        skills: { select: { skillId: true } },
      },
    }),
    user.isSuperAdmin
      ? prisma.organization.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } })
      : prisma.organization.findMany({
          where: {
            orgRoles: {
              some: { userId: user.id, confirmed: true, role: { in: ["MANAGER", "ORG_ADMIN"] } },
            },
          },
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        }),
    prisma.skill.findMany({ orderBy: { name: "asc" } }),
  ])

  if (!mission) return redirect("/admin/objetivos")

  const initialSkillIds = mission.skills.map((s) => s.skillId)

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("breadcrumbProjects"), href: "/admin/objetivos" },
        { label: mission.title, href: `/admin/objetivos/${missionId}` },
        { label: t("editMissionTitle") },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">{t("editMissionTitle")}</h1>
          <p className="text-outline text-[10px] uppercase tracking-widest mb-8">{mission.title}</p>
          <ProyectoForm
            mission={JSON.parse(JSON.stringify(mission))}
            orgs={orgs}
            defaultOrgId={mission.organizationId ?? undefined}
            skills={skills}
            initialSkillIds={initialSkillIds}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
