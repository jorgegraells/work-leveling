"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
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
  skills?: { id: string; name: string; icon: string; color: string; category: string }[]
  initialSkillIds?: string[]
}

// AVAILABLE_ICONS and MODULE_OPTIONS built inside component using t()

const ICON_NAMES = [
  "filter_alt", "stacked_bar_chart", "handshake", "assignment_turned_in",
  "language", "rocket_launch", "hub", "shield", "database", "trending_up",
  "account_tree", "description", "insights", "military_tech", "groups",
  "code", "build", "campaign", "psychology", "support_agent", "inventory",
  "payments", "analytics", "calendar_month", "target", "school", "star",
  "flag", "emoji_events", "speed",
] as const

const MODULE_COLOR_CLASS: Record<MissionModule, string> = {
  VENTAS_LEADS:          "text-secondary",
  PROYECTOS_CRONOGRAMA:  "text-tertiary",
  ALIANZAS_CONTRATOS:    "text-primary",
  INFORMES_CUMPLIMIENTO: "text-on-tertiary-container",
  ESTRATEGIA_EXPANSION:  "text-outline",
}

const PRIORITY_COLOR_CLASS: Record<string, string> = {
  ALTA:   "text-error",
  NORMAL: "text-primary",
  BAJA:   "text-outline",
}

