"use client"

import Link from "next/link"
import SidebarLayout from "@/components/layout/SidebarLayout"

// ---------------------------------------------------------------------------
// Types & data
// ---------------------------------------------------------------------------

interface ObjectiveItem {
  status: "COMPLETADA" | "EN PROGRESO" | "BLOQUEADA"
  xp: string
  icon: string
  title: string
}

interface RewardItem {
  icon: string
  label: string
  value: string
  iconColor: string
  iconBg: string
  valueColor: string
}

const MODULE_META: Record<string, { name: string; accent: string; accentBg: string; accentText: string }> = {
  "ventas-leads": {
    name:        "Ventas & Leads",
    accent:      "secondary",
    accentBg:    "bg-secondary-container/30 border-secondary/20 text-secondary-fixed",
    accentText:  "text-secondary",
  },
  "proyectos-cronograma": {
    name:       "Proyectos & Cronograma",
    accent:     "tertiary",
    accentBg:   "bg-tertiary-container/30 border-tertiary/20 text-tertiary-fixed",
    accentText: "text-tertiary",
  },
  "alianzas-contratos": {
    name:       "Alianzas & Contratos",
    accent:     "primary",
    accentBg:   "bg-primary-container/30 border-primary/20 text-primary-fixed",
    accentText: "text-primary",
  },
  "informes-cumplimiento": {
    name:       "Informes & Cumplimiento",
    accent:     "on-tertiary-container",
    accentBg:   "bg-tertiary-container/20 border-on-tertiary-container/20 text-on-tertiary-container",
    accentText: "text-on-tertiary-container",
  },
}

const OBJECTIVES: ObjectiveItem[] = [
  { status: "COMPLETADA",  xp: "+500 XP",  icon: "person_add",     title: "Contactar a 10 nuevos clientes potenciales"    },
  { status: "EN PROGRESO", xp: "+1000 XP", icon: "calendar_today", title: "Agendar una demo con una cuenta estratégica"    },
  { status: "BLOQUEADA",   xp: "+1500 XP", icon: "lock",           title: "Cerrar acuerdo con cliente nivel A"             },
]

