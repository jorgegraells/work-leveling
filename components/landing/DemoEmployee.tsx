"use client"

import { useState, useEffect, useCallback } from "react"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CursorPos {
  x: number
  y: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOTAL_STEPS = 8
const STEP_DURATION = 2500 // ms per step

// Cursor positions (% based for responsive)
const cursorPositions: Record<number, CursorPos> = {
  0: { x: 50, y: 30 },   // Dashboard — hovering over KPIs
  1: { x: 30, y: 65 },   // Dashboard — moving to Proyecto Alpha
  2: { x: 50, y: 40 },   // Missions — viewing missions list
  3: { x: 72, y: 58 },   // Missions — moving to COMPLETAR button
  4: { x: 72, y: 58 },   // Completing — click effect on button
  5: { x: 50, y: 30 },   // Completing — watching animation
  6: { x: 60, y: 50 },   // Profile — viewing attributes
  7: { x: 55, y: 72 },   // Profile — expanding completed project
}

// Which screen to show per step
const screenForStep: Record<number, number> = {
  0: 0,
  1: 0,
  2: 1,
  3: 1,
  4: 2,
  5: 2,
  6: 3,
  7: 3,
}

// ---------------------------------------------------------------------------
// Mini icon helper
// ---------------------------------------------------------------------------

function MIcon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontSize: "inherit" }}
    >
      {name}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Screen 0: Dashboard
// ---------------------------------------------------------------------------

