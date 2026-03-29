"use client"

import Link from "next/link"
import SidebarLayout from "@/components/layout/SidebarLayout"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UserAttributeData {
  value: number
  attribute: {
    label: string
    color: string
    side: string
  }
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

interface RecentMissionData {
  title: string
  subtitle: string
  xp: number
  icon: string
  accentColor: "primary" | "tertiary" | "secondary" | "on-tertiary-container"
}

interface PanelPerfilProps {
  user: UserData
  recentMissions: RecentMissionData[]
}

// ---------------------------------------------------------------------------
// Token-based color mappings
// ---------------------------------------------------------------------------

const SKILL_TEXT: Record<string, string> = {
  primary:                 "text-primary",
  tertiary:                "text-tertiary",
  secondary:               "text-secondary",
  "on-tertiary-container": "text-on-tertiary-container",
}

const SKILL_BAR: Record<string, string> = {
  primary:                 "bg-primary shadow-[0_0_10px_rgba(233,196,0,0.5)]",
  tertiary:                "bg-tertiary shadow-[0_0_10px_rgba(158,202,255,0.5)]",
  secondary:               "bg-secondary shadow-[0_0_10px_rgba(120,220,119,0.5)]",
  "on-tertiary-container": "bg-on-tertiary-container shadow-[0_0_10px_rgba(52,160,254,0.5)]",
}

const ACCENT_BORDER: Record<string, string> = {
  primary:                 "border-primary",
  tertiary:                "border-tertiary",
  secondary:               "border-secondary",
  "on-tertiary-container": "border-on-tertiary-container",
}

const ACCENT_ICON_BG: Record<string, string> = {
  primary:                 "bg-primary-container text-primary",
  tertiary:                "bg-tertiary-container text-tertiary",
  secondary:               "bg-secondary-container/20 text-secondary",
  "on-tertiary-container": "bg-on-tertiary-container/20 text-on-tertiary-container",
}

const ACCENT_XP_TEXT: Record<string, string> = {
  primary:                 "text-primary",
  tertiary:                "text-tertiary",
  secondary:               "text-secondary",
  "on-tertiary-container": "text-on-tertiary-container",
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PanelPerfilSteveSmith({ user, recentMissions }: PanelPerfilProps) {
  // Map user dynamic attributes
  const leftAttrs = user.attributes.filter(a => a.attribute.side === "left")
  const rightAttrs = user.attributes.filter(a => a.attribute.side === "right")

  // Progress logic
  const progressPercent = Math.round((user.xp / user.xpToNextLevel) * 100)
  const dashOffset = 283 - (283 * progressPercent) / 100

  const headerUser = {
    name: user.name,
    level: user.level,
    title: user.title || "",
    avatarUrl: user.avatarUrl,
  }

  return (
    <SidebarLayout user={headerUser}>
      <div className="flex-1 flex flex-col w-full relative">
        {/* Top bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />

        <div className="flex-1 px-4 md:px-8 lg:px-12 py-8 max-w-6xl mx-auto w-full space-y-12 overflow-y-auto overflow-x-hidden">
          {/* --- Central Profile Section --- */}
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
                      <div
                        className={`h-full rounded-full ${SKILL_BAR[attr.color] || "bg-on-surface"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Center: level badge + avatar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center space-y-8">
                {/* Level Badge */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                  <div className="w-32 h-32 rounded-full wood-bezel flex items-center justify-center relative z-10 border border-primary/30 glow-gold">
                    <div className="text-center">
                        <div className="text-primary font-headline font-extrabold text-2xl tracking-tighter">NIVEL</div>
                        <div className="text-on-surface font-headline font-black text-4xl leading-tight">{user.level}</div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full p-3 wood-bezel">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-outline-variant/30 shadow-2xl">
                        {user.avatarUrl ? (
                          <img
                            alt="Portrait"
                            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                            src={user.avatarUrl}
                          />
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

                  {/* Name + title */}
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
                      <div
                        className={`h-full rounded-full ${SKILL_BAR[attr.color] || "bg-on-surface"}`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- Experience & Progress Grid --- */}
          <section className="grid grid-cols-12 gap-6">
            {/* Recent Missions Card (8 cols) */}
            <div className="col-span-12 md:col-span-8 bg-surface-container-highest p-1 rounded-xl shadow-2xl">
              <div className="bg-surface-bright rounded-lg h-full p-8 border border-outline-variant/10">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-on-surface">Misiones Recientes</h3>
                    <p className="text-outline text-xs uppercase tracking-widest mt-1">Historial Operativo</p>
                  </div>
                  <Link
                    href="/misiones"
                    className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-xs uppercase tracking-tighter"
                  >
                    Ver Todas
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentMissions.length > 0 ? (
                    recentMissions.map((m) => (
                      <div
                        key={m.title}
                        className={`flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg cursor-pointer border-l-4 ${ACCENT_BORDER[m.accentColor] || "border-primary"} hover:bg-surface-container-high transition-colors`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-10 h-10 rounded flex items-center justify-center ${ACCENT_ICON_BG[m.accentColor] || "bg-primary-container text-primary"}`}>
                            <span className="material-symbols-outlined">{m.icon}</span>
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{m.title}</div>
                            <div className="text-[0.65rem] text-outline uppercase tracking-wider">{m.subtitle}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-bold text-sm ${ACCENT_XP_TEXT[m.accentColor] || "text-secondary"}`}>+{m.xp.toLocaleString()} XP</div>
                          <div className="text-[0.6rem] text-outline uppercase">Completado</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <span className="material-symbols-outlined text-5xl text-outline/40 mb-4">explore</span>
                      <p className="text-on-surface font-headline font-bold text-lg">Sin misiones completadas</p>
                      <p className="text-outline text-xs uppercase tracking-widest mt-2">Acepta una mision para comenzar tu aventura</p>
                      <Link
                        href="/misiones"
                        className="mt-6 px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-xs uppercase tracking-tighter"
                      >
                        Explorar Misiones
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rank Progress Card (4 cols) */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-highest p-1 rounded-xl shadow-2xl">
              <div className="bg-surface-bright rounded-lg h-full p-8 flex flex-col justify-between border border-outline-variant/10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Progreso de Rango</h3>
                  <p className="text-outline text-xs uppercase tracking-widest mb-6">Hacia Nivel {user.level + 1}</p>

                  {/* Circular progress */}
                  <div className="relative w-full aspect-square flex items-center justify-center mb-8">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-surface-container-lowest"
                        cx="50" cy="50" r="45"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-primary"
                        cx="50" cy="50" r="45"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                        strokeDasharray="283"
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                      />
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
                    <div className="text-secondary font-black text-xl leading-none">{user.kredits ? (user.kredits / 1000).toFixed(1) + "k" : "0"}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Kredits</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
