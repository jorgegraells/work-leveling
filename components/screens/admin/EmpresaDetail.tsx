"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Plan, SubscriptionStatus } from "@prisma/client"

interface DeptInfo {
  id: string
  name: string
  memberCount: number
  manager: { id: string; name: string; avatarUrl: string | null } | null
}

interface OrgData {
  id: string
  name: string
  slug: string
  plan: Plan
  seats: number
  logoUrl: string | null
  userCount: number
  missionCount: number
  departmentCount: number
  subscription: {
    status: SubscriptionStatus
    quantity: number
    currentPeriodEnd: string
  } | null
  departments: DeptInfo[]
  createdAt: string
}

interface EmpresaDetailProps {
  org: OrgData
}

const PLAN_BADGE: Record<Plan, { label: string; classes: string }> = {
  FREE:         { label: "Free",         classes: "bg-outline/20 text-outline" },
  STARTER:      { label: "Starter",      classes: "bg-secondary/20 text-secondary" },
  PROFESSIONAL: { label: "Professional", classes: "bg-tertiary/20 text-tertiary" },
  ENTERPRISE:   { label: "Enterprise",   classes: "bg-primary/20 text-primary" },
}

const SUB_STATUS: Record<SubscriptionStatus, { label: string; classes: string }> = {
  TRIALING: { label: "Trial",     classes: "bg-tertiary/20 text-tertiary" },
  ACTIVE:   { label: "Activa",    classes: "bg-secondary/20 text-secondary" },
  PAST_DUE: { label: "Vencida",   classes: "bg-error/20 text-error" },
  CANCELED: { label: "Cancelada", classes: "bg-outline/20 text-outline" },
  PAUSED:   { label: "Pausada",   classes: "bg-primary/20 text-primary" },
}

export default function EmpresaDetail({ org }: EmpresaDetailProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const plan = PLAN_BADGE[org.plan]
  const sub = org.subscription ? SUB_STATUS[org.subscription.status] : null
  const createdDate = new Date(org.createdAt).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/empresas/${org.id}`, { method: "DELETE" })
      if (res.ok) {
        router.push("/admin/empresas")
        router.refresh()
      }
    } finally {
      setDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      {/* Breadcrumb + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">Admin</Link>
            <span className="text-outline/40">/</span>
            <Link href="/admin/empresas" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">Empresas</Link>
            <span className="text-outline/40">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{org.name}</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">{org.name}</h1>
          <p className="text-[11px] text-outline mt-1">/{org.slug} · Creada el {createdDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/empresas/${org.id}/usuarios`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm text-tertiary">manage_accounts</span>
            Usuarios
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-error text-[10px] font-bold uppercase tracking-widest hover:bg-error/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Eliminar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left: Info + Stats */}
        <div className="lg:col-span-2 space-y-4">
          {/* Info card */}
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
            <div className="rounded-lg bg-surface-bright p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
                Información General
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Plan",  value: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${plan.classes}`}>{plan.label}</span> },
                  { label: "Asientos", value: `${org.seats} usuarios` },
                  { label: "Suscripción", value: sub ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${sub.classes}`}>{sub.label}</span> : <span className="text-outline/40">—</span> },
                  { label: "Período actual", value: org.subscription ? new Date(org.subscription.currentPeriodEnd).toLocaleDateString("es-MX") : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-surface-container-lowest rounded-lg p-3">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1.5">{label}</p>
                    <div className="text-[12px] text-on-surface-variant">{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
            <div className="rounded-lg bg-surface-bright p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-4">
                Métricas
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: "group",        label: "Usuarios",      value: org.userCount,      accent: "text-tertiary",   bg: "bg-tertiary/10" },
                  { icon: "military_tech",label: "Misiones",      value: org.missionCount,   accent: "text-secondary",  bg: "bg-secondary/10" },
                  { icon: "account_tree", label: "Departamentos", value: org.departmentCount,accent: "text-primary",    bg: "bg-primary/10" },
                ].map((m) => (
                  <div key={m.label} className="bg-surface-container-lowest rounded-lg p-4 text-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 ${m.bg}`}>
                      <span className={`material-symbols-outlined text-xl ${m.accent}`}>{m.icon}</span>
                    </div>
                    <p className={`font-headline text-2xl font-extrabold ${m.accent}`}>{m.value}</p>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-outline mt-1">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* User capacity bar */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Capacidad</p>
                  <p className="text-[10px] text-outline">{org.userCount} / {org.seats}</p>
                </div>
                <div className="h-1.5 bg-surface-container-lowest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-tertiary rounded-full transition-all"
                    style={{ width: `${Math.min(100, (org.userCount / Math.max(org.seats, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Departments */}
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card h-fit">
          <div className="rounded-lg bg-surface-bright p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Departamentos
              </p>
              <span className="text-[10px] text-outline/60">{org.departments.length}</span>
            </div>

            {org.departments.length === 0 ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-3xl text-outline/30 block mb-2">account_tree</span>
                <p className="text-[11px] text-outline/60">Sin departamentos</p>
              </div>
            ) : (
              <div className="space-y-2">
                {org.departments.map((dept) => (
                  <div key={dept.id} className="bg-surface-container-lowest rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[12px] font-semibold text-on-surface">{dept.name}</p>
                      <span className="text-[9px] text-outline bg-surface-container-high px-2 py-0.5 rounded-full">
                        {dept.memberCount}
                      </span>
                    </div>
                    {dept.manager && (
                      <p className="text-[10px] text-outline mt-1">
                        Manager: {dept.manager.name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-[20px]">
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card max-w-sm w-full mx-4">
            <div className="rounded-lg bg-surface-bright p-6 text-center space-y-4">
              <span className="material-symbols-outlined text-3xl text-error block">warning</span>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                ¿Eliminar empresa?
              </h2>
              <p className="text-[12px] text-outline">
                Esta acción eliminará permanentemente <strong className="text-on-surface">{org.name}</strong> y todos sus datos asociados. Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-error-container text-error text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  {deleting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
