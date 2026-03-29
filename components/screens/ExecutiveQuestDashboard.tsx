"use client"

import SidebarLayout from "@/components/layout/SidebarLayout"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkillBar {
  label: string
  value: number
  color: "primary" | "tertiary" | "secondary" | "on-tertiary-container"
}

export interface RecentMission {
  icon: string
  title: string
  subtitle: string
  xp: number
  accentColor: "primary" | "tertiary" | "secondary" | "on-tertiary-container"
}

export interface ExecutiveQuestDashboardProps {
  userName?: string
  userTitle?: string
  userLevel?: number
  userAvatarUrl?: string | null
  rankProgress?: number
  rankNextLabel?: string
  trophies?: number
  kredits?: string
  skillsLeft?: SkillBar[]
  skillsRight?: SkillBar[]
  recentMissions?: RecentMission[]
}

// ---------------------------------------------------------------------------
// Defaults (matching the Stitch screen)
// ---------------------------------------------------------------------------

// No defaults — all data comes from the DB via props

// ---------------------------------------------------------------------------
// Skill color maps
// ---------------------------------------------------------------------------

const SKILL_TEXT: Record<SkillBar["color"], string> = {
  primary:                "text-primary",
  tertiary:               "text-tertiary",
  secondary:              "text-secondary",
  "on-tertiary-container":"text-on-tertiary-container",
}

const SKILL_BAR: Record<SkillBar["color"], string> = {
  primary:                "bg-primary shadow-[0_0_10px_rgba(233,196,0,0.5)]",
  tertiary:               "bg-tertiary shadow-[0_0_10px_rgba(158,202,255,0.5)]",
  secondary:              "bg-secondary shadow-[0_0_10px_rgba(120,220,119,0.5)]",
  "on-tertiary-container":"bg-on-tertiary-container shadow-[0_0_10px_rgba(52,160,254,0.5)]",
}

const MISSION_BORDER: Record<RecentMission["accentColor"], string> = {
  primary:                "border-primary",
  tertiary:               "border-tertiary",
  secondary:              "border-secondary",
  "on-tertiary-container":"border-on-tertiary-container",
}

const MISSION_ICON_BG: Record<RecentMission["accentColor"], string> = {
  primary:                "bg-primary-container text-primary",
  tertiary:               "bg-tertiary-container text-tertiary",
  secondary:              "bg-secondary-container/20 text-secondary",
  "on-tertiary-container":"bg-tertiary-container/30 text-on-tertiary-container",
}