const REWARDS: RewardItem[] = [
  { icon: "military_tech",        label: "Puntos de Experiencia", value: "3,000 XP",  iconColor: "text-primary",   iconBg: "bg-primary/20",   valueColor: "text-primary"   },
  { icon: "account_balance_wallet", label: "Comisión Bonus",     value: "+15%",       iconColor: "text-secondary", iconBg: "bg-secondary/20", valueColor: "text-secondary" },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ObjectiveCard({ obj }: { obj: ObjectiveItem }) {
  if (obj.status === "COMPLETADA") {
    return (
      <div className="group relative bg-surface-container-low border border-transparent hover:border-secondary/20 p-6 rounded-xl transition-all flex items-center gap-6 overflow-hidden">
        <div className="absolute top-0 right-0 p-2 opacity-5">
          <span className="material-symbols-outlined text-[120px]">check_circle</span>
        </div>
        <div className="w-14 h-14 bg-secondary-container/20 rounded-xl flex items-center justify-center border border-secondary/20 flex-shrink-0">
          <span className="material-symbols-outlined text-secondary text-3xl">{obj.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">COMPLETADA</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{obj.xp}</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface">{obj.title}</h3>
        </div>
        <span className="material-symbols-outlined text-secondary flex-shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
      </div>
    )
  }

  if (obj.status === "EN PROGRESO") {
    return (
      <div className="group bg-surface-bright p-6 rounded-xl shadow-xl flex items-center gap-6 border border-secondary/40">
        <div className="w-14 h-14 bg-secondary-container/40 rounded-xl flex items-center justify-center border border-secondary/50 animate-pulse flex-shrink-0">
          <span className="material-symbols-outlined text-secondary text-3xl">{obj.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-tertiary uppercase tracking-widest">EN PROGRESO</span>
            <span className="w-1 h-1 bg-outline-variant rounded-full" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{obj.xp}</span>
          </div>
          <h3 className="font-headline font-bold text-lg text-on-surface">{obj.title}</h3>
        </div>
        <span className="material-symbols-outlined text-outline flex-shrink-0" style={{ animationDuration: "3s", animation: "spin 3s linear infinite" }}>sync</span>
      </div>
    )
  }

  // BLOQUEADA
  return (
    <div className="group bg-surface-container-lowest p-6 rounded-xl flex items-center gap-6 opacity-60 grayscale">
      <div className="w-14 h-14 bg-surface-container-highest rounded-xl flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-outline text-3xl">lock</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1 flex-wrap">
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">BLOQUEADA</span>
          <span className="w-1 h-1 bg-outline-variant rounded-full" />
          <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{obj.xp}</span>
        </div>
        <h3 className="font-headline font-bold text-lg text-outline">{obj.title}</h3>
      </div>
      <span className="material-symbols-outlined text-outline-variant flex-shrink-0">lock_open</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

interface DetallesMisionProps {
  moduleSlug?: string
}

export default function DetallesMision({ moduleSlug = "ventas-leads" }: DetallesMisionProps) {
  const meta = MODULE_META[moduleSlug] ?? MODULE_META["ventas-leads"]

  return (
    <SidebarLayout>
      <div className="bg-surface font-body text-on-surface min-h-screen flex flex-col w-full relative">
        <main className="flex-1 p-4 md:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto">

          {/* Breadcrumb & Back */}
          <div className="mb-10 flex justify-between items-center flex-wrap gap-4">
            <Link
              href="/misiones"
              className="group flex items-center gap-3 px-6 py-3 wood-bezel rounded-xl border border-outline-variant/10 hover:border-secondary/30 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-secondary">arrow_back</span>
              <span className="font-headline font-extrabold text-xs uppercase tracking-[0.2em] text-on-surface">Back to Command</span>
            </Link>
            <div className="flex gap-2 flex-wrap">
              <span className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full tracking-widest border ${meta.accentBg}`}>
                Active Mission
              </span>
              <span className="px-3 py-1 bg-surface-container-highest text-outline text-[10px] font-bold uppercase rounded-full tracking-widest border border-outline/10">
                Priority A
              </span>
            </div>
          </div>

          {/* Title */}
          <div className="mb-12 relative">
            <h1 className="font-headline font-black text-4xl md:text-5xl lg:text-6xl text-on-surface leading-tight tracking-tighter uppercase max-w-3xl">
              Detalles de la Misión:{" "}
              <span className={meta.accentText}>{meta.name.toUpperCase()}</span>
            </h1>
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* Left column — 7 cols */}
            <div className="lg:col-span-7 space-y-8">
              {/* Progress Module */}
              <section className="p-1 bg-surface-container-highest rounded-xl shadow-2xl">
                <div className="bg-surface-bright rounded-lg p-8">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline mb-1">Status Actual</p>
                      <h3 className="font-headline font-extrabold text-2xl text-on-surface">En curso operativo</h3>
                    </div>
                    <div className="text-right">
                      <span className={`text-4xl font-headline font-black ${meta.accentText}`}>33%</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-6 w-full bg-surface-container-high rounded-full overflow-hidden p-1">
                    <div
                      className="h-full bg-secondary rounded-full shadow-[0_0_20px_rgba(120,220,119,0.4)]"
                      style={{ width: "33%" }}
                    />
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-outline-variant">
                    <span>Inicio de Ciclo</span>
                    <span>Objetivo Trimestral</span>
                  </div>
                </div>
              </section>

              {/* Objectives */}
              <div className="space-y-4">
                <h4 className="font-headline font-extrabold text-sm uppercase tracking-widest text-outline ml-2">
                  Objetivos de Campo
                </h4>
                {OBJECTIVES.map((obj, i) => (
                  <ObjectiveCard key={i} obj={obj} />
                ))}
              </div>
            </div>

            {/* Right column — 5 cols */}
            <div className="lg:col-span-5 space-y-8">
              {/* Rewards */}
              <div className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
                <h4 className="font-headline font-black text-xl mb-6 uppercase tracking-tight text-on-surface">
                  Recompensas de Misión
                </h4>
                <div className="space-y-6">
                  {REWARDS.map((r) => (
                    <div key={r.label} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full ${r.iconBg} flex items-center justify-center`}>
                          <span className={`material-symbols-outlined ${r.iconColor}`}>{r.icon}</span>
                        </div>
                        <span className="text-sm font-bold text-on-surface">{r.label}</span>
                      </div>
                      <span className={`text-lg font-headline font-black ${r.valueColor}`}>{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Decorative image */}
              <div className="relative overflow-hidden rounded-xl h-64 shadow-2xl group">
                <img
                  alt="Professional meeting environment"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXwhykxIFX_PPPzlaCo7e5UFBwTfvmxduK8rvRTfXAx7oHbnWMWh6Ebac_DbUIcVYW_mscPIDcULtr6zk270dkxR0hHOHXKu7rmKch582nC7eNvF9WlyOY8ZVHd0Jzp_4fn3G7QvoBLaGXLDxIUjkfhjX9d3uooJP3GxIEZW_4tN8HZWJ7XWuPwsyjX3ePsGENDWGjZMqR0W_4G32Zf9Y2Rc0xf9dAqjlrTkBFzgKd5FLbgCdTwx5w_Utl04_2QBjWhXQiIcSqG8c"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-80" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className={`text-[10px] font-bold ${meta.accentText} uppercase tracking-[0.4em] mb-2`}>Contexto Estratégico</p>
                  <p className="text-sm text-on-surface font-medium leading-relaxed italic">
                    &ldquo;La excelencia no es un acto, sino un hábito de ventas.&rdquo;
                  </p>
                </div>
              </div>

              {/* Quick action */}
              <div className="p-6 wood-bezel rounded-xl flex flex-col gap-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-outline">Próximo Paso Recomendado</h4>
                <p className="text-sm font-medium text-on-surface leading-snug">
                  Preparar el reporte de la demo agendada para validación ejecutiva.
                </p>
                <button className="mt-2 w-full py-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-black text-xs uppercase tracking-[0.2em] rounded-md shadow-lg active:scale-95 transition-all">
                  EJECUTAR ACCIÓN
                </button>
              </div>
            </div>
            </div>
          </div>
        </main>
      </div>
    </SidebarLayout>
  )
}
