"use client"

import Link from "next/link"
import { useState } from "react"

interface AdminDashboardProps {
  totalOrgs: number
  totalUsers: number
  pendingApprovals: number
}

const STAT_CARDS = [
  {
    key: "orgs" as const,
    icon: "corporate_fare",
    label: "Empresas",
    href: "/admin/empresas",
    accentClass: "text-primary",
    bgClass: "bg-primary/10",
  },
  {
    key: "users" as const,
    icon: "group",
    label: "Usuarios Totales",
    href: null,
    accentClass: "text-tertiary",
    bgClass: "bg-tertiary/10",
  },
  {
    key: "pending" as const,
    icon: "pending_actions",
    label: "Aprobaciones Pendientes",
    href: null,
    accentClass: "text-secondary",
    bgClass: "bg-secondary/10",
  },
]

export default function AdminDashboard({
  totalOrgs,
  totalUsers,
  pendingApprovals,
}: AdminDashboardProps) {
  const [resetting, setResetting] = useState(false)
  const [resetDone, setResetDone] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [resetScope, setResetScope] = useState<"gameplay" | "full">("gameplay")

  async function handleReset() {
    setResetting(true)
    try {
      await fetch("/api/admin/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: resetScope }) })
      setResetDone(true)
      setShowConfirm(false)
      setTimeout(() => setResetDone(false), 4000)
    } finally {
      setResetting(false)
    }
  }

  const values: Record<(typeof STAT_CARDS)[number]["key"], number> = {
    orgs: totalOrgs,
    users: totalUsers,
    pending: pendingApprovals,
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <span className="material-symbols-outlined text-primary text-2xl">shield_person</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            Panel de Administración
          </span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          Super Admin Dashboard
        </h1>
        <p className="text-[12px] text-outline mt-1">
          Gestión global de empresas, usuarios y configuración del sistema.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {STAT_CARDS.map((card) => {
          const inner = (
            <div className="rounded-xl bg-surface-container-highest p-1 shadow-card hover:scale-[1.02] transition-transform">
              <div className="rounded-lg bg-surface-bright p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bgClass}`}>
                  <span className={`material-symbols-outlined text-2xl ${card.accentClass}`}>
                    {card.icon}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-1">
                    {card.label}
                  </p>
                  <p className={`font-headline text-3xl font-extrabold ${card.accentClass}`}>
                    {values[card.key]}
                  </p>
                </div>
              </div>
            </div>
          )

          return card.href ? (
            <Link key={card.key} href={card.href}>
              {inner}
            </Link>
          ) : (
            <div key={card.key}>{inner}</div>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card mb-10">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            Acciones Rápidas
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/empresas"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-primary">corporate_fare</span>
              Ver Empresas
            </Link>
            <Link
              href="/admin/empresas/nueva"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">add_business</span>
              Nueva Empresa
            </Link>
            <Link
              href="/admin/proyectos"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-tertiary">account_tree</span>
              Proyectos
            </Link>
            <Link
              href="/admin/aprobaciones"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-secondary">approval</span>
              Aprobaciones
            </Link>
            <Link
              href="/admin/estadisticas"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm text-on-tertiary-container">bar_chart</span>
              Estadísticas
            </Link>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card mb-10 border border-error/20">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-1">
            Zona de Peligro
          </p>
          {/* Scope selector */}
          <div className="flex gap-2 mb-4">
            {([
              { key: "gameplay", label: "Solo gameplay", hint: "Borra misiones, XP, aprobaciones. Conserva usuarios y empresas." },
              { key: "full", label: "Borrado total", hint: "Borra TODO excepto el superadmin." },
            ] as const).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setResetScope(opt.key)}
                className={`flex-1 p-3 rounded-lg text-left border transition-all ${
                  resetScope === opt.key
                    ? "border-error bg-error/10 text-error"
                    : "border-outline-variant/20 bg-surface-container-lowest text-outline hover:border-error/30"
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest">{opt.label}</p>
                <p className="text-[10px] mt-0.5 opacity-70">{opt.hint}</p>
              </button>
            ))}
          </div>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-error/10 text-error border border-error/20 text-[10px] font-bold uppercase tracking-widest hover:bg-error/20 active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              Ejecutar Reset
            </button>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-sm text-error font-medium">¿Confirmas? Esta acción <strong>no se puede deshacer</strong>.</p>
              <button
                onClick={handleReset}
                disabled={resetting}
                className="px-4 py-2 rounded-md bg-error text-white text-[10px] font-bold uppercase tracking-widest active:scale-95 disabled:opacity-50 transition-transform"
              >
                {resetting ? "Reseteando..." : "Confirmar"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-surface-container-high text-outline text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
              >
                Cancelar
              </button>
            </div>
          )}
          {resetDone && (
            <p className="text-secondary text-sm mt-2 font-medium">✓ Reset completado correctamente</p>
          )}
        </div>
      </div>

      {/* System info */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
        <div className="rounded-lg bg-surface-bright p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
            Información del Sistema
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Entorno", value: process.env.NODE_ENV ?? "production" },
              { label: "Versión", value: "1.0.0" },
              { label: "Base de Datos", value: "Supabase / PostgreSQL" },
              { label: "Auth", value: "Clerk" },
            ].map((item) => (
              <div key={item.label} className="bg-surface-container-lowest rounded-lg p-3">
                <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1">
                  {item.label}
                </p>
                <p className="text-[12px] text-on-surface-variant font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
