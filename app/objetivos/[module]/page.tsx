import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }): Promise<Metadata> {
  const { module } = await params
  return { title: `${module} | Objetivos | Work Leveling` }
}

import DetallesMision from "@/components/screens/DetallesMision"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { MissionModule } from "@prisma/client"
import { getTranslations } from "next-intl/server"

const MODULE_COLOR: Record<MissionModule, string> = {
  VENTAS_LEADS: "secondary",
  PROYECTOS_CRONOGRAMA: "tertiary",
  ALIANZAS_CONTRATOS: "primary",
  INFORMES_CUMPLIMIENTO: "on-tertiary-container",
  ESTRATEGIA_EXPANSION: "primary",
}

// Route: /objetivos/[missionId]
// The folder is named [module] but the param is used as missionId.
interface Props {
  params: Promise<{ module: string }>
}

export default async function DetallesObjetivoPage({ params }: Props) {
  const { module: missionId } = await params
  const user = await requireCurrentUser()

  const tCommon = await getTranslations("common")
  const MODULE_LABEL: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const userMission = await prisma.userMission.findUnique({
    where: {
      userId_missionId: { userId: user.id, missionId },
    },
    include: {
      mission: {
        include: {
          objectives: { orderBy: { order: "asc" } },
        },
      },
      objectives: {
        include: {
          objective: true,
        },
      },
      approval: { select: { status: true } },
    },
  })

  if (!userMission) {
    redirect("/objetivos")
  }

  const objectives = userMission.mission.objectives.map((obj) => {
    const userObj = userMission.objectives.find(
      (uo) => uo.objectiveId === obj.id
    )
    return {
      id: obj.id,
      title: obj.title,
      xpReward: obj.xpReward,
      order: obj.order,
      icon: obj.icon,
      status: userObj?.status ?? "LOCKED",
      submittedAt: userObj?.submittedAt?.toISOString() ?? null,
      managerApproved: userObj?.managerApproved ?? null,
      managerNote: userObj?.managerNote ?? null,
      userMissionObjectiveId: userObj?.id ?? null,
    }
  })

  const completedCount = objectives.filter(
    (o) => o.status === "COMPLETED"
  ).length

  return (
    <DetallesMision
      missionId={missionId}
      userMissionId={userMission.id}
      title={userMission.mission.title}
      description={userMission.mission.description}
      module={MODULE_LABEL[userMission.mission.module]}
      moduleKey={userMission.mission.module}
      accentColor={MODULE_COLOR[userMission.mission.module]}
      icon={userMission.mission.icon}
      xpReward={userMission.mission.xpReward}
      priority={userMission.mission.priority}
      progress={userMission.progress}
      status={userMission.status}
      approvalStatus={userMission.approval?.status ?? undefined}
      objectives={objectives}
      objectivesCompleted={completedCount}
      objectivesTotal={objectives.length}
    />
  )
}
