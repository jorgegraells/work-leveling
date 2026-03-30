export const dynamic = "force-dynamic"

import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import SidebarLayout from "@/components/layout/SidebarLayout"
import Archivados from "@/components/screens/Archivados"

export default async function ArchivadosPage() {
  const user = await requireCurrentUser()
  if (!user) redirect("/sign-in")
  const t = await getTranslations("archivados")

  const archived = await prisma.userMission.findMany({
    where: { userId: user.id, status: "ARCHIVED" },
    include: {
      mission: {
        select: { id: true, title: true, icon: true, module: true, xpReward: true },
      },
      approval: {
        select: {
          status: true,
          note: true,
          reviewedAt: true,
          approver: { select: { name: true } },
        },
      },
    },
    orderBy: { completedAt: "desc" },
  })

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: "Archivados" }]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-3xl mx-auto w-full overflow-y-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-headline font-bold text-on-surface">{t("title")}</h1>
            <p className="text-[10px] text-outline uppercase tracking-widest mt-1">
              {t("subtitle")}
            </p>
          </div>
          <Archivados archivedMissions={JSON.parse(JSON.stringify(archived))} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