// Circumference for r=45%: 2π × 0.45 × 100 ≈ 282.7
const RING_CIRCUMFERENCE = 283

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ExecutiveQuestDashboard({
  userName = "",
  userTitle = "",
  userLevel = 1,
  userAvatarUrl,
  rankProgress = 0,
  rankNextLabel = "Siguiente Nivel",
  trophies = 0,
  kredits = "0",
  skillsLeft = [],
  skillsRight = [],
  recentMissions = [],
}: ExecutiveQuestDashboardProps) {
  const dashOffset = Math.round(RING_CIRCUMFERENCE * (1 - rankProgress / 100))

  const headerUser = { name: userName, level: userLevel, title: userTitle, avatarUrl: userAvatarUrl }

  return (
    <SidebarLayout user={headerUser}>
      <div className="flex-1 flex flex-col w-full relative">
        {/* Top wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />

        <div className="flex-1 px-8 md:px-12 py-12 max-w-6xl mx-auto w-full space-y-12 overflow-y-auto">

          {/* ── Central Profile Section ── */}
          <section>
            <div className="grid grid-cols-12 gap-8 items-center">

              {/* Left skill bars */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {skillsLeft.map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {s.label}
                      <span className={SKILL_TEXT[s.color]}>{s.value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div
                        className={`h-full rounded-full ${SKILL_BAR[s.color]}`}
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Center: level badge + avatar */}
              <div className="col-span-12 lg:col-span-4 flex flex-col items-center justify-center space-y-8">
                {/* Level badge */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-primary opacity-20 blur-2xl group-hover:opacity-40 transition-opacity" />
                  <div className="w-32 h-32 rounded-full wood-bezel flex items-center justify-center relative z-10 border border-primary/30 shadow-[0_0_25px_rgba(233,196,0,0.3)]">
                    <div className="text-center">
                      <div className="text-primary font-headline font-extrabold text-2xl tracking-tighter">NIVEL</div>
                      <div className="text-on-surface font-headline font-black text-4xl leading-tight">{userLevel}</div>
                    </div>
                  </div>
                </div>

                {/* Avatar */}
                <div className="relative">
                  <div className="w-56 h-56 rounded-full p-3 wood-bezel">
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-outline-variant/30 shadow-2xl">
                      {userAvatarUrl ? (
                        <img
                          alt={`${userName} Portrait`}
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          src={userAvatarUrl}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-surface-container-high">
                          <span className="material-symbols-outlined text-7xl text-outline">person</span>
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
                  <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface uppercase">
                    {userName}
                  </h1>
                  <p className="text-primary font-body font-medium tracking-[0.2em] text-xs mt-2 uppercase">
                    {userTitle}
                  </p>
                </div>
              </div>

              {/* Right skill bars */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {skillsRight.map((s) => (
                  <div key={s.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {s.label}
                      <span className={SKILL_TEXT[s.color]}>{s.value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden flex gap-1 p-0.5">
                      <div
                        className={`h-full rounded-full ${SKILL_BAR[s.color]}`}
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Experience & Achievements Grid ── */}
          <section className="grid grid-cols-12 gap-6">

            {/* Recent missions card */}
            <div className="col-span-12 md:col-span-8 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <div className="bg-surface-bright rounded-lg h-full p-8 border border-outline-variant/10">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-on-surface">Misiones Recientes</h3>
                    <p className="text-outline text-[10px] uppercase tracking-widest mt-1">Historial Operativo</p>
                  </div>
                  <Link
                    href="/misiones"
                    className="px-6 py-2 bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary hover:text-on-primary transition-all duration-300 font-headline font-bold text-xs uppercase tracking-tighter"
                  >
                    Ver Todas
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentMissions.length > 0 ? recentMissions.map((m) => (
                    <div
                      key={m.title}
                      className={`flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg hover:bg-surface-container-high transition-colors cursor-pointer border-l-4 ${MISSION_BORDER[m.accentColor]}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${MISSION_ICON_BG[m.accentColor]}`}>
                          <span className="material-symbols-outlined">{m.icon}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface">{m.title}</div>
                          <div className="text-[0.65rem] text-outline uppercase tracking-wider">{m.subtitle}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-secondary font-bold text-sm">+{m.xp.toLocaleString()} XP</div>
                        <div className="text-[0.6rem] text-outline uppercase">Completado</div>
                      </div>
                    </div>
                  )) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <span className="material-symbols-outlined text-4xl text-outline/40 mb-3">military_tech</span>
                      <p className="text-outline text-sm">Aún no has completado misiones</p>
                      <Link href="/misiones" className="text-primary text-xs mt-2 hover:underline">Explorar Misiones</Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Rank progress card */}
            <div className="col-span-12 md:col-span-4 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
              <div className="bg-surface-bright rounded-lg h-full p-8 flex flex-col justify-between border border-outline-variant/10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Progreso de Rango</h3>
                  <p className="text-outline text-[10px] uppercase tracking-widest mb-6">
                    Próximo: {rankNextLabel}
                  </p>

                  {/* Circular progress ring */}
                  <div className="relative w-full aspect-square flex items-center justify-center mb-8">
                    <svg className="w-full h-full -rotate-90">
                      <circle
                        className="text-surface-container-lowest"
                        cx="50%" cy="50%"
                        r="45%"
                        fill="transparent"
                        stroke="currentColor"
                        strokeWidth="8"
                      />
                      <circle
                        className="text-primary"
                        cx="50%" cy="50%"
                        r="45%"
                        fill="transparent"
                        stroke="currentColor"
                        strokeDasharray={RING_CIRCUMFERENCE}
                        strokeDashoffset={dashOffset}
                        strokeWidth="8"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-headline font-black text-on-surface">{rankProgress}%</span>
                      <span className="text-[0.6rem] text-outline uppercase tracking-[0.3em]">
                        Hacia Nivel {userLevel + 1}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-primary font-black text-xl leading-none">{trophies}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Trofeos</div>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-secondary font-black text-xl leading-none">{kredits}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Kredits</div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>

        {/* Bottom wood bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
