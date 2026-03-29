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
        include: {
          mission: {
            include: {
              objectives: { orderBy: { order: "asc" } },
            },
          },
          objectives: {
            include: { objective: true },
          },
          approval: {
            include: {
              approver: { select: { name: true } },
            },
          },
        },
        orderBy: { completedAt: "desc" },
      },
    },
  })

  if (!user) return redirect("/sign-in")

  const completedProjects = user.userMissions
    .filter((um) => um.approval?.status === "APPROVED")
    .map((um) => ({
      id: um.id,
      missionId: um.missionId,
      title: um.mission.title,
      icon: um.mission.icon,
      module: MODULE_LABEL[um.mission.module] || um.mission.module,
      accentColor: MODULE_ACCENT[um.mission.module] || "primary" as const,
      xpReward: um.mission.xpReward,
      completedAt: um.completedAt?.toISOString() ?? null,
      approval: um.approval ? {
        note: um.approval.note,
        approverName: um.approval.approver.name,
        reviewedAt: um.approval.reviewedAt?.toISOString() ?? null,
        scores: {
          logica: um.approval.scoreLogica,
          creatividad: um.approval.scoreCreatividad,
          liderazgo: um.approval.scoreLiderazgo,
          negociacion: um.approval.scoreNegociacion,
          estrategia: um.approval.scoreEstrategia,
          analisis: um.approval.scoreAnalisis,
          comunicacion: um.approval.scoreComunicacion,
          adaptabilidad: um.approval.scoreAdaptabilidad,
        },
      } : null,
      objectives: um.mission.objectives.map((obj) => {
        const userObj = um.objectives.find((uo) => uo.objectiveId === obj.id)
        return {
          title: obj.title,
          icon: obj.icon,
          xpReward: obj.xpReward,
          status: userObj?.status ?? "LOCKED",
        }
      }),
    }))

  const pendingReview = user.userMissions
    .filter((um) => um.approval?.status === "PENDING")
    .map((um) => ({
      id: um.id,
      title: um.mission.title,
      icon: um.mission.icon,
      module: MODULE_LABEL[um.mission.module] || um.mission.module,
      accentColor: MODULE_ACCENT[um.mission.module] || "primary" as const,
    }))

  return (
    <PanelPerfilSteveSmith
      user={JSON.parse(JSON.stringify(user))}
      completedProjects={completedProjects}
      pendingReview={pendingReview}
    />
  )
}
