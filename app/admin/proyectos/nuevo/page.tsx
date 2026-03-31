import ProyectoForm from "@/components/screens/admin/ProyectoForm"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

export default async function NuevoProyectoPage() {
  const user = await requireCurrentUser()
  const t = await getTranslations("admin")

  const [orgs, skills] = await Promise.all([
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

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: t("breadcrumbProjects"), href: "/admin/proyectos" },
        { label: t("newMissionTitle") },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">{t("newMissionTitle")}</h1>
          <p className="text-outline text-[10px] uppercase tracking-widest mb-8">{t("newMissionSubtitle")}</p>
          <ProyectoForm
            orgs={orgs}
            defaultOrgId={user.organizationId ?? undefined}
            skills={skills}
          />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
