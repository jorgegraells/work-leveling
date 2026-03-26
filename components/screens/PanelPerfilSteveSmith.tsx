"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { UserButton, SignOutButton } from "@clerk/nextjs"

// ---------------------------------------------------------------------------
// Types & Defaults
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
  level: number
  xp: number
  xpToNextLevel: number
  trophies: number
  kredits: number
  attributes: UserAttributeData[]
}

interface RecentMission {
  title: string
  category: string
  xp: string
  icon: string
  accent: string
  iconBg: string
}


const ATTR_GLOW: Record<string, string> = {
  "#FF3B30": "shadow-[0_0_10px_rgba(255,59,48,0.5)]", // red
  "#FF9500": "shadow-[0_0_10px_rgba(255,149,0,0.5)]", // orange
  "#4CD964": "shadow-[0_0_10px_rgba(76,217,100,0.5)]", // green
  "#5AC8FA": "shadow-[0_0_10px_rgba(90,200,250,0.5)]", // blue/tertiary
  "#007AFF": "shadow-[0_0_10px_rgba(0,122,255,0.5)]", // primary
  "#5856D6": "shadow-[0_0_10px_rgba(88,86,214,0.5)]", // purple
  "#FF2D55": "shadow-[0_0_10px_rgba(255,45,85,0.5)]", // pink
  "#E5E5EA": "shadow-[0_0_10px_rgba(229,229,234,0.5)]", // gray
}

const ATTR_VALUE_COLOR: Record<string, string> = {
  "bg-primary":               "text-primary",
  "bg-tertiary":              "text-tertiary",
  "bg-secondary":             "text-secondary",
  "bg-on-tertiary-container": "text-on-tertiary-container",
}

const RECENT_MISSIONS: RecentMission[] = [
  {
    title:    "Operación Horizonte Dorado",
    category: "Estrategia de Mercado A1",
    xp:       "+2,400 XP",
    icon:     "rocket_launch",
    accent:   "border-primary",
    iconBg:   "bg-primary-container text-primary",
  },
  {
    title:    "Sincronización de Nodos",
    category: "Análisis de Alianzas",
    xp:       "+1,150 XP",
    icon:     "hub",
    accent:   "border-tertiary",
    iconBg:   "bg-tertiary-container text-tertiary",
  },
  {
    title:    "Protocolo de Resiliencia",
    category: "Gestión de Riesgos",
    xp:       "+3,800 XP",
    icon:     "shield",
    accent:   "border-secondary",
    iconBg:   "bg-secondary-container/20 text-secondary",
  },
]

