import DetallesMision from "@/components/screens/DetallesMision"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { MissionModule } from "@prisma/client"

const MODULE_LABEL: Record<MissionModule, string> = {
  VENTAS_LEADS: "Ventas & Leads",
  PROYECTOS_CRONOGRAMA: "Proyectos & Cronograma",
  ALIANZAS_CONTRATOS: "Alianzas & Contratos",
  INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
  ESTRATEGIA_EXPANSION: "Estrategia & Expansión",
}

const MODULE_COLOR: Record<MissionModule, string> = {
  VENTAS_LEADS: "secondary",
  PROYECTOS_CRONOGRAMA: "tertiary",
  ALIANZAS_CONTRATOS: "primary",
  INFORMES_CUMPLIMIENTO: "on-tertiary-container",
  ESTRATEGIA_EXPANSION: "primary",
}

// Route: /misiones/[missionId]
// The folder is named [module] but the param is used as missionId.
interface Props {
  params: Promise<{ module: string }>
}

export default async function DetallesMisionPage({ params }: Props) {
  const { module: missionId } = await params
  const user = await requireCurrentUser()

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
    },
  })

  if (!userMission) {
    redirect("/misiones")
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
      objectives={objectives}
      objectivesCompleted={completedCount}
      objectivesTotal={objectives.length}
    />
  )
}
