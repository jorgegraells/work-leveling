"use client"

import { useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import type { MissionWithObjectives, UserMissionWithUser } from "@/types/proyectos"
import type { MissionModule } from "@prisma/client"
import AsignacionModal from "./AsignacionModal"

interface ProyectoDetailProps {
  mission: MissionWithObjectives
  assignments: UserMissionWithUser[]
}

// MODULE_META labels built inside component using tCommon()
const MODULE_STYLE: Record<MissionModule, { colorClass: string; bgClass: string }> = {
  VENTAS_LEADS:          { colorClass: "text-secondary",             bgClass: "bg-secondary-container/30" },
  PROYECTOS_CRONOGRAMA:  { colorClass: "text-tertiary",              bgClass: "bg-tertiary-container/30" },
  ALIANZAS_CONTRATOS:    { colorClass: "text-primary",               bgClass: "bg-primary-container/30" },
  INFORMES_CUMPLIMIENTO: { colorClass: "text-on-tertiary-container", bgClass: "bg-tertiary-container/20" },
  ESTRATEGIA_EXPANSION:  { colorClass: "text-outline",               bgClass: "bg-surface-container-high" },
}

export default function ProyectoDetail({ mission, assignments }: ProyectoDetailProps) {
  const t = useTranslations("proyectos")
  const tCommon = useTranslations("common")
  const [showAsignModal, setShowAsignModal] = useState(false)

  const MODULE_LABEL: Record<MissionModule, string> = {
    VENTAS_LEADS: tCommon("moduleVentas"),
    PROYECTOS_CRONOGRAMA: tCommon("moduleProyectos"),
    ALIANZAS_CONTRATOS: tCommon("moduleAlianzas"),
    INFORMES_CUMPLIMIENTO: tCommon("moduleInformes"),
    ESTRATEGIA_EXPANSION: tCommon("moduleEstrategia"),
  }

  const modStyle = MODULE_STYLE[mission.module]
  const mod = { label: MODULE_LABEL[mission.module], ...modStyle }

  const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
    PENDING: {
      label: t("statusPending"),
      classes: "bg-surface-container-high text-outline",
    },
    IN_PROGRESS: {
      label: t("statusInProgress"),
      classes: "bg-tertiary-container/30 text-tertiary",
    },
    COMPLETED: {
      label: t("statusCompleted"),
      classes: "bg-secondary-container/30 text-secondary",
    },
    ARCHIVED: {
      label: t("statusArchived"),
      classes: "bg-surface-container-high text-outline",
    },
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/proyectos"
          className="p-2 rounded-lg bg-surface-container-highest text-outline hover:text-on-surface transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
            {t("adminProyectos")}
          </p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">
            {mission.title}
          </h1>
          <span className="text-[9px] text-outline">
            {t("createdBy", { name: mission.createdBy?.name ?? t("systemCreator") })}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAsignModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform"
          >
            <span className="material-symbols-outlined text-base">person_add</span>
            {t("assign")}
          </button>
          <Link
            href={`/admin/proyectos/${mission.id}/editar`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-surface-container-highest text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-[0.98] transition-all"
          >
            <span className="material-symbols-outlined text-base">edit</span>
            {t("edit")}
          </Link>
        </div>
      </div>

      {/* Mission overview card */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
              <span className={`material-symbols-outlined text-3xl ${mod.colorClass}`}>
                {mission.icon}
              </span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${mod.bgClass} ${mod.colorClass}`}
                >
                  {mod.label}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-primary-container/30 text-primary">
                  {mission.xpReward.toLocaleString()} XP
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest bg-surface-container-high text-on-surface-variant">
                  {t("priority", { value: mission.priority })}
                </span>
              </div>
              {mission.description && (
                <p className="text-sm text-on-surface-variant">{mission.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Objectives */}
      {mission.objectives.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("objectives", { count: mission.objectives.length })}
            </p>
            <div className="space-y-2">
              {mission.objectives.map((obj, i) => (
                <div
                  key={obj.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest"
                >
                  <span className="text-[11px] font-bold text-outline w-5 text-center">
                    {i + 1}
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">
                    {obj.icon}
                  </span>
                  <span className="flex-1 text-sm text-on-surface">{obj.title}</span>
                  <span className="text-[10px] font-bold text-primary">
                    +{obj.xpReward} XP
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Assignments table */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("assignedUsers", { count: assignments.length })}
            </p>
          </div>

          {assignments.length === 0 ? (
            <div className="py-10 text-center space-y-2">
              <span className="material-symbols-outlined text-3xl text-outline block opacity-40">
                group
              </span>
              <p className="text-sm text-outline">{t("noUsersAssigned")}</p>
              <button
                type="button"
                onClick={() => setShowAsignModal(true)}
                className="inline-flex items-center gap-1 text-primary text-[11px] font-bold uppercase tracking-widest hover:underline"
              >
                <span className="material-symbols-outlined text-base">person_add</span>
                {t("assignNow")}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="text-[10px] font-bold uppercase tracking-widest text-outline pb-3 pr-4">
                      {t("userColumn")}
                    </th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-outline pb-3 pr-4">
                      {t("levelColumn")}
                    </th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-outline pb-3 pr-4">
                      {t("progressColumn")}
                    </th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-outline pb-3 pr-4">
                      {t("statusColumn")}
                    </th>
                    <th className="text-[10px] font-bold uppercase tracking-widest text-outline pb-3">
                      {t("completedColumn")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {assignments.map((a) => {
                    const badge = STATUS_BADGE[a.status] ?? STATUS_BADGE["PENDING"]
                    return (
                      <tr key={a.id} className="group">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            {a.user.avatarUrl ? (
                              <img
                                src={a.user.avatarUrl}
                                alt={a.user.name}
                                className="w-8 h-8 rounded-full object-cover border border-outline-variant/20"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                                <span className="material-symbols-outlined text-outline text-base">
                                  person
                                </span>
                              </div>
                            )}
                            <span className="text-on-surface font-medium text-[13px]">
                              {a.user.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-[12px] font-bold text-primary">
                            {t("levelValue", { n: a.user.level })}
                          </span>
                        </td>
                        <td className="py-3 pr-4 w-36">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-[10px] text-outline">{a.progress}%</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                              <div
                                className="h-full rounded-full bg-tertiary transition-all"
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${badge.classes}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className="text-[11px] text-on-surface-variant">
                            {a.completedAt
                              ? new Date(a.completedAt).toLocaleDateString("es-ES", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Asignacion Modal */}
      {showAsignModal && mission.organizationId && (
        <AsignacionModal
          missionId={mission.id}
          orgId={mission.organizationId}
          missionOrgId={mission.organizationId}
          onClose={() => setShowAsignModal(false)}
        />
      )}
    </div>
  )
}
