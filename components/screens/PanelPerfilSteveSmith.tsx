"use client"

import { useState } from "react"
import Link from "next/link"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { useUser } from "@clerk/nextjs"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserAttributeData {
  value: number
  attribute: { label: string; color: string; side: string }
}

interface UserData {
  clerkUserId: string
  name: string
  title: string | null
  avatarUrl: string | null
  level: number
  xp: number
  xpToNextLevel: number
  trophies: number
  kredits: number
  attributes: UserAttributeData[]
}

interface ApprovalScores {
  logica: number | null
  creatividad: number | null
  liderazgo: number | null
  negociacion: number | null
  estrategia: number | null
  analisis: number | null
  comunicacion: number | null
  adaptabilidad: number | null
}

interface ProjectObjective {
  title: string
  icon: string
  xpReward: number
  status: string
}

interface CompletedProject {
  id: string
  missionId: string
  title: string
  icon: string
  module: string
  accentColor: "primary" | "tertiary" | "secondary" | "on-tertiary-container"
  xpReward: number
  completedAt: string | null
  isArchived?: boolean
  approval: {
    note: string | null
    approverName: string
    reviewedAt: string | null
    scores: ApprovalScores
  } | null
  objectives: ProjectObjective[]
}

interface PendingReviewProject {
  id: string
  title: string
  icon: string
  module: string
  accentColor: "primary" | "tertiary" | "secondary" | "on-tertiary-container"
}

interface PanelPerfilProps {
  user: UserData
  completedProjects: CompletedProject[]
  pendingReview: PendingReviewProject[]
}

// ---------------------------------------------------------------------------
// Color maps
// ---------------------------------------------------------------------------

const SKILL_TEXT: Record<string, string> = {
  primary: "text-primary",
  tertiary: "text-tertiary",
  secondary: "text-secondary",
  "on-tertiary-container": "text-on-tertiary-container",
}

const SKILL_BAR: Record<string, string> = {
  primary: "bg-primary shadow-[0_0_10px_rgba(233,196,0,0.5)]",
  tertiary: "bg-tertiary shadow-[0_0_10px_rgba(158,202,255,0.5)]",
  secondary: "bg-secondary shadow-[0_0_10px_rgba(120,220,119,0.5)]",
  "on-tertiary-container": "bg-on-tertiary-container shadow-[0_0_10px_rgba(52,160,254,0.5)]",
}

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-primary",
  tertiary: "border-tertiary",
  secondary: "border-secondary",
  "on-tertiary-container": "border-on-tertiary-container",
}

const ACCENT_ICON_BG: Record<string, string> = {
  primary: "bg-primary-container text-primary",
  tertiary: "bg-tertiary-container text-tertiary",
  secondary: "bg-secondary-container/20 text-secondary",
  "on-tertiary-container": "bg-on-tertiary-container/20 text-on-tertiary-container",
}

const SCORE_LABELS: { key: keyof ApprovalScores; label: string; color: string }[] = [
  { key: "logica", label: "Lógica", color: "primary" },
  { key: "creatividad", label: "Creatividad", color: "tertiary" },
  { key: "liderazgo", label: "Liderazgo", color: "secondary" },
  { key: "negociacion", label: "Negociación", color: "on-tertiary-container" },
  { key: "estrategia", label: "Estrategia", color: "primary" },
  { key: "analisis", label: "Análisis", color: "tertiary" },
  { key: "comunicacion", label: "Comunicación", color: "secondary" },
  { key: "adaptabilidad", label: "Adaptabilidad", color: "on-tertiary-container" },
]

// ---------------------------------------------------------------------------
// ProjectCard expandable
// ---------------------------------------------------------------------------

