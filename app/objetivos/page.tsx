export const dynamic = "force-dynamic"

import type { Metadata } from "next"
export const metadata: Metadata = { title: "Objetivos | Work Leveling", description: "Tus objetivos activos por módulo" }

import PanelCorporativoGamificado, {
  type ProjectCard,
} from "@/components/screens/PanelCorporativoGamificado"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import type { MissionModule } from "@prisma/client"

const MODULE_COLOR: Record<MissionModule, string> = {
  VENTAS_LEADS: "secondary",
  PROYECTOS_CRONOGRAMA: "tertiary",
  ALIANZAS_CONTRATOS: "primary",
  INFORMES_CUMPLIMIENTO: "on-tertiary-container",
  ESTRATEGIA_EXPANSION: "primary",
}

const MODULE_LABEL: Record<MissionModule, string> = {
  VENTAS_LEADS: "Ventas & Leads",
  PROYECTOS_CRONOGRAMA: "Proyectos & Cronograma",
  ALIANZAS_CONTRATOS: "Alianzas & Contratos",
  INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
  ESTRATEGIA_EXPANSION: "Estrategia & Expansión",
}

export default async function ObjetivosPage() {
  const user = await requireCurrentUser()

  const userMissions = await prisma.userMission.findMany({
    where: { userId: user.id, status: { not: "ARCHIVED" } },
    include: {
      mission: {
        include: {
          objectives: { orderBy: { order: "asc" } },
        },
      },
      objectives: true,
      approval: { select: { status: true } },
    },
    orderBy: { startedAt: "desc" },
  })

  const projects: ProjectCard[] = userMissions.map((um) => {
    const completedCount = um.objectives.filter(
      (o) => o.status === "COMPLETED"
    ).length

    return {
      id: um.id,
      missionId: um.missionId,
      title: um.mission.title,
      module: MODULE_LABEL[um.mission.module],
      moduleKey: um.mission.module,
      accentColor: MODULE_COLOR[um.mission.module],
      icon: um.mission.icon,
      xpReward: um.mission.xpReward,
      kreditsReward: um.mission.kreditsReward,
      customReward: um.mission.customReward ?? null,
      priority: um.mission.priority,
      progress: um.progress,
      status: um.status,
      objectivesTotal: um.mission.objectives.length,
      objectivesCompleted: completedCount,
      approvalStatus: um.approval?.status ?? undefined,
      dueDate: um.mission.dueDate ? um.mission.dueDate.toISOString() : null,
      completedAt: um.completedAt ? um.completedAt.toISOString() : null,
      missionType: um.mission.missionType,
    }
  })

  const currentProject =
    projects.find((p) => p.status === "IN_PROGRESS") ??
    projects.find((p) => p.status === "PENDING") ??
    projects.find((p) => p.status === "COMPLETED" && p.approvalStatus === "PENDING") ??
    undefined

  return (
    <PanelCorporativoGamificado
      userName={user.name}
      userLevel={user.level}
      userTitle={user.title ?? `Level ${user.level}`}
      userAvatarUrl={user.avatarUrl}
      projects={projects}
      currentProject={currentProject}
    />
  )
}
