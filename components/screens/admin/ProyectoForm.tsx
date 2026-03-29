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
  orgs: { id: string; name: string }[]
  defaultOrgId?: string
}

const AVAILABLE_ICONS = [
  { name: "filter_alt", label: "Filtro" },
  { name: "stacked_bar_chart", label: "Grafico" },
  { name: "handshake", label: "Alianza" },
  { name: "assignment_turned_in", label: "Informe" },
  { name: "language", label: "Global" },
  { name: "rocket_launch", label: "Lanzamiento" },
  { name: "hub", label: "Red" },
  { name: "shield", label: "Seguridad" },
  { name: "database", label: "Base Datos" },
  { name: "trending_up", label: "Ventas" },
  { name: "account_tree", label: "Proyecto" },
  { name: "description", label: "Documento" },
  { name: "insights", label: "Insight" },
  { name: "military_tech", label: "Logro" },
  { name: "groups", label: "Equipo" },
  { name: "code", label: "Codigo" },
  { name: "build", label: "Herramienta" },
  { name: "campaign", label: "Campana" },
  { name: "psychology", label: "Estrategia" },
  { name: "support_agent", label: "Soporte" },
  { name: "inventory", label: "Inventario" },
  { name: "payments", label: "Pago" },
  { name: "analytics", label: "Analitica" },
  { name: "calendar_month", label: "Calendario" },
  { name: "target", label: "Objetivo" },
  { name: "school", label: "Formacion" },
  { name: "star", label: "Destacado" },
  { name: "flag", label: "Hito" },
  { name: "emoji_events", label: "Trofeo" },
  { name: "speed", label: "Velocidad" },
] as const

const MODULE_OPTIONS: { value: MissionModule; label: string; colorClass: string }[] = [
  { value: "VENTAS_LEADS", label: "Ventas & Leads", colorClass: "text-secondary" },
  { value: "PROYECTOS_CRONOGRAMA", label: "Proyectos & Cronograma", colorClass: "text-tertiary" },
  { value: "ALIANZAS_CONTRATOS", label: "Alianzas & Contratos", colorClass: "text-primary" },
  { value: "INFORMES_CUMPLIMIENTO", label: "Informes & Cumplimiento", colorClass: "text-on-tertiary-container" },
  { value: "ESTRATEGIA_EXPANSION", label: "Estrategia & Expansion", colorClass: "text-outline" },
]

const MODULE_COLOR_CLASS: Record<MissionModule, string> = {
  VENTAS_LEADS: "text-secondary",
  PROYECTOS_CRONOGRAMA: "text-tertiary",
  ALIANZAS_CONTRATOS: "text-primary",
  INFORMES_CUMPLIMIENTO: "text-on-tertiary-container",
  ESTRATEGIA_EXPANSION: "text-outline",
}

const PRIORITY_OPTIONS = [
  { value: "ALTA", label: "Alta", colorClass: "text-error" },
  { value: "NORMAL", label: "Normal", colorClass: "text-primary" },
  { value: "BAJA", label: "Baja", colorClass: "text-outline" },
]

const PRIORITY_COLOR_CLASS: Record<string, string> = {
  ALTA: "text-error",
  NORMAL: "text-primary",
  BAJA: "text-outline",
}

export default function ProyectoForm({ mission, orgs, defaultOrgId }: ProyectoFormProps) {
  const router = useRouter()
  const isEdit = !!mission

  const [selectedOrgId, setSelectedOrgId] = useState(
    mission?.organizationId ?? defaultOrgId ?? orgs[0]?.id ?? ""
  )
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
      organizationId: selectedOrgId,
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
        setError(data.error ?? "Error al guardar el proyecto")
        return
      }

      router.push("/admin/proyectos")
      router.refresh()
    } catch {
      setError("Error de conexion")
    } finally {
      setLoading(false)
    }
  }

  const selectedModuleColor = MODULE_COLOR_CLASS[module]
  const selectedPriorityColor = PRIORITY_COLOR_CLASS[priority] ?? "text-primary"

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
            {isEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main card */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Informacion General
            </p>

            {/* Empresa */}
            {orgs.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Empresa
                </label>
                <div className="relative">
                  <select
                    value={selectedOrgId}
                    onChange={(e) => setSelectedOrgId(e.target.value)}
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary appearance-none"
                  >
                    {orgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Titulo del Proyecto
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Nombre del proyecto"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Descripcion
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Descripcion del proyecto (opcional)"
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline resize-none"
              />
            </div>

            {/* Module + Priority row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Modulo
                </label>
                <div className="relative">
                  <select
                    value={module}
                    onChange={(e) => setModule(e.target.value as MissionModule)}
                    className={`w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm border border-outline-variant/30 focus:outline-none focus:border-primary appearance-none ${selectedModuleColor}`}
                  >
                    {MODULE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Prioridad
                </label>
                <div className="relative">
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className={`w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm border border-outline-variant/30 focus:outline-none focus:border-primary appearance-none ${selectedPriorityColor}`}
                  >
                    {PRIORITY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            {/* XP Reward */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                XP Reward
              </label>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">military_tech</span>
                <input
                  type="number"
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-32 bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-primary font-bold border border-outline-variant/30 focus:outline-none focus:border-primary"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">puntos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Picker card */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Icono del Proyecto
                </p>
                {icon && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-container-lowest">
                    <span className={`material-symbols-outlined text-lg ${selectedModuleColor}`}>
                      {icon}
                    </span>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                      {icon}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-6 gap-2">
              {AVAILABLE_ICONS.map((ic) => {
                const isSelected = icon === ic.name
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcon(ic.name)}
                    className={`flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg transition-all active:scale-95 ${
                      isSelected
                        ? "bg-surface-container-high border-2 border-primary"
                        : "bg-surface-container-lowest border-2 border-transparent hover:border-outline-variant"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isSelected ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {ic.name}
                    </span>
                    <span
                      className={`text-[8px] uppercase font-bold tracking-widest leading-none ${
                        isSelected ? "text-primary" : "text-outline"
                      }`}
                    >
                      {ic.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Objectives section */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Misiones del Proyecto
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  Objetivos que el empleado debe completar
                </p>
              </div>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Anadir Mision
              </button>
            </div>

            {objectives.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-14 h-14 rounded-xl bg-surface-container-lowest flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl text-outline opacity-40">
                    list_alt
                  </span>
                </div>
                <p className="text-outline text-sm">Sin misiones.</p>
                <p className="text-outline text-[11px]">Anade al menos una mision.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {objectives.map((obj, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-container-lowest flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-bold text-on-surface-variant">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <ObjetivoRow
                        objetivo={obj}
                        isFirst={i === 0}
                        isLast={i === objectives.length - 1}
                        onMoveUp={() => moveObjective(i, "up")}
                        onMoveDown={() => moveObjective(i, "down")}
                        onDelete={() => deleteObjective(i)}
                        onChange={(field, value) => updateObjective(i, field, value)}
                      />
                    </div>
                  </div>
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
            className="px-4 py-2.5 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]"
          >
            {loading && (
              <span className="material-symbols-outlined text-sm animate-spin">
                progress_activity
              </span>
            )}
            {isEdit ? "Guardar Cambios" : "Crear Proyecto"}
          </button>
        </div>
      </form>
    </div>
  )
}
