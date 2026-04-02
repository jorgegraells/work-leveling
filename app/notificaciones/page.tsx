import SidebarLayout from "@/components/layout/SidebarLayout"
import Notificaciones from "@/components/screens/Notificaciones"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { getTranslations } from "next-intl/server"

export default async function NotificacionesPage() {
  const user = await requireCurrentUser()
  const t = await getTranslations("notificaciones")

  const notifications = await prisma.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: t("pageTitle") }]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-[1600px] mx-auto w-full space-y-8 overflow-y-auto">
          <div>
            <h1 className="text-2xl font-headline font-bold text-on-surface">
              {t("pageTitle")}
            </h1>
            <p className="text-outline text-[10px] uppercase tracking-widest mt-1">
              {t("pageSubtitle")}
            </p>
          </div>
          <Notificaciones notifications={JSON.parse(JSON.stringify(notifications))} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-10 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
