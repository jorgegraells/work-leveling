import type { Mission, MissionObjective, UserMission, MissionApproval } from "@prisma/client"

export type MissionWithStats = Mission & {
  _count: { userMissions: number }
  completedCount: number
  createdBy?: { name: string } | null
}

export type MissionWithObjectives = Mission & {
  objectives: MissionObjective[]
  createdBy?: { name: string } | null
}

export type UserMissionWithUser = UserMission & {
  user: { id: string; name: string; avatarUrl: string | null; level: number }
  approval: Pick<MissionApproval, "status"> | null
}