export default function ProyectoForm({ mission, orgs, defaultOrgId, skills, initialSkillIds }: ProyectoFormProps) {
  const router = useRouter()
  const t = useTranslations("proyectoForm")
  const tCommon = useTranslations("common")
  const isEdit = !!mission

  const ICON_LABEL_MAP: Record<string, string> = {
    filter_alt:           t("iconFiltro"),
    stacked_bar_chart:    t("iconGrafico"),
    handshake:            t("iconAlianza"),
    assignment_turned_in: t("iconInforme"),
    language:             t("iconGlobal"),
    rocket_launch:        t("iconLanzamiento"),
    hub:                  t("iconRed"),
    shield:               t("iconSeguridad"),
    database:             t("iconBaseDatos"),
    trending_up:          t("iconVentas"),
    account_tree:         t("iconProyecto"),
    description:          t("iconDocumento"),
    insights:             t("iconInsight"),
    military_tech:        t("iconLogro"),
    groups:               t("iconEquipo"),
    code:                 t("iconCodigo"),
    build:                t("iconHerramienta"),
    campaign:             t("iconCampana"),
    psychology:           t("iconEstrategia"),
    support_agent:        t("iconSoporte"),
    inventory:            t("iconInventario"),
    payments:             t("iconPago"),
    analytics:            t("iconAnalitica"),
    calendar_month:       t("iconCalendario"),
    target:               t("iconObjetivo"),
    school:               t("iconFormacion"),
    star:                 t("iconDestacado"),
    flag:                 t("iconHito"),
    emoji_events:         t("iconTrofeo"),
    speed:                t("iconVelocidad"),
  }

  const AVAILABLE_ICONS = ICON_NAMES.map((name) => ({ name, label: ICON_LABEL_MAP[name] ?? name }))

  const MODULE_OPTIONS: { value: MissionModule; label: string; colorClass: string }[] = [
    { value: "VENTAS_LEADS",          label: tCommon("moduleVentas"),    colorClass: "text-secondary" },
    { value: "PROYECTOS_CRONOGRAMA",  label: tCommon("moduleProyectos"), colorClass: "text-tertiary" },
    { value: "ALIANZAS_CONTRATOS",    label: tCommon("moduleAlianzas"),  colorClass: "text-primary" },
    { value: "INFORMES_CUMPLIMIENTO", label: tCommon("moduleInformes"),  colorClass: "text-on-tertiary-container" },
    { value: "ESTRATEGIA_EXPANSION",  label: tCommon("moduleEstrategia"),colorClass: "text-outline" },
  ]

  const PRIORITY_OPTIONS = [
    { value: "ALTA",   label: t("priorityAlta"),   colorClass: "text-error" },
    { value: "NORMAL", label: t("priorityNormal"), colorClass: "text-primary" },
    { value: "BAJA",   label: t("priorityBaja"),   colorClass: "text-outline" },
  ]

  const [missionType, setMissionType] = useState<"OBJECTIVE" | "DAILY">(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((mission as any)?.missionType as "OBJECTIVE" | "DAILY") ?? "OBJECTIVE"
  )
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
  const [kreditsReward, setKreditsReward] = useState(mission?.kreditsReward ?? 0)
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
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(
    initialSkillIds ?? []
  )
  const [skillSearch, setSkillSearch] = useState("")
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set())
  const [customSkillInput, setCustomSkillInput] = useState("")
  const [customSkillLoading, setCustomSkillLoading] = useState(false)
  const [localSkills, setLocalSkills] = useState(skills ?? [])
  const [startDate, setStartDate] = useState<string>(
    mission?.startDate ? new Date(mission.startDate).toISOString().split("T")[0] : ""
  )
  const [dueDate, setDueDate] = useState<string>(
    mission?.dueDate ? new Date(mission.dueDate).toISOString().split("T")[0] : ""
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function toggleSkill(skillId: string) {
    setSelectedSkillIds((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    )
  }

  function toggleCategory(cat: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  async function addCustomSkill() {
    const name = customSkillInput.trim()
    if (!name) return
    setCustomSkillLoading(true)
    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const skill = await res.json()
        // Add to local list if not already there
        setLocalSkills((prev) =>
          prev.find((s) => s.id === skill.id) ? prev : [...prev, skill]
        )
        // Auto-select it
        setSelectedSkillIds((prev) =>
          prev.includes(skill.id) ? prev : [...prev, skill.id]
        )
        setCustomSkillInput("")
        // Open Personalizado category
        setOpenCategories((prev) => new Set(prev).add("Personalizado"))
      }
    } catch {
      // silent
    } finally {
      setCustomSkillLoading(false)
    }
  }

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

    if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
      setError(t("errorDateRange"))
      setLoading(false)
      return
    }

    const payload = {
      title,
      description: description || null,
      module,
      icon: missionType === "DAILY" ? "today" : icon,
      xpReward,
      kreditsReward,
      priority,
      organizationId: selectedOrgId,
      objectives: missionType === "DAILY" ? [] : objectives.map((o, i) => ({ ...o, order: i })),
      skillIds: selectedSkillIds,
      startDate: startDate || null,
      dueDate: dueDate || null,
      missionType,
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
        setError(data.error ?? t("errorSave"))
        return
      }

      router.push("/admin/objetivos")
      router.refresh()
    } catch {
      setError(t("errorConnection"))
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
            {t("adminBreadcrumb")}
          </p>
          <h1 className="font-headline text-2xl font-bold text-on-surface mt-0.5">
            {isEdit ? t("editTitle") : t("newTitle")}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mission type toggle */}
        {!isEdit && (
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
            <div className="rounded-lg bg-surface-bright p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                {t("missionTypeLabel")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMissionType("OBJECTIVE")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                    missionType === "OBJECTIVE"
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-lowest text-outline hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">account_tree</span>
                  {t("complexObjective")}
                </button>
                <button
                  type="button"
                  onClick={() => setMissionType("DAILY")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                    missionType === "DAILY"
                      ? "bg-tertiary text-on-tertiary"
                      : "bg-surface-container-lowest text-outline hover:bg-surface-container-high"
                  }`}
                >
                  <span className="material-symbols-outlined text-base">today</span>
                  {t("dailyMission")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {t("generalInfo")}
            </p>

            {/* Company */}
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {t("fieldCompany")}
              </label>
              {orgs.length === 1 ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/15">
                  <span className="material-symbols-outlined text-primary">corporate_fare</span>
                  <span className="text-sm font-semibold text-on-surface">{orgs[0].name}</span>
                  <span className="text-[9px] text-outline ml-auto">{t("autoSelected")}</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {orgs.map((org) => (
                    <button
                      key={org.id}
                      type="button"
                      onClick={() => setSelectedOrgId(org.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                        selectedOrgId === org.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant/15 bg-surface-container-lowest text-on-surface hover:border-outline-variant/40"
                      }`}
                    >
                      <span className="material-symbols-outlined text-lg">corporate_fare</span>
                      <span className="text-sm font-semibold">{org.name}</span>
                      {selectedOrgId === org.id && (
                        <span
                          className="material-symbols-outlined text-sm ml-auto"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          check_circle
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-outline">
                {t("missionVisible")}
              </p>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {t("fieldTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder={t("titlePlaceholder")}
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {t("fieldDescription")}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder={t("descriptionPlaceholder")}
                className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline resize-none"
              />
            </div>

            {/* Module + Priority row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {t("fieldModule")}
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
                  {t("fieldPriority")}
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
                {t("fieldXpReward")}
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{t("points")}</span>
              </div>
            </div>

            {/* Kredits Reward */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                {t("kreditsReward")}
              </label>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-lg">toll</span>
                <input
                  type="number"
                  value={kreditsReward}
                  onChange={(e) => setKreditsReward(parseInt(e.target.value) || 0)}
                  min={0}
                  className="w-32 bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-secondary font-bold border border-outline-variant/30 focus:outline-none focus:border-secondary"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-outline">{t("points")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dates card */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-outline text-lg">event</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Fechas del Proyecto
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Fecha de inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary w-full"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  Fecha límite
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ colorScheme: "dark" }}
                  className="bg-surface-container-lowest rounded-lg px-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary w-full"
                />
                <p className="text-[10px] text-outline">Opcional, pero recomendado para activar recordatorios</p>
              </div>
            </div>
          </div>
        </div>

        {/* Icon Picker card — hidden for daily missions */}
        {missionType !== "DAILY" && <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {t("iconSection")}
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
        </div>}

        {/* Skills section */}
        {localSkills !== undefined && (() => {
          const query = skillSearch.trim().toLowerCase()
          const filtered = query
            ? localSkills.filter((s) => s.name.toLowerCase().includes(query) || s.category.toLowerCase().includes(query))
            : localSkills

          // group by category preserving insertion order
          const categoryMap = new Map<string, typeof localSkills>()
          for (const s of filtered) {
            if (!categoryMap.has(s.category)) categoryMap.set(s.category, [])
            categoryMap.get(s.category)!.push(s)
          }

          return (
            <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <div className="rounded-lg bg-surface-bright p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                      {t("skillsSection")}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      {t("skillsHint")}
                    </p>
                  </div>
                  {selectedSkillIds.length > 0 && (
                    <span className="flex-shrink-0 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-[10px] font-bold uppercase tracking-widest">
                      {selectedSkillIds.length} sel.
                    </span>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-base pointer-events-none">
                    search
                  </span>
                  <input
                    type="text"
                    value={skillSearch}
                    onChange={(e) => setSkillSearch(e.target.value)}
                    placeholder="Buscar habilidad…"
                    className="w-full bg-surface-container-lowest rounded-lg pl-9 pr-3 py-2.5 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
                  />
                  {skillSearch && (
                    <button
                      type="button"
                      onClick={() => setSkillSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined text-base">close</span>
                    </button>
                  )}
                </div>

                {/* Selected chips (always visible) */}
                {selectedSkillIds.length > 0 && !query && (
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-2">Seleccionadas</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSkillIds.map((id) => {
                        const s = localSkills.find((sk) => sk.id === id)
                        if (!s) return null
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => toggleSkill(id)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
                          >
                            <span className="material-symbols-outlined text-xs">{s.icon}</span>
                            {s.name}
                            <span className="material-symbols-outlined text-xs">close</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Category accordion */}
                <div className="space-y-1">
                  {[...categoryMap.entries()].map(([cat, catSkills]) => {
                    const isOpen = openCategories.has(cat) || !!query
                    const selectedInCat = catSkills.filter((s) => selectedSkillIds.includes(s.id)).length
                    return (
                      <div key={cat} className="rounded-lg overflow-hidden border border-outline-variant/15">
                        <button
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className="w-full flex items-center gap-3 px-4 py-3 bg-surface-container-lowest hover:bg-surface-container-high transition-colors text-left"
                        >
                          <span className="material-symbols-outlined text-base text-outline">
                            {isOpen ? "expand_less" : "expand_more"}
                          </span>
                          <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                            {cat}
                          </span>
                          <span className="text-[9px] text-outline">
                            {catSkills.length}
                          </span>
                          {selectedInCat > 0 && (
                            <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest">
                              {selectedInCat}
                            </span>
                          )}
                        </button>
                        {isOpen && (
                          <div className="p-3 bg-surface flex flex-wrap gap-1.5">
                            {catSkills.map((skill) => {
                              const isSelected = selectedSkillIds.includes(skill.id)
                              return (
                                <button
                                  key={skill.id}
                                  type="button"
                                  onClick={() => toggleSkill(skill.id)}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                                    isSelected
                                      ? "bg-primary text-on-primary"
                                      : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                                  }`}
                                >
                                  <span className="material-symbols-outlined text-sm">{skill.icon}</span>
                                  {skill.name}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {filtered.length === 0 && (
                  <p className="text-center text-outline text-sm py-4">No se encontraron habilidades</p>
                )}

                {/* Custom skill */}
                <div className="pt-2 border-t border-outline-variant/15">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-2">
                    ¿No encuentras la habilidad? Añádela
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomSkill() } }}
                      placeholder="Ej: Verint, Zendesk, Power Automate…"
                      className="flex-1 bg-surface-container-lowest rounded-lg px-3 py-2 text-sm text-on-surface border border-outline-variant/30 focus:outline-none focus:border-primary placeholder:text-outline"
                    />
                    <button
                      type="button"
                      onClick={addCustomSkill}
                      disabled={!customSkillInput.trim() || customSkillLoading}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-colors disabled:opacity-40 active:scale-95"
                    >
                      {customSkillLoading
                        ? <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                        : <span className="material-symbols-outlined text-sm">add</span>
                      }
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Objectives section — hidden for daily missions */}
        {missionType !== "DAILY" && <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
          <div className="rounded-lg bg-surface-bright p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                  {t("missionsSection")}
                </p>
                <p className="text-[11px] text-on-surface-variant mt-0.5">
                  {t("missionsSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={addObjective}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-base">add</span>
                {t("addMission")}
              </button>
            </div>

            {objectives.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-14 h-14 rounded-xl bg-surface-container-lowest flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-3xl text-outline opacity-40">
                    list_alt
                  </span>
                </div>
                <p className="text-outline text-sm">{t("noMissions")}</p>
                <p className="text-outline text-[11px]">{t("noMissionsHint")}</p>
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
        </div>}

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
            {t("cancelButton")}
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
            {isEdit ? t("saveButton") : t("createButton")}
          </button>
        </div>
      </form>
    </div>
  )
}
