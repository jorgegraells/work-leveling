"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton, SignOutButton } from "@clerk/nextjs"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MissionStatus = "PENDIENTE" | "COMPLETADO"
type AccentColor = "secondary" | "tertiary" | "primary" | "on-tertiary-container"

export interface MissionCard {
  module: string
  icon: string
  task: string
  progressLabel: string
  progress: number
  status: MissionStatus
  accentColor: AccentColor
}

export interface DailyMission {
  title: string
  icon: string
  priority: string
  xp: number
}

export interface PanelCorporativoGamificadoProps {
  userLevel?: number
  userTitle?: string
  currentMission?: DailyMission
  missions?: MissionCard[]
}

// ---------------------------------------------------------------------------
// Defaults (matching the original Stitch HTML)
// ---------------------------------------------------------------------------

const DEFAULT_MISSION: DailyMission = {
  title: "Configurar la base de datos",
  icon: "database",
  priority: "Prioridad Alta",
  xp: 50,
}

const DEFAULT_MISSIONS: MissionCard[] = [
  {
    module: "Ventas & Leads",
    icon: "filter_alt",
    task: "GENERAR 3 NUEVOS LEADS CUALIFICADOS",
    progressLabel: "1/3 (33%)",
    progress: 33,
    status: "PENDIENTE",
    accentColor: "secondary",
  },
  {
    module: "Proyectos & Cronograma",
    icon: "stacked_bar_chart",
    task: "REVISAR EL CRONOGRAMA DE PROYECTOS DEL Q4",
    progressLabel: "80%",
    progress: 80,
    status: "PENDIENTE",
    accentColor: "tertiary",
  },
  {
    module: "Alianzas & Contratos",
    icon: "handshake",
    task: "FIRMAR EL CONTRATO CON EL SOCIO B2B",
    progressLabel: "0%",
    progress: 0,
    status: "PENDIENTE",
    accentColor: "primary",
  },
  {
    module: "Informes & Cumplimiento",
    icon: "assignment_turned_in",
    task: "COMPLETAR EL INFORME TRIMESTRAL DE VENTAS",
    progressLabel: "100%",
    progress: 100,
    status: "COMPLETADO",
    accentColor: "on-tertiary-container",
  },
]

const ACCENT_TEXT: Record<AccentColor, string> = {
  secondary:              "text-secondary",
  tertiary:               "text-tertiary",
  primary:                "text-primary",
  "on-tertiary-container":"text-on-tertiary-container",
}

const MOBILE_NAV = [
  { icon: "trending_up",  label: "Ventas",   active: false, filled: false },
  { icon: "account_tree", label: "Proyectos", active: false, filled: false },
  { icon: "handshake",    label: "Misiones",  active: true,  filled: true  },
  { icon: "description",  label: "Informes",  active: false, filled: false },
  { icon: "settings",     label: "Config",    active: false, filled: false },
]

