"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Textarea } from "@/components/ui/textarea"
import type { MissionModule, ApprovalStatus } from "@prisma/client"

interface Objective {
  id: string
  title: string
  icon: string
  order: number
  xpReward: number
}

interface ApprovalMission {
  id: string
  title: string
  description: string | null
  module: MissionModule
  icon: string
  xpReward: number
  objectives: Objective[]
}

interface ApprovalUser {
  id: string
  name: string
  level: number
  avatarUrl: string | null
  title: string | null
}

interface ApprovalUserMission {
  id: string
  user: ApprovalUser
  mission: ApprovalMission
}

export interface ApprovalWithFullDetails {
  id: string
  status: ApprovalStatus
  note: string | null
  createdAt: string
  userMission: ApprovalUserMission
}

const MODULE_COLOR: Record<MissionModule, string> = {
  VENTAS_LEADS: "text-secondary",
  PROYECTOS_CRONOGRAMA: "text-tertiary",
  ALIANZAS_CONTRATOS: "text-primary",
  INFORMES_CUMPLIMIENTO: "text-on-tertiary-container",
  ESTRATEGIA_EXPANSION: "text-outline",
}

const MODULE_BG: Record<MissionModule, string> = {
  VENTAS_LEADS: "bg-secondary/20",
  PROYECTOS_CRONOGRAMA: "bg-tertiary/20",
  ALIANZAS_CONTRATOS: "bg-primary/20",
  INFORMES_CUMPLIMIENTO: "bg-on-tertiary-container/20",
  ESTRATEGIA_EXPANSION: "bg-outline/20",
}

const MODULE_LABEL: Record<MissionModule, string> = {
  VENTAS_LEADS: "Ventas & Leads",
  PROYECTOS_CRONOGRAMA: "Proyectos & Cronograma",
  ALIANZAS_CONTRATOS: "Alianzas & Contratos",
  INFORMES_CUMPLIMIENTO: "Informes & Cumplimiento",
  ESTRATEGIA_EXPANSION: "Estrategia & Expansion",
}

type ScoreKey =
  | "scoreLogica"
  | "scoreCreatividad"
  | "scoreLiderazgo"
  | "scoreNegociacion"
  | "scoreEstrategia"
  | "scoreAnalisis"
  | "scoreComunicacion"
  | "scoreAdaptabilidad"

interface AttributeConfig {
  key: ScoreKey
  label: string
  color: string
  bgColor: string
}

const LEFT_ATTRIBUTES: AttributeConfig[] = [
  { key: "scoreLogica", label: "Logica", color: "bg-primary", bgColor: "bg-primary/30" },
  { key: "scoreCreatividad", label: "Creatividad", color: "bg-tertiary", bgColor: "bg-tertiary/30" },
  { key: "scoreLiderazgo", label: "Liderazgo", color: "bg-secondary", bgColor: "bg-secondary/30" },
  { key: "scoreNegociacion", label: "Negociacion", color: "bg-on-tertiary-container", bgColor: "bg-on-tertiary-container/30" },
]

const RIGHT_ATTRIBUTES: AttributeConfig[] = [
  { key: "scoreEstrategia", label: "Estrategia", color: "bg-outline", bgColor: "bg-outline/30" },
  { key: "scoreAnalisis", label: "Analisis", color: "bg-tertiary", bgColor: "bg-tertiary/30" },
  { key: "scoreComunicacion", label: "Comunicacion", color: "bg-secondary", bgColor: "bg-secondary/30" },
  { key: "scoreAdaptabilidad", label: "Adaptabilidad", color: "bg-primary", bgColor: "bg-primary/30" },
]