function ScreenDashboard({ step }: { step: number }) {
  const projects = [
    { name: "Proyecto Alpha", progress: 65, color: "bg-tertiary" },
    { name: "Proyecto Beta", progress: 30, color: "bg-secondary" },
  ]

  return (
    <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-outline uppercase tracking-widest font-label">
            Panel del empleado
          </p>
          <p className="text-[13px] font-headline font-bold text-on-surface">
            Bienvenido, María
          </p>
        </div>
        <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
          <MIcon name="military_tech" className="text-primary text-[10px]" />
          <span className="text-[8px] font-bold text-primary font-label">
            NIVEL 8
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { label: "XP Total", value: "720", icon: "bolt", accent: "text-primary" },
          { label: "En Progreso", value: "3", icon: "pending", accent: "text-tertiary" },
          { label: "Completados", value: "2", icon: "check_circle", accent: "text-secondary" },
          { label: "Trofeos", value: "5", icon: "emoji_events", accent: "text-primary" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg bg-surface-bright p-2 flex flex-col items-center gap-0.5"
          >
            <span className={`text-[10px] ${kpi.accent}`}>
              <MIcon name={kpi.icon} />
            </span>
            <span className="text-[12px] font-headline font-bold text-on-surface">
              {kpi.value}
            </span>
            <span className="text-[7px] text-outline uppercase tracking-widest font-label">
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      {/* Active Projects */}
      <div>
        <p className="text-[8px] text-outline uppercase tracking-widest font-label mb-1.5">
          Proyectos activos
        </p>
        <div className="space-y-1.5">
          {projects.map((p) => (
            <div
              key={p.name}
              className={`rounded-xl bg-surface-container-highest p-0.5 transition-all duration-300 ${
                step === 1 && p.name === "Proyecto Alpha"
                  ? "ring-1 ring-tertiary/40"
                  : ""
              }`}
            >
              <div className="rounded-lg bg-surface-bright p-2 flex items-center gap-2">
                <span className="text-[10px] text-tertiary">
                  <MIcon name="rocket_launch" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold text-on-surface font-body truncate">
                    {p.name}
                  </p>
                  <div className="mt-1 h-1 rounded-full bg-surface-container-lowest overflow-hidden">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all duration-500`}
                      style={{ width: `${p.progress}%` }}
                    />
                  </div>
                  <p className="text-[7px] text-outline mt-0.5 font-label">
                    {p.progress}% completado
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Mission */}
      <div>
        <p className="text-[8px] text-outline uppercase tracking-widest font-label mb-1">
          Misión pendiente
        </p>
        <div className="rounded-lg bg-surface-bright p-2 flex items-center gap-2">
          <span className="text-[10px] text-primary">
            <MIcon name="assignment" />
          </span>
          <span className="text-[8px] text-on-surface font-body flex-1">
            Completar informe Q4
          </span>
          <span className="text-[7px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-full font-label uppercase tracking-wider">
            +50 XP
          </span>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 1: Missions / Project
// ---------------------------------------------------------------------------

function ScreenMissions({ step }: { step: number }) {
  const missions = [
    { name: "Investigación de mercado", status: "done" as const, xp: 100 },
    { name: "Análisis competitivo", status: "progress" as const, xp: 150 },
    { name: "Presentación final", status: "locked" as const, xp: 200 },
  ]

  return (
    <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-outline">
          <MIcon name="arrow_back" />
        </span>
        <div className="flex items-center gap-1 bg-primary/20 px-2 py-0.5 rounded-full">
          <MIcon name="military_tech" className="text-primary text-[10px]" />
          <span className="text-[8px] font-bold text-primary font-label">
            NIVEL 8
          </span>
        </div>
      </div>

      {/* Project Card */}
      <div className="rounded-xl bg-surface-container-highest p-0.5">
        <div className="rounded-lg bg-surface-bright p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] text-tertiary">
              <MIcon name="rocket_launch" />
            </span>
            <div>
              <p className="text-[11px] font-headline font-bold text-on-surface">
                Proyecto Alpha
              </p>
              <p className="text-[7px] text-outline font-label uppercase tracking-widest">
                3 misiones · 450 XP total
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-surface-container-lowest overflow-hidden mb-3">
            <div className="h-full rounded-full bg-tertiary w-[33%]" />
          </div>

          {/* Missions list */}
          <div className="space-y-1.5">
            {missions.map((m) => (
              <div
                key={m.name}
                className={`rounded-md p-2 flex items-center gap-2 transition-all duration-300 ${
                  m.status === "done"
                    ? "bg-secondary/10"
                    : m.status === "progress"
                      ? "bg-tertiary/10"
                      : "bg-surface-container-high/50"
                }`}
              >
                <span
                  className={`text-[10px] ${
                    m.status === "done"
                      ? "text-secondary"
                      : m.status === "progress"
                        ? "text-tertiary animate-pulse"
                        : "text-outline/40"
                  }`}
                >
                  <MIcon
                    name={
                      m.status === "done"
                        ? "check_circle"
                        : m.status === "progress"
                          ? "autorenew"
                          : "lock"
                    }
                  />
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[8px] font-body ${
                      m.status === "locked"
                        ? "text-outline/40"
                        : "text-on-surface"
                    }`}
                  >
                    {m.name}
                  </p>
                  <p
                    className={`text-[7px] font-label ${
                      m.status === "done"
                        ? "text-secondary"
                        : m.status === "progress"
                          ? "text-tertiary"
                          : "text-outline/30"
                    }`}
                  >
                    {m.status === "done"
                      ? "COMPLETADA"
                      : m.status === "progress"
                        ? "EN PROGRESO"
                        : "BLOQUEADA"}
                  </p>
                </div>
                <span className="text-[7px] text-outline font-label">
                  +{m.xp} XP
                </span>
                {m.status === "progress" && (
                  <button
                    className={`text-[7px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary font-label transition-all duration-200 ${
                      step === 3 ? "scale-105 shadow-glow-gold" : ""
                    }`}
                  >
                    Completar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 2: Completing Mission
// ---------------------------------------------------------------------------

function ScreenComplete({ step }: { step: number }) {
  const isAfterClick = step >= 5

  const missions = [
    { name: "Investigación de mercado", status: "done" as const },
    {
      name: "Análisis competitivo",
      status: (isAfterClick ? "done" : "completing") as
        | "done"
        | "completing",
    },
    {
      name: "Presentación final",
      status: (isAfterClick ? "active" : "locked") as "active" | "locked",
    },
  ]

  const progressWidth = isAfterClick ? "66%" : "33%"

  return (
    <div className="p-3 space-y-2.5 relative">
      {/* XP toast */}
      <div
        className={`absolute top-2 right-3 flex items-center gap-1 bg-primary/20 px-2.5 py-1 rounded-full transition-all duration-700 ${
          isAfterClick
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-3"
        }`}
      >
        <MIcon name="bolt" className="text-primary text-[10px]" />
        <span className="text-[10px] font-headline font-bold text-primary">
          +150 XP
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-outline">
          <MIcon name="arrow_back" />
        </span>
        <p className="text-[10px] font-headline font-bold text-on-surface">
          Proyecto Alpha
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between mb-0.5">
          <span className="text-[7px] text-outline font-label uppercase tracking-widest">
            Progreso del proyecto
          </span>
          <span className="text-[7px] text-tertiary font-label font-bold">
            {isAfterClick ? "66%" : "33%"}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
          <div
            className="h-full rounded-full bg-tertiary transition-all duration-1000 ease-out"
            style={{ width: progressWidth }}
          />
        </div>
      </div>

      {/* Missions */}
      <div className="space-y-1.5">
        {missions.map((m) => {
          const isDone = m.status === "done"
          const isCompleting = m.status === "completing"
          const isActive = m.status === "active"
          const isLocked = m.status === "locked"

          return (
            <div
              key={m.name}
              className={`rounded-md p-2 flex items-center gap-2 transition-all duration-500 ${
                isDone
                  ? "bg-secondary/10"
                  : isCompleting
                    ? "bg-primary/15"
                    : isActive
                      ? "bg-tertiary/10"
                      : "bg-surface-container-high/50"
              }`}
            >
              <span
                className={`text-[10px] transition-all duration-500 ${
                  isDone
                    ? "text-secondary"
                    : isCompleting
                      ? "text-primary animate-spin"
                      : isActive
                        ? "text-tertiary"
                        : "text-outline/40"
                }`}
              >
                <MIcon
                  name={
                    isDone
                      ? "check_circle"
                      : isCompleting
                        ? "hourglass_top"
                        : isActive
                          ? "play_circle"
                          : "lock"
                  }
                />
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-[8px] font-body transition-colors duration-500 ${
                    isLocked ? "text-outline/40" : "text-on-surface"
                  }`}
                >
                  {m.name}
                </p>
                <p
                  className={`text-[7px] font-label uppercase tracking-wider transition-colors duration-500 ${
                    isDone
                      ? "text-secondary"
                      : isCompleting
                        ? "text-primary"
                        : isActive
                          ? "text-tertiary"
                          : "text-outline/30"
                  }`}
                >
                  {isDone
                    ? "COMPLETADA"
                    : isCompleting
                      ? "COMPLETANDO..."
                      : isActive
                        ? "DISPONIBLE"
                        : "BLOQUEADA"}
                </p>
              </div>
              {isDone && m.name === "Análisis competitivo" && (
                <span
                  className={`text-[7px] text-secondary font-bold font-label transition-all duration-500 ${
                    isAfterClick ? "opacity-100" : "opacity-0"
                  }`}
                >
                  +150 XP
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Success message */}
      <div
        className={`rounded-lg bg-secondary/10 p-2 flex items-center gap-2 transition-all duration-700 ${
          isAfterClick
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2"
        }`}
      >
        <MIcon name="celebration" className="text-secondary text-[10px]" />
        <span className="text-[8px] text-secondary font-body">
          Misión completada — nueva misión desbloqueada
        </span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Screen 3: Profile
// ---------------------------------------------------------------------------

function ScreenProfile({ step }: { step: number }) {
  const attributes = [
    { name: "Lógica", value: 72, color: "bg-primary" },
    { name: "Creatividad", value: 85, color: "bg-tertiary" },
    { name: "Liderazgo", value: 45, color: "bg-secondary" },
    { name: "Negociación", value: 60, color: "bg-on-tertiary-container" },
  ]

  const showExpanded = step === 7

  return (
    <div className="p-3 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="rounded-full bg-surface-container-highest p-0.5 shadow-wood-bezel">
          <div className="w-10 h-10 rounded-full bg-surface-bright flex items-center justify-center">
            <MIcon name="person" className="text-on-surface text-[16px]" />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-headline font-bold text-on-surface">
            María López
          </p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="bg-primary/20 px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-glow-gold">
              <MIcon
                name="military_tech"
                className="text-primary text-[8px]"
              />
              <span className="text-[7px] font-bold text-primary font-label">
                NIVEL 8
              </span>
            </div>
            <span className="text-[7px] text-outline font-label">
              · 720 XP
            </span>
          </div>
        </div>
        {/* Circular progress ring */}
        <div className="ml-auto relative w-10 h-10">
          <svg viewBox="0 0 36 36" className="w-10 h-10 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#0e0e0e"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke="#e9c400"
              strokeWidth="3"
              strokeDasharray="87.96"
              strokeDashoffset={87.96 * (1 - 0.68)}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[7px] font-bold text-primary font-label">
            68%
          </span>
        </div>
      </div>

      {/* Attributes */}
      <div>
        <p className="text-[8px] text-outline uppercase tracking-widest font-label mb-1.5">
          Atributos
        </p>
        <div className="space-y-1.5">
          {attributes.map((a) => (
            <div key={a.name} className="flex items-center gap-2">
              <span className="text-[7px] text-on-surface-variant font-label w-14 text-right">
                {a.name}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                <div
                  className={`h-full rounded-full ${a.color} transition-all duration-1000`}
                  style={{ width: `${a.value}%` }}
                />
              </div>
              <span className="text-[7px] text-outline font-label w-6">
                {a.value}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent accomplishments */}
      <div>
        <p className="text-[8px] text-outline uppercase tracking-widest font-label mb-1.5">
          Logros recientes
        </p>
        <div className="space-y-1">
          <div
            className={`rounded-xl bg-surface-container-highest p-0.5 transition-all duration-500 ${
              showExpanded ? "ring-1 ring-tertiary/30" : ""
            }`}
          >
            <div className="rounded-lg bg-surface-bright p-2">
              <div className="flex items-center gap-2">
                <MIcon
                  name="emoji_events"
                  className="text-primary text-[10px]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[8px] font-bold text-on-surface font-body">
                    Proyecto Gamma — Completado
                  </p>
                  <p className="text-[7px] text-outline font-label">
                    +300 XP · Nota: 9.2/10
                  </p>
                </div>
                <MIcon
                  name={showExpanded ? "expand_less" : "expand_more"}
                  className="text-outline text-[10px]"
                />
              </div>
              {/* Expanded review */}
              <div
                className={`overflow-hidden transition-all duration-500 ${
                  showExpanded ? "max-h-20 mt-1.5 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="rounded-md bg-surface-container-lowest p-2 space-y-1">
                  <div className="flex items-center gap-1">
                    <MIcon
                      name="rate_review"
                      className="text-tertiary text-[8px]"
                    />
                    <span className="text-[7px] text-tertiary font-label uppercase tracking-wider">
                      Nota del reviewer
                    </span>
                  </div>
                  <p className="text-[7px] text-on-surface-variant font-body leading-relaxed">
                    &quot;Excelente análisis y presentación. Destaca la capacidad
                    de síntesis y la calidad visual del entregable.&quot;
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-surface-container-highest p-0.5">
            <div className="rounded-lg bg-surface-bright p-2 flex items-center gap-2">
              <MIcon
                name="workspace_premium"
                className="text-secondary text-[10px]"
              />
              <div className="flex-1 min-w-0">
                <p className="text-[8px] font-bold text-on-surface font-body">
                  Trofeo: Racha de 5 días
                </p>
                <p className="text-[7px] text-outline font-label">
                  Desbloqueado hace 3 días
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// URL bar text per screen
// ---------------------------------------------------------------------------

const urlForScreen: Record<number, string> = {
  0: "workleveling.app/dashboard",
  1: "workleveling.app/proyecto/alpha",
  2: "workleveling.app/proyecto/alpha",
  3: "workleveling.app/perfil",
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DemoEmployee() {
  const [step, setStep] = useState(0)
  const [clicking, setClicking] = useState(false)

  // Auto-advance steps
  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % TOTAL_STEPS)
    }, STEP_DURATION)
    return () => clearInterval(timer)
  }, [])

  // Click effect on transition steps (1 -> 2, 3 -> 4, 7 -> 0)
  const isClickStep = step === 1 || step === 3 || step === 7
  useEffect(() => {
    if (isClickStep) {
      const timeout = setTimeout(() => setClicking(true), 1200)
      const reset = setTimeout(() => setClicking(false), 1600)
      return () => {
        clearTimeout(timeout)
        clearTimeout(reset)
      }
    }
  }, [isClickStep, step])

  const screen = screenForStep[step] ?? 0
  const cursor = cursorPositions[step] ?? { x: 50, y: 50 }

  return (
    <div className="relative rounded-2xl bg-surface-container-highest p-1 shadow-[0px_30px_60px_rgba(0,0,0,0.5)]">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-high rounded-t-xl">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-error/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
        </div>
        <div className="flex-1 mx-8">
          <div className="bg-surface-container-lowest rounded-md px-3 py-1 text-[9px] text-outline text-center font-label transition-all duration-300">
            {urlForScreen[screen]}
          </div>
        </div>
      </div>

      {/* Screen content */}
      <div
        className="relative bg-surface rounded-b-xl overflow-hidden"
        style={{ height: 400 }}
      >
        {/* Screens with crossfade */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            screen === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ScreenDashboard step={step} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            screen === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ScreenMissions step={step} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            screen === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ScreenComplete step={step} />
        </div>
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            screen === 3 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <ScreenProfile step={step} />
        </div>

        {/* Animated cursor */}
        <div
          className={`absolute w-5 h-5 z-50 pointer-events-none transition-all duration-700 ease-in-out ${
            clicking ? "scale-75" : "scale-100"
          }`}
          style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
        >
          <svg viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
            <path d="M5 3l14 8-6 2-3 7z" />
          </svg>
          {/* Click ripple */}
          {clicking && (
            <div className="absolute -inset-2 rounded-full bg-white/20 animate-ping" />
          )}
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex justify-center gap-1.5 py-2">
        {[0, 1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 rounded-full transition-all duration-300 ${
              screen === s
                ? "w-6 bg-primary"
                : "w-1.5 bg-surface-container-high"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