const SIDEBAR_NAV = [
  { icon: "person",        label: "Perfil",     href: "/perfil"   },
  { icon: "account_tree",  label: "Proyectos",  href: "#"         },
  { icon: "description",   label: "Informes",   href: "#"         },
  { icon: "insights",      label: "Estrategia", href: "#"         },
  { icon: "military_tech", label: "Misiones",   href: "/misiones" },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PanelPerfilSteveSmith({ user }: { user?: UserData }) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  // Map user dynamic attributes
  const leftAttrs = user?.attributes.filter(a => a.attribute.side === "LEFT") || []
  const rightAttrs = user?.attributes.filter(a => a.attribute.side === "RIGHT") || []

  // Progress logic
  const progressPercent = user ? Math.round((user.xp / user.xpToNextLevel) * 100) : 0
  const dashOffset = 283 - (283 * progressPercent) / 100

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden">
      {/* Sidebar toggle */}
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
        {/* Header */}
        <div className="mb-8 px-2 flex items-center gap-4 h-10">
          <div className="w-12 h-12 rounded-lg border border-primary/30 overflow-hidden shadow-lg flex-shrink-0">
            <img
              alt="Steve Smith Avatar"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWTPaWsIeWia-JKJSuCcDSh-LBqkHHtOXUtLQpn8Bg3SHeaKf9QrgFmQ1Yjv1Uvlu8wdkRSkzBi_HykCKAvUxhyMwaRUc0URBp-ALkv_uV_L3H4JpZEv8MhaiQJIwn8_zTfxy1xsK8658Av4uq57j2ZISzG9n3E3XvbwDjcTf13adXIcyht0y6f6ujfinv-6cib3inqcVxaCNh0MUKg1lMkfxN2rHcy-jUjb47mpoZ4mvs1l7IJTnYpO6Z5vcNfkN6RXAXJgv4euY"
            />
          </div>
          <div className="overflow-hidden">
            <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface truncate">{user?.name || "Steve Smith"}</h2>
            <p className="text-[10px] text-primary mt-1 truncate">Level {user?.level || 1} {user?.title?.split(" ")[0] || "Architect"}</p>
          </div>
        </div>

        {/* Nav */}
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

        {/* Footer */}
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
        className="min-h-screen relative flex flex-col sidebar-content-transition"
        style={{ marginLeft: collapsed ? 0 : 256 }}
      >
        {/* Top bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50" />

        <div className="flex-1 px-8 lg:px-12 py-12 max-w-6xl mx-auto w-full space-y-12">
          {/* --- Central Profile Section --- */}
          <section className="relative">
            <div className="grid grid-cols-12 gap-8 items-center">

              {/* Left attributes */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {leftAttrs.map(({ value, attribute: attr }) => (
                  <div key={attr.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {attr.label}
                      <span className={ATTR_VALUE_COLOR[attr.color] || "text-on-surface"}>{value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full ${attr.color} rounded-full`}
                        style={{ width: `${value}%`, boxShadow: ATTR_GLOW[attr.color] || "0 0 10px rgba(255,255,255,0.5)", backgroundColor: attr.color.startsWith('#') ? attr.color : undefined }}
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
                        <div className="text-on-surface font-headline font-black text-4xl leading-tight">{user?.level || 42}</div>
                      </div>
                    </div>
                  </div>

                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-48 h-48 rounded-full p-3 wood-bezel">
                      <div className="w-full h-full rounded-full overflow-hidden border-2 border-outline-variant/30 shadow-2xl">
                        <img
                          alt="User Portrait"
                          className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6afDuJK0tqLx-JlGI9-bGPaw5r2_dGo58ajvCyO3grdhUz6QWnclFutaGPSDdDSYI88KcJdnHy_hurugXmtejiLbUrzYF7B37G-2TJtLPVj0WMKe0qE3QCvl1UzRNqB1xgRgmlwY0wQf0WdNpVJs-zMO0gIX8YWoKoqcBl9-S3akG_WhYQPSpQIrvJrIlpvbS-SWF4REdoRcifz67v8xjA-Ci5zyOq3xQ5zqucdbf7PS752YIJqCVEAAxfeIt8PypIot8T3jUGso"
                        />
                      </div>
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary w-12 h-12 rounded-full flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined">verified</span>
                    </div>
                  </div>

                  {/* Name + title */}
                  <div className="text-center">
                    <h1 className="text-4xl font-headline font-black tracking-tight text-on-surface uppercase">{user?.name || "Steve Smith"}</h1>
                    <p className="text-primary font-body font-medium tracking-[0.2em] text-xs mt-2 uppercase">{user?.title || "Architect of the Atelier"}</p>
                  </div>
              </div>

              {/* Right attributes */}
              <div className="col-span-12 lg:col-span-4 space-y-6">
                {rightAttrs.map(({ value, attribute: attr }) => (
                  <div key={attr.label} className="space-y-2">
                    <div className="flex justify-between text-[0.65rem] font-bold uppercase tracking-wider text-outline">
                      {attr.label}
                      <span className={ATTR_VALUE_COLOR[attr.color] || "text-on-surface"}>{value}%</span>
                    </div>
                    <div className="h-3 bg-surface-container-high rounded-full overflow-hidden p-0.5">
                      <div
                        className={`h-full ${attr.color} rounded-full`}
                        style={{ width: `${value}%`, boxShadow: ATTR_GLOW[attr.color] || "0 0 10px rgba(255,255,255,0.5)", backgroundColor: attr.color.startsWith('#') ? attr.color : undefined }}
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
                  {RECENT_MISSIONS.map((m) => (
                    <div
                      key={m.title}
                      className={`flex items-center justify-between p-4 bg-surface-container-lowest rounded-lg cursor-pointer border-l-4 ${m.accent} hover:bg-surface-container-high transition-colors`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${m.iconBg}`}>
                          <span className="material-symbols-outlined">{m.icon}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-on-surface">{m.title}</div>
                          <div className="text-[0.65rem] text-outline uppercase tracking-wider">{m.category}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-secondary font-bold text-sm">{m.xp}</div>
                        <div className="text-[0.6rem] text-outline uppercase">Completado</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rank Progress Card (4 cols) */}
            <div className="col-span-12 md:col-span-4 bg-surface-container-highest p-1 rounded-xl shadow-2xl">
              <div className="bg-surface-bright rounded-lg h-full p-8 flex flex-col justify-between border border-outline-variant/10">
                <div>
                  <h3 className="text-xl font-headline font-bold text-on-surface mb-2">Progreso de Rango</h3>
                  <p className="text-outline text-xs uppercase tracking-widest mb-6">Próximo: Grand Master</p>

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
                      <span className="text-[0.6rem] text-outline uppercase tracking-[0.3em]">Hacia Nivel {(user?.level || 42) + 1}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-primary font-black text-xl leading-none">{user?.trophies || 0}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Trofeos</div>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-lg text-center border border-outline-variant/10">
                    <div className="text-secondary font-black text-xl leading-none">{user?.kredits ? (user.kredits / 1000).toFixed(1) + "k" : "0"}</div>
                    <div className="text-[0.5rem] text-outline uppercase mt-1">Kredits</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Bottom bezel */}
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50" />
      </main>
    </div>
  )
}