export default function AprobacionDetail({
  approval,
}: {
  approval: ApprovalWithFullDetails
}) {
  const router = useRouter()
  const { userMission } = approval
  const { user, mission } = userMission

  const [scores, setScores] = useState<Record<ScoreKey, number>>({
    scoreLogica: 3,
    scoreCreatividad: 3,
    scoreLiderazgo: 3,
    scoreNegociacion: 3,
    scoreEstrategia: 3,
    scoreAnalisis: 3,
    scoreComunicacion: 3,
    scoreAdaptabilidad: 3,
  })
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAlreadyProcessed = approval.status !== "PENDING"

  async function handleApprove() {
    setLoading("approve")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/${approval.id}/aprobar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...scores, note: note || undefined }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al aprobar")
      }
      router.push("/admin/aprobaciones")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(null)
    }
  }

  async function handleReject() {
    if (!note.trim()) {
      setError("Debes indicar un motivo para rechazar la mision")
      return
    }
    setLoading("reject")
    setError(null)
    try {
      const res = await fetch(`/api/aprobaciones/${approval.id}/rechazar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al rechazar")
      }
      router.push("/admin/aprobaciones")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(null)
    }
  }

  function ScoreSelector({ attr }: { attr: AttributeConfig }) {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
          {attr.label}
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((val) => {
            const isSelected = scores[attr.key] >= val
            return (
              <button
                key={val}
                type="button"
                disabled={isAlreadyProcessed}
                onClick={() =>
                  setScores((prev) => ({ ...prev, [attr.key]: val }))
                }
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all active:scale-95 ${
                  isSelected
                    ? `${attr.color} text-surface`
                    : "bg-surface-container-lowest text-outline hover:bg-surface-container-high"
                }`}
              >
                {val}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Mission Info Card */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-lg ${MODULE_BG[mission.module]} flex items-center justify-center flex-shrink-0`}
            >
              <span
                className={`material-symbols-outlined text-2xl ${MODULE_COLOR[mission.module]}`}
              >
                {mission.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-headline font-bold text-on-surface">
                {mission.title}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest ${MODULE_COLOR[mission.module]}`}
                >
                  {MODULE_LABEL[mission.module]}
                </span>
                <span className="text-[10px] font-bold text-primary">
                  +{mission.xpReward} XP
                </span>
              </div>
              {mission.description && (
                <p className="text-sm text-on-surface-variant mt-3">
                  {mission.description}
                </p>
              )}
            </div>
          </div>

          {/* Objectives */}
          {mission.objectives.length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Objetivos
              </p>
              <div className="space-y-1.5">
                {mission.objectives.map((obj) => (
                  <div
                    key={obj.id}
                    className="flex items-center gap-2 text-sm text-on-surface-variant"
                  >
                    <span className="material-symbols-outlined text-secondary text-base">
                      check_circle
                    </span>
                    <span>{obj.title}</span>
                    <span className="text-[10px] text-outline ml-auto">
                      +{obj.xpReward} XP
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Employee Info */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            Empleado
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-surface-container-lowest overflow-hidden flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-outline text-xl">
                    person
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-base font-body font-semibold text-on-surface">
                {user.name}
              </h3>
              <p className="text-[10px] text-primary uppercase tracking-widest">
                Nivel {user.level}
                {user.title ? ` - ${user.title}` : ""}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Attribute Scores */}
      {!isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Puntuacion por atributo
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {LEFT_ATTRIBUTES.map((attr) => (
                  <ScoreSelector key={attr.key} attr={attr} />
                ))}
              </div>
              <div className="space-y-4">
                {RIGHT_ATTRIBUTES.map((attr) => (
                  <ScoreSelector key={attr.key} attr={attr} />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Note + Actions */}
      {!isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Nota (requerida para rechazar)
            </p>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Escribe una nota sobre el desempeno del empleado..."
              className="bg-surface-container-lowest border-outline-variant/30 text-on-surface placeholder:text-outline text-sm min-h-24"
            />

            {error && (
              <p className="text-error text-sm font-body">{error}</p>
            )}

            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleApprove}
                disabled={loading !== null}
                className="px-8 py-3 bg-secondary text-on-secondary rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "approve" && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                )}
                Aprobar
              </button>
              <button
                onClick={handleReject}
                disabled={loading !== null}
                className="px-8 py-3 bg-error/80 text-on-error rounded-md font-bold uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading === "reject" && (
                  <span className="material-symbols-outlined text-base animate-spin">
                    progress_activity
                  </span>
                )}
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Already processed state */}
      {isAlreadyProcessed && (
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 text-center">
            <span className="material-symbols-outlined text-3xl text-outline mb-2 block">
              {approval.status === "APPROVED" ? "verified" : "cancel"}
            </span>
            <p className="text-on-surface font-body text-sm">
              Esta mision ya fue{" "}
              {approval.status === "APPROVED" ? "aprobada" : "rechazada"}
            </p>
            {approval.note && (
              <p className="text-on-surface-variant text-sm mt-2">
                Nota: {approval.note}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