function ProjectCard({ project }: { project: CompletedProject }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl bg-surface-container-highest p-1 transition-all ${expanded ? "shadow-[0px_20px_40px_rgba(0,0,0,0.4)]" : ""}`}>
      <div className="rounded-lg bg-surface-bright border border-outline-variant/10 overflow-hidden">
        {/* Header — always visible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center gap-4 p-5 text-left hover:bg-surface-container-high/30 transition-colors"
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ACCENT_ICON_BG[project.accentColor]}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{project.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="text-sm font-bold text-on-surface truncate">{project.title}</div>
              {project.isArchived && (
                <span className="text-[9px] font-bold uppercase tracking-widest bg-outline/20 text-outline px-1.5 py-0.5 rounded-full flex-shrink-0">
                  Archivado
                </span>
              )}
            </div>
            <div className="text-[9px] text-outline uppercase tracking-wider">{project.module}</div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-bold text-secondary">+{project.xpReward.toLocaleString()} XP</span>
            <span className={`material-symbols-outlined text-outline transition-transform ${expanded ? "rotate-180" : ""}`}>
              expand_more
            </span>
          </div>
        </button>

        {/* Expanded content */}
        {expanded && (
          <div className="px-5 pb-5 space-y-5 border-t border-outline-variant/10">
            {/* Approval info */}
            {project.approval && (
              <div className="mt-4 p-4 bg-surface-container-lowest rounded-lg space-y-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">Aprobado</span>
                  <span className="text-[10px] text-outline">por {project.approval.approverName}</span>
                </div>

                {/* Note */}
                {project.approval.note && (
                  <div className="p-3 bg-surface-container-high rounded-lg">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1">Nota del revisor</div>
                    <p className="text-sm text-on-surface whitespace-pre-line">{project.approval.note}</p>
                  </div>
                )}

                {/* Scores */}
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-outline mb-3">Valoración de atributos</div>
                  <div className="grid grid-cols-2 gap-2">
                    {SCORE_LABELS.map(({ key, label, color }) => {
                      const score = project.approval!.scores[key]
                      if (score == null) return null
                      return (
                        <div key={key} className="flex items-center justify-between p-2 bg-surface-container-high rounded">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{label}</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <div
                                key={n}
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                  n <= score
                                    ? "bg-secondary text-on-secondary"
                                    : "bg-surface-container-lowest text-outline/40"
                                }`}
                              >
                                {n}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Objectives */}
            {project.objectives.length > 0 && (
              <div>
                <div className="text-[9px] font-bold uppercase tracking-widest text-outline mb-3">Misiones del proyecto</div>
                <div className="space-y-1.5">
                  {project.objectives.map((obj, i) => (
                    <div key={i} className="flex items-center gap-3 p-2.5 bg-surface-container-lowest rounded-lg">
                      <span className={`material-symbols-outlined text-base ${obj.status === "COMPLETED" ? "text-secondary" : "text-outline"}`}
                        style={obj.status === "COMPLETED" ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {obj.status === "COMPLETED" ? "check_circle" : obj.icon}
                      </span>
                      <span className={`text-xs flex-1 ${obj.status === "COMPLETED" ? "text-on-surface" : "text-outline"}`}>{obj.title}</span>
                      <span className="text-[9px] font-bold text-primary">+{obj.xpReward} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function PanelPerfilSteveSmith({ user, completedProjects, pendingReview }: PanelPerfilProps) {
  const { user: clerkUser } = useUser()

  const leftAttrs = user.attributes.filter((a) => a.attribute.side === "left")
  const rightAttrs = user.attributes.filter((a) => a.attribute.side === "right")
  const progressPercent = user.xpToNextLevel > 0 ? Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100)) : 0
  const dashOffset = 283 - (283 * progressPercent) / 100

  const headerUser = { name: user.name, level: user.level, title: user.title || "", avatarUrl: user.avatarUrl }

  return (
    <SidebarLayout user={headerUser}>
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />

        <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto w-full space-y-12 overflow-y-auto overflow-x-hidden">

          {/* ── Profile Section ── */}
          <section className="relative">
            <div className="grid grid-cols-12 gap-8 items-center">
              {/* Left attributes */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {leftAttrs.map(({ value, attribute: attr }) => (
                  <div key={attr.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {attr.label}
                      <span className={SKILL_TEXT[attr.color] || "text-on-surface"}>{value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                      <div className={`h-full rounded-full ${SKILL_BAR[attr.color] || "bg-on-surface"}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Center: level + avatar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center space-y-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                  <div className="w-32 h-32 rounded-full wood-bezel flex items-center justify-center relative z-10 border border-primary/30 glow-gold">
                    <div className="text-center">
                      <div className="text-primary font-headline font-extrabold text-2xl tracking-tighter">NIVEL</div>
                      <div className="text-on-surface font-headline font-black text-4xl leading-tight">{user.level}</div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-48 h-48 rounded-full p-3 wood-bezel">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-outline-variant/30 shadow-2xl">
                      {(clerkUser?.imageUrl ?? user.avatarUrl) ? (
                        <img alt={user.name} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src={clerkUser?.imageUrl ?? user.avatarUrl ?? ""} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                          <span className="material-symbols-outlined text-6xl text-outline">person</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined">verified</span>
                  </div>
                </div>

                <div className="text-center">
                  <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface uppercase">{user.name}</h1>
                  <p className="text-primary font-body font-medium tracking-[0.2em] text-xs mt-2 uppercase">{user.title || "Agente"}</p>
                </div>
              </div>

              {/* Right attributes */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {rightAttrs.map(({ value, attribute: attr }) => (
                  <div key={attr.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {attr.label}
                      <span className={SKILL_TEXT[attr.color] || "text-on-surface"}>{value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                      <div className={`h-full rounded-full ${SKILL_BAR[attr.color] || "bg-on-surface"}`} style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Projects & Progress ── */}
          <section className="grid grid-cols-12 gap-6">

            {/* Projects column (8 cols) */}
            <div className="col-span-12 md:col-span-8 space-y-6">
              {/* Pending review */}
              {pendingReview.length > 0 && (
                <div className="bg-surface-container-highest p-1 rounded-xl">
                  <div className="bg-surface-bright rounded-lg p-6 border border-primary/20">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-primary">hourglass_top</span>
                      <h3 className="text-lg font-headline font-bold text-on-surface">Pendientes de Revisión</h3>
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold">{pendingReview.length}</span>
                    </div>
                    <div className="space-y-2">
                      {pendingReview.map((p) => (
                        <div key={p.id} className={`flex items-center gap-3 p-3 bg-surface-container-lowest rounded-lg border-l-4 ${ACCENT_BORDER[p.accentColor]}`}>
                          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{p.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-on-surface">{p.title}</div>
                            <div className="text-[9px] text-outline uppercase tracking-wider">{p.module}</div>
                          </div>
                          <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">En revisión</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Completed projects */}
              <div>
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-on-surface">Proyectos Completados</h3>
                    <p className="text-outline text-[10px] uppercase tracking-widest mt-1">Historial con valoraciones</p>
                  </div>
                  <Link href="/misiones" className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-[10px] uppercase tracking-tighter">
                    Ver Todos
                  </Link>
                </div>

                {completedProjects.length > 0 ? (
                  <div className="space-y-3">
                    {completedProjects.map((p) => (
                      <ProjectCard key={p.id} project={p} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl bg-surface-container-highest p-1">
                    <div className="rounded-lg bg-surface-bright p-12 text-center border border-outline-variant/10">
                      <span className="material-symbols-outlined text-5xl text-outline/40 mb-4 block">explore</span>
                      <p className="text-on-surface font-headline font-bold text-lg">Sin proyectos completados</p>
                      <p className="text-outline text-[10px] uppercase tracking-widest mt-2">Completa misiones para ver tus logros aquí</p>
                      <Link href="/misiones" className="mt-6 inline-block px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-on-primary transition-all font-headline font-bold text-xs uppercase tracking-tighter">
                        Explorar Misiones
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rank Progress (4 cols) */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-highest p-1 rounded-xl shadow-2xl h-fit">
              <div className="bg-surface-bright rounded-lg p-8 flex flex-col justify-between border border-outline-variant/10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Progreso de Rango</h3>
                  <p className="text-outline text-[10px] uppercase tracking-widest mb-6">Hacia Nivel {user.level + 1}</p>

                  <div className="relative w-full aspect-square flex items-center justify-center mb-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle className="text-surface-container-lowest" cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" />
                      <circle className="text-primary" cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray="283" strokeDashoffset={dashOffset} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-headline font-black text-on-surface">{progressPercent}%</span>
                      <span className="text-[0.6rem] text-outline uppercase tracking-[0.3em]">Hacia Nivel {user.level + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-primary font-black text-xl leading-none">{user.trophies}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Trofeos</div>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-secondary font-black text-xl leading-none">{user.kredits >= 1000 ? `${(user.kredits / 1000).toFixed(1)}k` : user.kredits}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Kredits</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
