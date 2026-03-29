"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import ObjetivoRow from "./ObjetivoRow"
import type { MissionWithObjectives } from "@/types/proyectos"
import type { MissionModule } from "@prisma/client"

interface ObjetivoLocal {
  id?: string
  title: string
  xpReward: number
  order: number
  icon: string
}

interface ProyectoFormProps {
  mission?: MissionWithObjectives
  orgId: string
}

const MODULE_OPTIONS: { value: MissionModule; label: string }[] = [
  { value: "VENTAS_LEADS", label: "Ventas & Leads" },
  { value: "PROYECTOS_CRONOGRAMA", label: "Proyectos & Cronograma" },
  { value: "ALIANZAS_CONTRATOS", label: "Alianzas & Contratos" },
  { value: "INFORMES_CUMPLIMIENTO", label: "Informes & Cumplimiento" },
  { value: "ESTRATEGIA_EXPANSION", label: "Estrategia & Expansión" },
]

const PRIORITY_OPTIONS = [
  { value: "ALTA", label: "Alta" },
  { value: "NORMAL", label: "Normal" },
  { value: "BAJA", label: "Baja" },
]

export default function ProyectoForm({ mission, orgId }: ProyectoFormProps) {
  const router = useRouter()
  const isEdit = !!mission

  const [title, setTitle] = useState(mission?.title ?? "")
  const [description, setDescription] = useState(mission?.description ?? "")
  const [module, setModule] = useState<MissionModule>(
    mission?.module ?? "PROYECTOS_CRONOGRAMA"
  )
  const [icon, setIcon] = useState(mission?.icon ?? "task_alt")
  const [xpReward, setXpReward] = useState(mission?.xpReward ?? 500)
  const [priority, setPriority] = useState(mission?.priority ?? "NORMAL")
  const [objectives, setObjectives] = useState<ObjetivoLocal[]>(
    mission?.objectives.map((o) => ({
      id: o.id,
      title: o.title,
      xpReward: o.xpReward,
      order: o.order,
      icon: o.icon,
    })) ?? []
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addObjective() {
    setObjectives((prev) => [
      ...prev,
      {
        title: "",
        xpReward: 100,
        order: prev.length,
        icon: "check_circle",
      },
    ])
  }

  function updateObjective(index: number, field: string, value: string | number) {
    setObjectives((prev) =>
      prev.map((o, i) => (i === index ? { ...o, [field]: value } : o))
    )
  }

  function moveObjective(index: number, direction: "up" | "down") {
    setObjectives((prev) => {
      const newArr = [...prev]
      const target = direction === "up" ? index - 1 : index + 1
      if (target < 0 || target >= newArr.length) return prev
      ;[newArr[index], newArr[target]] = [newArr[target], newArr[index]]
      return newArr.map((o, i) => ({ ...o, order: i }))
    })
  }

  function deleteObjective(index: number) {
    setObjectives((prev) =>
      prev.filter((_, i) => i !== index).map((o, i) => ({ ...o, order: i }))
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      title,
      description: description || null,
      module,
      icon,
      xpReward,
      priority,
      organizationId: orgId,
      objectives: objectives.map((o, i) => ({ ...o, order: i })),
    }

    try {
      const url = isEdit
        ? `/api/admin/misiones/${mission.id}`
        : "/api/admin/misiones"
      const method = isEdit ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al guardar la misión")
        return
      }

      router.push("/admin/proyectos")
      router.refresh()
    } catch {
      setError("Error de conexión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="p-2 rounded-lg bg-surface-container-highest text-outline hover:text-on-surface transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
            Admin / Proyectos
          </p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">
            {isEdit ? "Editar Misión" : "Nueva Misión"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main card */}
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Información General
            </p>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                Título
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nombre de la misión"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/50 placeholder:text-outline"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                Descripción
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descripción de la misión (opcional)"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/50 placeholder:text-outline resize-none"
              />
            </div>

            {/* Module + Priority row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Módulo
                </label>
                <select
                  value={module}
                  onChange={(e) => setModule(e.target.value as MissionModule)}
                  className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/50"
                >
                  {MODULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Prioridad
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/50"
                >
                  {PRIORITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Icon + XP row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Icono (Material Symbol)
                </label>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-2xl w-8 text-center flex-shrink-0">
                    {icon || "circle"}
                  </span>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="task_alt"
                    className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/20 focus:outline-none focus:border-primary/50 placeholder:text-outline"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-on-surface-variant">
                  XP Reward
                </label>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-primary border border-outline-variant/20 focus:outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Objectives section */}
        <div className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Objetivos
              </p>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Añadir Objetivo
              </button>
            </div>

            {objectives.length === 0 ? (
              <div className="py-8 text-center text-outline text-sm">
                <span className="material-symbols-outlined text-3xl block mb-2 opacity-40">
                  list_alt
                </span>
                Sin objetivos. Añade al menos uno.
              </div>
            ) : (
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <ObjetivoRow
                    key={i}
                    objetivo={obj}
                    isFirst={i === 0}
                    isLast={i === objectives.length - 1}
                    onMoveUp={() => moveObjective(i, "up")}
                    onMoveDown={() => moveObjective(i, "down")}
                    onDelete={() => deleteObjective(i)}
                    onChange={(field, value) => updateObjective(i, field, value)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/20 text-error text-sm">
            <span className="material-symbols-outlined text-base">error</span>
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading && (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            )}
            {isEdit ? "Guardar Cambios" : "Crear Misión"}
          </button>
        </div>
      </form>
    </div>
  )
}
