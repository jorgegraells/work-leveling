"use client"

import { useState } from "react"
import Link from "next/link"
import type { MissionWithStats } from "@/types/proyectos"
import type { MissionModule } from "@prisma/client"

interface ProyectosListProps {
  missions: MissionWithStats[]
}

const MODULE_META: Record<
  MissionModule,
  { label: string; colorClass: string; bgClass: string }
> = {
  VENTAS_LEADS: {
    label: "Ventas & Leads",
    colorClass: "text-secondary",
    bgClass: "bg-secondary-container/30",
  },
  PROYECTOS_CRONOGRAMA: {
    label: "Proyectos & Cronograma",
    colorClass: "text-tertiary",
    bgClass: "bg-tertiary-container/30",
  },
  ALIANZAS_CONTRATOS: {
    label: "Alianzas & Contratos",
    colorClass: "text-primary",
    bgClass: "bg-primary-container/30",
  },
  INFORMES_CUMPLIMIENTO: {
    label: "Informes & Cumplimiento",
    colorClass: "text-on-tertiary-container",
    bgClass: "bg-tertiary-container/20",
  },
  ESTRATEGIA_EXPANSION: {
    label: "Estrategia & Expansión",
    colorClass: "text-outline",
    bgClass: "bg-surface-container-high",
  },
}

const PRIORITY_BADGE: Record<string, { label: string; classes: string }> = {
  ALTA: { label: "Alta", classes: "bg-error-container/30 text-error" },
  NORMAL: { label: "Normal", classes: "bg-surface-container-high text-on-surface-variant" },
  BAJA: { label: "Baja", classes: "bg-secondary-container/20 text-secondary" },
}

export default function ProyectosList({ missions }: ProyectosListProps) {
  const [archiving, setArchiving] = useState<string | null>(null)
  const [localMissions, setLocalMissions] = useState(missions)

  async function handleArchive(missionId: string) {
    if (!confirm("¿Archivar esta misión? Se archivará para todos los usuarios asignados.")) return
    setArchiving(missionId)
    try {
      const res = await fetch(`/api/admin/misiones/${missionId}`, { method: "DELETE" })
      if (res.ok) {
        setLocalMissions((prev) => prev.filter((m) => m.id !== missionId))
      }
    } finally {
      setArchiving(null)
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
            Admin
          </p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">
            Proyectos & Misiones
          </h1>
        </div>
        <Link
          href="/admin/proyectos/nuevo"
          className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Nueva Misión
        </Link>
      </div>

      {localMissions.length === 0 ? (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-16 text-center space-y-3">
            <span className="material-symbols-outlined text-4xl text-outline block">
              military_tech
            </span>
            <p className="text-on-surface-variant text-sm">No hay misiones creadas todavía.</p>
            <Link
              href="/admin/proyectos/nuevo"
              className="inline-flex items-center gap-1.5 text-primary text-[11px] font-bold uppercase tracking-widest hover:underline"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Crear primera misión
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {localMissions.map((mission) => {
            const mod = MODULE_META[mission.module]
            const prio = PRIORITY_BADGE[mission.priority] ?? PRIORITY_BADGE["NORMAL"]
            const total = mission._count.userMissions
            const completed = mission.completedCount
            const pct = total > 0 ? Math.round((completed / total) * 100) : 0

            return (
              <div
                key={mission.id}
                className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
              >
                <div className="rounded-lg bg-surface-bright p-5 space-y-4 h-full flex flex-col">
                  {/* Top row: module badge + priority */}
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${mod.bgClass} ${mod.colorClass}`}
                    >
                      {mod.label}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${prio.classes}`}
                    >
                      {prio.label}
                    </span>
                  </div>

                  {/* Icon + title */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                      <span className={`material-symbols-outlined ${mod.colorClass}`}>
                        {mission.icon}
                      </span>
                    </div>
                    <h3 className="font-headline font-bold text-on-surface leading-tight text-[15px] line-clamp-2">
                      {mission.title}
                    </h3>
                  </div>

                  {/* XP */}
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-base">
                      military_tech
                    </span>
                    <span className="text-[11px] font-bold text-primary">
                      {mission.xpReward.toLocaleString()} XP
                    </span>
                  </div>

                  {/* Progress */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-outline uppercase tracking-widest">
                        Completadas
                      </span>
                      <span className="text-[11px] font-bold text-on-surface">
                        {completed}/{total}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${mod.colorClass.replace("text-", "bg-")}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 mt-auto">
                    <Link
                      href={`/admin/proyectos/${mission.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                      Editar
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleArchive(mission.id)}
                      disabled={archiving === mission.id}
                      className="flex items-center gap-1 px-3 py-2 rounded-md text-outline hover:text-error hover:bg-error-container/10 text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95 disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined text-base">archive</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
