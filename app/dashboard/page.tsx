import ExecutiveQuestDashboard, {
  type SkillBar,
  type RecentMission,
} from "@/components/screens/ExecutiveQuestDashboard"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { MissionModule } from "@prisma/client"

const MODULE_COLOR: Record<MissionModule, RecentMission["accentColor"]> = {
  VENTAS_LEADS:          "secondary",
  PROYECTOS_CRONOGRAMA:  "tertiary",
  ALIANZAS_CONTRATOS:    "primary",
  INFORMES_CUMPLIMIENTO: "on-tertiary-container",
  ESTRATEGIA_EXPANSION:  "primary",
}

const MODULE_LABEL: Record<MissionModule, string> = {
  VENTAS_LEADS:          "Ventas & Leads",
  PROYECTOS_CRONOGRAMA:  "Proyectos & Cronograma",
  ALIANZAS_CONTRATOS:    "Alianzas & Contratos",
  INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
  ESTRATEGIA_EXPANSION:  "Estrategia & Expansión",
}

function formatKredits(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k`
  return String(n)
}

export default async function DashboardPage() {
  const { userId } = await auth()

  if (!userId) return redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      attributes: { include: { attribute: true } },
      userMissions: {
        where:   { status: "COMPLETED" },
        include: { mission: true },
        orderBy: { completedAt: "desc" },
        take:    3,
      },
    },
  })

  if (!user) return redirect("/sign-in")

  const toSkillBar = (ua: (typeof user.attributes)[number]): SkillBar => ({
    label: ua.attribute.label,
    value: ua.value,
    color: ua.attribute.color as SkillBar["color"],
  })

  const skillsLeft  = user.attributes.filter((ua) => ua.attribute.side === "left").map(toSkillBar)
  const skillsRight = user.attributes.filter((ua) => ua.attribute.side === "right").map(toSkillBar)

  const recentMissions: RecentMission[] = user.userMissions.map((um) => ({
    icon:        um.mission.icon,
    title:       um.mission.title,
    subtitle:    MODULE_LABEL[um.mission.module],
    xp:          um.mission.xpReward,
    accentColor: MODULE_COLOR[um.mission.module],
  }))

  const rankProgress =
    user.xpToNextLevel > 0
      ? Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100))
      : 0

  return (
    <ExecutiveQuestDashboard
      userName={user.name}
      userTitle={user.title ?? "Executive"}
      userLevel={user.level}
      rankProgress={rankProgress}
      trophies={user.trophies}
      kredits={formatKredits(user.kredits)}
      skillsLeft={skillsLeft.length  > 0 ? skillsLeft  : undefined}
      skillsRight={skillsRight.length > 0 ? skillsRight : undefined}
      recentMissions={recentMissions.length > 0 ? recentMissions : undefined}
    />
  )
}
