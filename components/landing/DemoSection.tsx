"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import DemoEmployee from "./DemoEmployee"
import DemoManager from "./DemoManager"
import DemoCEO from "./DemoCEO"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RoleTab = "empleado" | "manager" | "ceo"

interface TabConfig {
  id: RoleTab
  label: string
  icon: string
  description: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const AUTO_ROTATE_MS = 25000

const TABS: TabConfig[] = [
  {
    id: "empleado",
    label: "Empleado",
    icon: "person",
    description: "Completa misiones, sube de nivel y desarrolla tus habilidades",
  },
  {
    id: "manager",
    label: "Manager",
    icon: "supervisor_account",
    description: "Aprueba misiones, evalua atributos y gestiona proyectos",
  },
  {
    id: "ceo",
    label: "CEO",
    icon: "shield_person",
    description: "Vision total del rendimiento, KPIs y gestion multi-empresa",
  },
]

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  )
}

function _removed() { // placeholder anchor — will be cleaned
  return null
}
function _DemoEmployeePlaceholder() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-4 rounded-2xl bg-secondary/10 blur-3xl pointer-events-none" />
      <div className="relative rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_50px_rgba(0,0,0,0.5)]">
        <div className="rounded-lg bg-surface-bright overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest/60">
            <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
            <span className="ml-3 text-[10px] font-label text-on-surface-variant">
              workleveling.app/dashboard
            </span>
          </div>

          <div className="flex min-h-[340px]">
            {/* Mini sidebar */}
            <div className="w-12 shrink-0 bg-surface-container-lowest flex flex-col items-center py-4 gap-4">
              <Icon name="home" className="text-lg text-secondary" />
              <Icon name="assignment" className="text-lg text-on-surface-variant" />
              <Icon name="bar_chart" className="text-lg text-on-surface-variant" />
              <Icon name="emoji_events" className="text-lg text-on-surface-variant" />
              <Icon name="settings" className="text-lg text-on-surface-variant" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[8px] font-body text-on-surface-variant">Buenos dias</p>
                  <h3 className="text-sm font-headline font-bold text-on-surface">Bienvenido, Maria</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-label font-bold text-secondary uppercase tracking-widest">Nivel 12</span>
                  <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                    <Icon name="person" className="text-sm text-secondary" />
                  </div>
                </div>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-surface-container-lowest p-2.5">
                  <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">XP Total</p>
                  <p className="text-lg font-headline font-black text-primary">4,820</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-primary" />
                  </div>
                </div>
                <div className="rounded-lg bg-surface-container-lowest p-2.5">
                  <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">Misiones</p>
                  <p className="text-lg font-headline font-black text-secondary">18/24</p>
                  <div className="mt-1.5 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full w-3/5 rounded-full bg-secondary" />
                  </div>
                </div>
              </div>

              {/* Projects */}
              <div className="space-y-2">
                <div className="rounded-lg bg-surface-container-lowest p-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-body font-medium text-on-surface">Proyecto Alpha</p>
                    <span className="text-[8px] font-label text-tertiary">72%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full rounded-full bg-tertiary" style={{ width: "72%" }} />
                  </div>
                </div>
                <div className="rounded-lg bg-surface-container-lowest p-2.5">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-xs font-body font-medium text-on-surface">Campana Q2</p>
                    <span className="text-[8px] font-label text-secondary">45%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-full rounded-full bg-secondary" style={{ width: "45%" }} />
                  </div>
                </div>
              </div>

              {/* Attributes mini */}
              <div className="rounded-lg bg-surface-container-lowest p-2.5">
                <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">Atributos</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { label: "LDR", val: 75, color: "bg-primary" },
                    { label: "COM", val: 82, color: "bg-secondary" },
                    { label: "TEC", val: 60, color: "bg-tertiary" },
                    { label: "CRE", val: 90, color: "bg-on-tertiary-container" },
                  ].map((attr) => (
                    <div key={attr.label} className="text-center">
                      <div className="h-1 rounded-full bg-surface-container-high overflow-hidden mb-0.5">
                        <div className={`h-full rounded-full ${attr.color}`} style={{ width: `${attr.val}%` }} />
                      </div>
                      <span className="text-[6px] font-label text-on-surface-variant">{attr.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="h-1 w-6 rounded-full bg-secondary" />
        <div className="h-1 w-2 rounded-full bg-surface-container-high" />
        <div className="h-1 w-2 rounded-full bg-surface-container-high" />
      </div>
    </div>
  )
}

function DemoManagerPlaceholder() {
  return (
    <div className="relative mx-auto max-w-4xl">
      <div className="absolute -inset-4 rounded-2xl bg-tertiary/10 blur-3xl pointer-events-none" />
      <div className="relative rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_50px_rgba(0,0,0,0.5)]">
        <div className="rounded-lg bg-surface-bright overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest/60">
            <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
            <span className="ml-3 text-[10px] font-label text-on-surface-variant">
              workleveling.app/manager
            </span>
          </div>

          <div className="flex min-h-[340px]">
            {/* Mini sidebar */}
            <div className="w-12 shrink-0 bg-surface-container-lowest flex flex-col items-center py-4 gap-4">
              <Icon name="dashboard" className="text-lg text-tertiary" />
              <Icon name="fact_check" className="text-lg text-on-surface-variant" />
              <Icon name="group" className="text-lg text-on-surface-variant" />
              <Icon name="folder" className="text-lg text-on-surface-variant" />
              <Icon name="settings" className="text-lg text-on-surface-variant" />
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="supervisor_account" className="text-lg text-tertiary" />
                  <h3 className="text-sm font-headline font-bold text-on-surface">Panel de Manager</h3>
                </div>
                <span className="text-[8px] font-label font-bold text-tertiary uppercase tracking-widest">3 pendientes</span>
              </div>

              {/* Pending approvals */}
              <div className="space-y-2">
                <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                  Aprobaciones pendientes
                </p>
                {[
                  { user: "Maria L.", mission: "Implementar API REST", status: "review" },
                  { user: "Carlos R.", mission: "Disenar dashboard Q2", status: "review" },
                  { user: "Ana G.", mission: "Optimizar consultas BD", status: "review" },
                ].map((item) => (
                  <div key={item.user} className="flex items-center justify-between rounded-lg bg-surface-container-lowest p-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-tertiary/20 flex items-center justify-center">
                        <Icon name="person" className="text-xs text-tertiary" />
                      </div>
                      <div>
                        <p className="text-[9px] font-body font-medium text-on-surface">{item.user}</p>
                        <p className="text-[7px] font-body text-on-surface-variant">{item.mission}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-5 h-5 rounded bg-secondary/20 flex items-center justify-center">
                        <Icon name="check" className="text-xs text-secondary" />
                      </div>
                      <div className="w-5 h-5 rounded bg-error/20 flex items-center justify-center">
                        <Icon name="close" className="text-xs text-error" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Team stats */}
              <div className="rounded-lg bg-surface-container-lowest p-2.5">
                <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                  Rendimiento del equipo
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-sm font-headline font-black text-secondary">87%</p>
                    <p className="text-[6px] font-label text-on-surface-variant">Completado</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-headline font-black text-tertiary">12</p>
                    <p className="text-[6px] font-label text-on-surface-variant">Activas</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-headline font-black text-primary">4.2</p>
                    <p className="text-[6px] font-label text-on-surface-variant">Promedio</p>
                  </div>
                </div>
              </div>

              {/* Project progress */}
              <div className="rounded-lg bg-surface-container-lowest p-2.5 space-y-1.5">
                <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Proyectos</p>
                {[
                  { name: "Proyecto Alpha", pct: 72, color: "bg-tertiary" },
                  { name: "Campana Q2", pct: 45, color: "bg-secondary" },
                ].map((proj) => (
                  <div key={proj.name}>
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[8px] font-body text-on-surface">{proj.name}</span>
                      <span className="text-[8px] font-label text-on-surface-variant">{proj.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className={`h-full rounded-full ${proj.color}`} style={{ width: `${proj.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-2 mt-4">
        <div className="h-1 w-6 rounded-full bg-tertiary" />
        <div className="h-1 w-2 rounded-full bg-surface-container-high" />
        <div className="h-1 w-2 rounded-full bg-surface-container-high" />
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main DemoSection component
// ---------------------------------------------------------------------------

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState<RoleTab>("empleado")
  const [fading, setFading] = useState(false)
  const lastInteraction = useRef(Date.now())
  const autoRotateTimer = useRef<ReturnType<typeof setInterval> | null>(null)

  const switchTab = useCallback((tab: RoleTab, isUser: boolean) => {
    if (tab === activeTab) return
    if (isUser) lastInteraction.current = Date.now()

    setFading(true)
    setTimeout(() => {
      setActiveTab(tab)
      setFading(false)
    }, 250)
  }, [activeTab])

  // Auto-rotate tabs
  useEffect(() => {
    autoRotateTimer.current = setInterval(() => {
      const elapsed = Date.now() - lastInteraction.current
      if (elapsed >= AUTO_ROTATE_MS) {
        const tabOrder: RoleTab[] = ["empleado", "manager", "ceo"]
        const currentIdx = tabOrder.indexOf(activeTab)
        const nextTab = tabOrder[(currentIdx + 1) % tabOrder.length]
        switchTab(nextTab, false)
      }
    }, AUTO_ROTATE_MS)

    return () => {
      if (autoRotateTimer.current) clearInterval(autoRotateTimer.current)
    }
  }, [activeTab, switchTab])

  const activeConfig = TABS.find((t) => t.id === activeTab)!

  return (
    <section
      id="demo"
      className="relative bg-surface py-24 px-4"
    >
      {/* Subtle gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_40%_at_50%_20%,rgba(233,196,0,0.05),transparent_70%)]" />

      <div className="relative mx-auto max-w-5xl">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="mb-4 block text-[10px] font-label font-bold uppercase tracking-widest text-primary">
            Demo Interactiva
          </span>
          <h2 className="font-headline font-black text-3xl text-on-surface sm:text-4xl">
            Mira Work Leveling en accion
          </h2>
          <p className="mt-3 font-body text-base text-on-surface-variant/70">
            Explora la experiencia para cada rol
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-10">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id, true)}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 text-[10px] font-label font-bold uppercase tracking-widest transition-all duration-300 active:scale-95 ${
                activeTab === tab.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-outline hover:text-on-surface"
              }`}
            >
              <Icon name={tab.icon} className="text-base" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Demo area with fade transition */}
        <div
          className={`transition-opacity duration-250 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {activeTab === "empleado" && <DemoEmployee />}
          {activeTab === "manager" && <DemoManager />}
          {activeTab === "ceo" && <DemoCEO />}
        </div>

        {/* Role badge */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-xl bg-surface-container-highest p-1">
            <div className="rounded-lg bg-surface-bright px-5 py-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "ceo"
                  ? "bg-primary/20"
                  : activeTab === "manager"
                  ? "bg-tertiary/20"
                  : "bg-secondary/20"
              }`}>
                <Icon
                  name={activeConfig.icon}
                  className={`text-lg ${
                    activeTab === "ceo"
                      ? "text-primary"
                      : activeTab === "manager"
                      ? "text-tertiary"
                      : "text-secondary"
                  }`}
                />
              </div>
              <div>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface">
                  {activeConfig.label}
                </p>
                <p className="text-xs font-body text-on-surface-variant/70">
                  {activeConfig.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
