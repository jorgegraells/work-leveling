"use client"

import { useState, useEffect, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Screen = 0 | 1 | 2 | 3

interface CursorPos {
  x: number
  y: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCREEN_DURATION = 5000
const TOTAL_SCREENS = 4

const URLS: Record<Screen, string> = {
  0: "workleveling.app/admin",
  1: "workleveling.app/admin/empresas",
  2: "workleveling.app/admin/kpis",
  3: "workleveling.app/admin/estadisticas",
}

// Cursor target positions (percentages) for each screen
const CURSOR_TARGETS: Record<Screen, CursorPos> = {
  0: { x: 22, y: 82 },   // "Empresas" button
  1: { x: 30, y: 42 },   // "Tech Corp" row
  2: { x: 65, y: 55 },   // stats area
  3: { x: 50, y: 50 },   // center of chart
}

// ---------------------------------------------------------------------------
// Icon helper
// ---------------------------------------------------------------------------

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  )
}

// ---------------------------------------------------------------------------
// Screen 0: Admin Dashboard
// ---------------------------------------------------------------------------

function ScreenDashboard() {
  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="shield_person" className="text-lg text-primary" />
        <h3 className="text-sm font-headline font-bold text-on-surface">
          Super Admin Dashboard
        </h3>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Empresas", value: "5", icon: "apartment", color: "text-primary" },
          { label: "Usuarios", value: "47", icon: "group", color: "text-secondary" },
          { label: "Pendientes", value: "12", icon: "pending_actions", color: "text-tertiary" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-surface-container-lowest p-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon name={kpi.icon} className={`text-sm ${kpi.color}`} />
              <p className="text-[8px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                {kpi.label}
              </p>
            </div>
            <p className={`text-lg font-headline font-black ${kpi.color}`}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick access buttons */}
      <div className="space-y-1.5">
        <p className="text-[8px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Acceso rapido
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {[
            { label: "Empresas", icon: "apartment", color: "text-primary" },
            { label: "Proyectos", icon: "folder", color: "text-tertiary" },
            { label: "Aprobaciones", icon: "fact_check", color: "text-secondary" },
            { label: "Estadisticas", icon: "analytics", color: "text-on-tertiary-container" },
          ].map((btn) => (
            <div
              key={btn.label}
              className="flex flex-col items-center gap-1 rounded-lg bg-surface-container-high p-2 cursor-pointer hover:bg-surface-container-highest transition-colors"
            >
              <Icon name={btn.icon} className={`text-base ${btn.color}`} />
              <span className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
                {btn.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 1: Empresas
// ---------------------------------------------------------------------------

function ScreenEmpresas() {
  const empresas = [
    { name: "Tech Corp", plan: "PROFESSIONAL", users: 12, current: true },
    { name: "Design Studio", plan: "STARTER", users: 5, current: false },
    { name: "Global Finance", plan: "ENTERPRISE", users: 30, current: false },
  ]

  const planColors: Record<string, string> = {
    FREE: "bg-outline/20 text-outline",
    STARTER: "bg-tertiary/20 text-tertiary",
    PROFESSIONAL: "bg-secondary/20 text-secondary",
    ENTERPRISE: "bg-primary/20 text-primary",
  }

  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="apartment" className="text-lg text-primary" />
          <h3 className="text-sm font-headline font-bold text-on-surface">
            Gestion de Empresas
          </h3>
        </div>
        <div className="flex items-center gap-1 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim px-2 py-1">
          <Icon name="add" className="text-xs text-on-primary" />
          <span className="text-[7px] font-label font-bold uppercase tracking-widest text-on-primary">
            Nueva
          </span>
        </div>
      </div>

      {/* Empresa list */}
      <div className="space-y-2">
        {empresas.map((emp) => (
          <div
            key={emp.name}
            className={`flex items-center justify-between rounded-lg bg-surface-container-lowest p-3 transition-colors ${
              emp.current ? "ring-1 ring-primary/40" : ""
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                emp.current ? "bg-primary/20" : "bg-surface-container-high"
              }`}>
                <Icon name="apartment" className={`text-sm ${emp.current ? "text-primary" : "text-on-surface-variant"}`} />
              </div>
              <div>
                <p className="text-xs font-body font-medium text-on-surface">{emp.name}</p>
                <p className="text-[8px] font-body text-on-surface-variant">{emp.users} usuarios</p>
              </div>
            </div>
            <span className={`rounded-full px-2 py-0.5 text-[7px] font-label font-bold uppercase tracking-widest ${planColors[emp.plan]}`}>
              {emp.plan}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 2: KPIs
// ---------------------------------------------------------------------------

function ScreenKPIs() {
  const performers = [
    { name: "Maria L.", level: 12, xp: "4.2k" },
    { name: "Carlos R.", level: 10, xp: "3.8k" },
    { name: "Ana G.", level: 9, xp: "3.1k" },
  ]

  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Icon name="monitoring" className="text-lg text-primary" />
        <h3 className="text-sm font-headline font-bold text-on-surface">
          KPI Dashboard
        </h3>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "Misiones", value: "45", color: "text-tertiary" },
          { label: "Tasa", value: "82%", color: "text-secondary" },
          { label: "XP Total", value: "12.4k", color: "text-primary" },
          { label: "A Tiempo", value: "91%", color: "text-on-tertiary-container" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-lg bg-surface-container-lowest p-2 text-center">
            <p className={`text-sm font-headline font-black ${kpi.color}`}>{kpi.value}</p>
            <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">
              {kpi.label}
            </p>
          </div>
        ))}
      </div>

      {/* Gauge + performers side by side */}
      <div className="flex gap-3">
        {/* Mini gauge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-lg bg-surface-container-lowest p-3 w-24">
          <svg viewBox="0 0 80 50" className="w-16 h-10">
            {/* Track */}
            <path
              d="M 10 45 A 30 30 0 0 1 70 45"
              fill="none"
              stroke="#0e0e0e"
              strokeWidth="6"
              strokeLinecap="round"
            />
            {/* Fill - 91% */}
            <path
              d="M 10 45 A 30 30 0 0 1 70 45"
              fill="none"
              stroke="#34a0fe"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray="94.2"
              strokeDashoffset="8.5"
            />
          </svg>
          <p className="text-sm font-headline font-black text-on-tertiary-container -mt-1">91%</p>
          <p className="text-[7px] font-label text-on-surface-variant">Cumplimiento</p>
        </div>

        {/* Top performers */}
        <div className="flex-1 rounded-lg bg-surface-container-lowest p-2.5 space-y-1.5">
          <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
            Top Performers
          </p>
          {performers.map((p, i) => (
            <div key={p.name} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-label font-bold text-primary w-3">{i + 1}</span>
                <div className="w-5 h-5 rounded-full bg-surface-container-high flex items-center justify-center">
                  <Icon name="person" className="text-[10px] text-on-surface-variant" />
                </div>
                <span className="text-[9px] font-body text-on-surface">{p.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-label text-secondary">Nv.{p.level}</span>
                <span className="text-[8px] font-label text-primary">{p.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 3: Estadisticas
// ---------------------------------------------------------------------------

function ScreenEstadisticas() {
  const weekBars = [65, 45, 80, 55, 90, 40, 70]
  const days = ["L", "M", "X", "J", "V", "S", "D"]

  const moduleBars = [
    { label: "Ventas", width: 78, color: "bg-secondary" },
    { label: "Proyectos", width: 65, color: "bg-tertiary" },
    { label: "Alianzas", width: 52, color: "bg-primary" },
    { label: "Informes", width: 40, color: "bg-on-tertiary-container" },
    { label: "Estrategia", width: 30, color: "bg-outline" },
  ]

  return (
    <div className="flex-1 p-4 space-y-3 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="analytics" className="text-lg text-primary" />
          <h3 className="text-sm font-headline font-bold text-on-surface">
            Estadisticas
          </h3>
        </div>
        <div className="rounded-lg bg-surface-container-lowest px-2.5 py-1.5">
          <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">Total completados</p>
          <p className="text-lg font-headline font-black text-primary text-center">89</p>
        </div>
      </div>

      {/* Bar chart - weekly */}
      <div className="rounded-lg bg-surface-container-lowest p-3">
        <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-2">
          Misiones por dia
        </p>
        <div className="flex items-end gap-1.5 h-16">
          {weekBars.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-sm bg-primary transition-all duration-500"
                style={{ height: `${h}%` }}
              />
              <span className="text-[7px] font-label text-on-surface-variant">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Horizontal bars - by module */}
      <div className="rounded-lg bg-surface-container-lowest p-3 space-y-2">
        <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
          Misiones por modulo
        </p>
        {moduleBars.map((bar) => (
          <div key={bar.label} className="space-y-0.5">
            <div className="flex justify-between">
              <span className="text-[8px] font-body text-on-surface-variant">{bar.label}</span>
              <span className="text-[8px] font-label text-on-surface-variant">{bar.width}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div
                className={`h-full rounded-full ${bar.color} transition-all duration-700`}
                style={{ width: `${bar.width}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main DemoCEO component
// ---------------------------------------------------------------------------

export default function DemoCEO() {
  const [screen, setScreen] = useState<Screen>(0)
  const [cursorPos, setCursorPos] = useState<CursorPos>({ x: 50, y: 50 })
  const [clicking, setClicking] = useState(false)
  const [transitioning, setTransitioning] = useState(false)

  const advanceScreen = useCallback(() => {
    // Move cursor to target
    setCursorPos(CURSOR_TARGETS[screen])

    // Click animation after cursor arrives
    const clickTimer = setTimeout(() => {
      setClicking(true)
      setTimeout(() => setClicking(false), 300)
    }, 3500)

    // Screen transition
    const transitionTimer = setTimeout(() => {
      setTransitioning(true)
      setTimeout(() => {
        setScreen((prev) => ((prev + 1) % TOTAL_SCREENS) as Screen)
        setTransitioning(false)
        setCursorPos({ x: 50, y: 50 }) // Reset cursor for next screen
      }, 400)
    }, 4200)

    return () => {
      clearTimeout(clickTimer)
      clearTimeout(transitionTimer)
    }
  }, [screen])

  useEffect(() => {
    const cleanup = advanceScreen()
    const interval = setInterval(() => {
      // This is handled by the advanceScreen setting screen state
    }, SCREEN_DURATION)

    return () => {
      cleanup()
      clearInterval(interval)
    }
  }, [screen, advanceScreen])

  const screens: Record<Screen, React.ReactNode> = {
    0: <ScreenDashboard />,
    1: <ScreenEmpresas />,
    2: <ScreenKPIs />,
    3: <ScreenEstadisticas />,
  }

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Glow */}
      <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl pointer-events-none" />

      {/* Wood-bezel frame */}
      <div className="relative rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_50px_rgba(0,0,0,0.5)]">
        <div className="rounded-lg bg-surface-bright overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest/60">
            <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
            <span className="ml-3 text-[10px] font-label text-on-surface-variant">
              {URLS[screen]}
            </span>
          </div>

          {/* Content area with cursor */}
          <div className="relative flex min-h-[340px]">
            {/* Mini sidebar */}
            <div className="w-12 shrink-0 bg-surface-container-lowest flex flex-col items-center py-4 gap-4">
              <Icon name="shield_person" className="text-lg text-primary" />
              <Icon name="apartment" className={`text-lg ${screen === 1 ? "text-primary" : "text-on-surface-variant"}`} />
              <Icon name="monitoring" className={`text-lg ${screen === 2 ? "text-primary" : "text-on-surface-variant"}`} />
              <Icon name="analytics" className={`text-lg ${screen === 3 ? "text-primary" : "text-on-surface-variant"}`} />
              <Icon name="settings" className="text-lg text-on-surface-variant" />
            </div>

            {/* Screen content */}
            <div
              className={`flex-1 transition-opacity duration-400 ${
                transitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {screens[screen]}
            </div>

            {/* Animated cursor */}
            <div
              className="absolute pointer-events-none z-20 transition-all duration-700 ease-out"
              style={{
                left: `${cursorPos.x}%`,
                top: `${cursorPos.y}%`,
                transform: "translate(-2px, -2px)",
              }}
            >
              {/* Cursor SVG */}
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="drop-shadow-lg"
              >
                <path
                  d="M5.65 2.35L19.65 12.35L12.65 13.35L9.65 21.35L5.65 2.35Z"
                  fill="white"
                  stroke="#131313"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
              </svg>
              {/* Click pulse */}
              {clicking && (
                <div className="absolute -inset-3 rounded-full bg-primary/30 animate-ping" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Screen indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === screen ? "w-6 bg-primary" : "w-2 bg-surface-container-high"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
