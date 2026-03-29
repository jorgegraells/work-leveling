"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { UserButton, SignOutButton } from "@clerk/nextjs"
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole"
import NotificationBell from "@/components/layout/NotificationBell"
import Breadcrumbs from "@/components/layout/Breadcrumbs"

export interface UserDataHeader {
  name: string
  level: number
  title: string
  avatarUrl?: string | null
}

const SIDEBAR_NAV = [
  { icon: "home",          label: "Dashboard",    href: "/dashboard"    },
  { icon: "person",        label: "Perfil",       href: "/perfil"       },
  { icon: "military_tech", label: "Misiones",     href: "/misiones"     },
  { icon: "bar_chart",     label: "Estadísticas", href: "/estadisticas" },
  { icon: "business",      label: "Empresas",     href: "/empresas"     },
]

const MOBILE_NAV = [
  { icon: "home",          label: "Dashboard", href: "/dashboard"    },
  { icon: "military_tech", label: "Misiones",  href: "/misiones"     },
  { icon: "person",        label: "Perfil",    href: "/perfil"       },
  { icon: "bar_chart",     label: "Stats",     href: "/estadisticas" },
  { icon: "settings",      label: "Config",    href: "/settings"     },
]

export default function SidebarLayout({
  children,
  user,
  breadcrumbs,
}: {
  children: React.ReactNode
  user?: UserDataHeader
  breadcrumbs?: { label: string; href?: string }[]
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(true)
  const { role, isSuperAdmin } = useCurrentUserRole()

  // Build dynamic nav items based on role
  const roleNavItems: { icon: string; label: string; href: string }[] = []
  if (isSuperAdmin) {
    roleNavItems.push({ icon: "admin_panel_settings", label: "Admin", href: "/admin" })
  } else if (role === "ORG_ADMIN" || role === "MANAGER") {
    roleNavItems.push({ icon: "approval", label: "Aprobaciones", href: "/admin/aprobaciones" })
  }

  const allNavItems = [...SIDEBAR_NAV, ...roleNavItems]

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden min-h-screen flex">
      {/* Sidebar toggle button (hidden when sidebar is open) */}
      <button
        onClick={() => setCollapsed(false)}
        className={`fixed top-8 left-6 z-50 p-2 bg-surface-container-highest rounded-lg border border-primary/20 text-primary hover:bg-surface-variant transition-all active:scale-95 hidden xl:flex items-center justify-center ${
          collapsed ? "xl:opacity-100 xl:pointer-events-auto" : "xl:opacity-0 xl:pointer-events-none"
        }`}
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 h-full hidden xl:flex flex-col p-6 z-40 bg-surface w-64 rounded-r-2xl border-r border-surface-container-highest/15 sidebar-transition"
        style={{ transform: collapsed ? "translateX(-100%)" : "translateX(0)" }}
      >
        <div className="mb-8 flex justify-between items-center h-10 w-full">
          <div className="px-2 flex items-center gap-4 flex-1 overflow-hidden">
            <div className="w-10 h-10 rounded-lg border border-primary/30 overflow-hidden shadow-lg flex-shrink-0 flex items-center justify-center bg-surface-container-lowest">
              {user?.avatarUrl ? (
                <img
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  src={user.avatarUrl}
                />
              ) : (
                <span className="material-symbols-outlined text-xl text-outline">person</span>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-on-surface truncate">
                {user ? user.name : "Steve Smith"}
              </h2>
              <p className="text-[9px] text-primary mt-1 truncate">
                Nivel {user ? user.level : 42} {user ? user.title.split(" ")[0] : "Architect"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Notification Bell */}
            <NotificationBell />
            {/* Close button inside sidebar */}
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 text-outline hover:text-primary transition-colors bg-surface-container-high rounded-md active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {allNavItems.map((item) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
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
          <Link href="/settings" className="flex items-center gap-3 px-4 py-2 text-outline hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined flex-shrink-0">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-widest">Config</span>
          </Link>
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
        className={`flex-1 flex flex-col relative overflow-hidden min-h-screen sidebar-content-transition pb-20 xl:pb-0 ${
          collapsed ? "xl:ml-0" : "xl:ml-64"
        }`}
      >
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="px-6 pt-4">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface-container-highest rounded-t-xl z-50 px-4 md:px-12 py-4 flex justify-between items-center xl:hidden border-t border-outline-variant">
        {MOBILE_NAV.map((item) => {
          const active =
            pathname === item.href ||
            (item.href === "/misiones" && pathname.startsWith("/misiones"))
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1.5 min-w-[64px] transition-colors active:text-on-surface ${
                active ? "text-primary scale-110" : "text-outline"
              }`}
            >
              <span
                className="material-symbols-outlined !text-2xl md:!text-3xl"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
