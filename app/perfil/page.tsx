import PanelPerfilSteveSmith from "@/components/screens/PanelPerfilSteveSmith"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

const MODULE_LABEL: Record<string, string> = {
  VENTAS_LEADS: "Ventas & Leads",
  PROYECTOS_CRONOGRAMA: "Proyectos & Cronograma",
  ALIANZAS_CONTRATOS: "Alianzas & Contratos",
  INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
  ESTRATEGIA_EXPANSION: "Estrategia & Expansión",
}

const MODULE_ACCENT: Record<string, "primary" | "tertiary" | "secondary" | "on-tertiary-container"> = {
  VENTAS_LEADS: "secondary",
  PROYECTOS_CRONOGRAMA: "tertiary",
  ALIANZAS_CONTRATOS: "primary",
  INFORMES_CUMPLIMIENTO: "on-tertiary-container",
  ESTRATEGIA_EXPANSION: "primary",
}

export default async function PerfilPage() {
  const { userId } = await auth()

  if (!userId) return redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      attributes: { include: { attribute: true } },
      userMissions: {
        where: { status: "COMPLETED" },
        include: { mission: true },
        orderBy: { completedAt: "desc" },
        take: 3,
      },
    },
  })

  if (!user) return redirect("/sign-in")

  const recentMissions = user.userMissions.map((um) => ({
    title: um.mission.title,
    subtitle: MODULE_LABEL[um.mission.module] || um.mission.module,
    xp: um.mission.xpReward,
    icon: um.mission.icon,
    accentColor: MODULE_ACCENT[um.mission.module] || "primary" as const,
  }))

  return (
    <PanelPerfilSteveSmith
      user={JSON.parse(JSON.stringify(user))}
      recentMissions={recentMissions}
    />
  )
}