const SIDEBAR_NAV = [
  { icon: "person",        label: "Perfil",     href: "/perfil"   },
  { icon: "account_tree",  label: "Proyectos",  href: "/misiones" },
  { icon: "description",   label: "Informes",   href: "#"         },
  { icon: "insights",      label: "Estrategia", href: "#"         },
  { icon: "military_tech", label: "Misiones",   href: "/misiones" },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PanelCorporativoGamificado({
  userLevel = 42,
  userTitle = "Level 42 Architect",
  currentMission = DEFAULT_MISSION,
  missions = DEFAULT_MISSIONS,
}: PanelCorporativoGamificadoProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [canLeft, setCanLeft] = useState(false)
  const [canRight, setCanRight] = useState(true)

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    const sync = () => {
      setCanLeft(el.scrollLeft > 5)
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10)
    }
    el.addEventListener("scroll", sync)
    window.addEventListener("resize", sync)
    sync()
    return () => {
      el.removeEventListener("scroll", sync)
      window.removeEventListener("resize", sync)
    }
  }, [])

  const slide = (dir: "left" | "right") => {
    const el = carouselRef.current
    if (el) el.scrollLeft += dir === "right" ? el.clientWidth : -el.clientWidth
  }

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden">
      {/* Sidebar toggle button */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="fixed top-8 left-6 z-50 p-2 bg-surface-container-highest rounded-lg border border-primary/20 text-primary hover:bg-surface-variant transition-all active:scale-95 flex items-center justify-center"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full flex flex-col p-6 z-40 bg-surface w-64 rounded-r-2xl border-r border-surface-container-highest/15 sidebar-transition"
        style={{ transform: collapsed ? "translateX(-100%)" : "translateX(0)" }}
      >
        <div className="mb-8 px-2 flex items-center gap-4 h-10">
          <div className="w-10 flex-shrink-0" />
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-outline truncate">
              WORK LEVELING
            </h2>
            <p className="text-[10px] text-primary mt-1 truncate">{userTitle}</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {SIDEBAR_NAV.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 transition-transform hover:translate-x-1 rounded-lg ${
                  active
                    ? "bg-surface-bright text-primary shadow-inner"
                    : "text-outline hover:bg-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined flex-shrink-0">{item.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto space-y-1 pt-4 border-t border-surface-container-highest/15">
          <a href="#" className="flex items-center gap-3 px-4 py-2 text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined flex-shrink-0">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Settings</span>
          </a>
          <SignOutButton>
            <button className="w-full flex items-center gap-3 px-4 py-2 text-outline hover:text-error transition-colors focus:outline-none text-left">
              <span className="material-symbols-outlined flex-shrink-0">logout</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Logout</span>
            </button>
          </SignOutButton>
          <div className="px-4 py-2 mt-2 flex justify-center">
            <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border border-outline-variant/30" } }} />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="min-h-screen flex flex-col relative overflow-hidden pb-20 md:pb-0 sidebar-content-transition"
        style={{ marginLeft: collapsed ? 0 : 256 }}
      >
        {/* Top wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50" />

        <div className="flex-1 bg-surface px-4 sm:px-8 py-6 flex flex-col max-w-[1600px] mx-auto w-full">
          {/* Level badge */}
          <div className="flex justify-center mb-8">
            <div className="bg-surface-container-lowest px-8 py-3 rounded-full border-2 border-primary/30 shadow-[0_0_20px_rgba(233,196,0,0.1)]">
              <span className="text-sm font-black text-primary tracking-[0.2em] uppercase">
                NIVEL {userLevel}
              </span>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center gap-12">
            {/* Daily mission header */}
            <header className="flex flex-col md:flex-row justify-between items-center w-full px-8 py-10 bg-surface-container-highest rounded-xl shadow-card-lg relative overflow-hidden">
              <div className="absolute top-3 left-8">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
                  Misiones diarias
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-6 mt-4 md:mt-0 w-full md:w-auto">
                <button className="p-2 hover:bg-surface-variant/30 rounded-full transition-colors text-outline">
                  <span className="material-symbols-outlined text-2xl">chevron_left</span>
                </button>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center md:items-start">
                    <div className="flex items-center gap-3">
                      <h1 className="text-xl md:text-2xl font-headline font-semibold tracking-wide text-on-surface">
                        {currentMission.title}
                      </h1>
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                        +{currentMission.xp} XP
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-primary/80">
                      <span className="material-symbols-outlined text-xl">{currentMission.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {currentMission.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 mt-8 md:mt-0">
                <button className="px-8 py-3 bg-secondary text-on-secondary-fixed font-bold rounded-lg shadow-lg shadow-secondary/10 hover:brightness-110 transition-all active:scale-95 uppercase text-xs tracking-widest">
                  COMPLETAR
                </button>
                <button className="p-4 bg-surface-variant/30 rounded-full hover:bg-surface-variant/50 transition-all active:scale-90 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary">chevron_right</span>
                </button>
              </div>
            </header>

            {/* Mission cards carousel */}
            <div className="relative group flex items-center">
              <button
                onClick={() => slide("left")}
                disabled={!canLeft}
                className="absolute -left-4 md:-left-12 z-30 p-4 bg-surface-container-highest border border-primary/20 rounded-full text-primary shadow-xl hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-3xl">chevron_left</span>
              </button>

              <div
                ref={carouselRef}
                className="flex-1 flex gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory px-2 py-4"
              >
                {missions.map((m) => {
                  const slug = m.module
                    .toLowerCase()
                    .replace(/ & /g, "-")
                    .replace(/ /g, "-")
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                  return (
                  <Link
                    key={m.module}
                    href={`/misiones/${slug}`}
                    className="min-w-full sm:min-w-[calc(50%-12px)] lg:min-w-[calc(33.33%-16px)] xl:min-w-[calc(25%-18px)] snap-start rounded-xl bg-surface-container-highest p-1 transition-all duration-300 hover:scale-[1.02] block"
                  >
                    <div className="h-full w-full rounded-lg bg-surface-bright p-6 md:p-8 flex flex-col items-center text-center glossy-card">
                      <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-6 md:mb-8">
                        {m.module}
                      </p>
                      <div className={`mb-6 md:mb-8 ${ACCENT_TEXT[m.accentColor]}`}>
                        <span
                          className="material-symbols-outlined !text-5xl md:!text-6xl"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          {m.icon}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-on-surface mb-auto px-2">
                        {m.task}
                      </h3>
                      <div className="w-full mt-6 md:mt-8 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-outline uppercase">PROGRESO</span>
                          <span className="text-[10px] font-bold text-primary">{m.progressLabel}</span>
                        </div>
                        <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${m.progress}%` }}
                          />
                        </div>
                      </div>
                      {m.status === "COMPLETADO" ? (
                        <button className="w-full min-h-[52px] bg-secondary text-on-secondary-fixed font-bold py-3 rounded-md shadow-lg shadow-secondary/20 hover:opacity-90 transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest">
                          COMPLETADO
                        </button>
                      ) : (
                        <button className="w-full min-h-[52px] bg-primary text-on-primary font-bold py-3 rounded-md transition-all active:scale-[0.98] uppercase text-[10px] tracking-widest">
                          PENDIENTE
                        </button>
                      )}
                    </div>
                  </Link>
                  )
                })}
              </div>

              <button
                onClick={() => slide("right")}
                disabled={!canRight}
                className="absolute -right-4 md:-right-12 z-30 p-4 bg-surface-container-highest border border-primary/20 rounded-full text-primary shadow-xl hover:bg-primary hover:text-on-primary transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0 disabled:pointer-events-none"
              >
                <span className="material-symbols-outlined text-3xl">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50" />
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-highest rounded-t-xl z-50 px-4 md:px-12 py-4 flex justify-between items-center xl:hidden border-t border-outline-variant">
        {MOBILE_NAV.map((item) => (
          <button
            key={item.label}
            className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-colors active:text-on-surface ${
              item.active ? "text-primary scale-110" : "text-outline"
            }`}
          >
            <span
              className="material-symbols-outlined !text-2xl md:!text-3xl"
              style={item.filled ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight">
              {item.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}
