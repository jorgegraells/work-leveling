"use client"

import Link from "next/link"
import type { Plan, SubscriptionStatus } from "@prisma/client"

interface EmpresaRow {
  id: string
  name: string
  slug: string
  plan: Plan
  seats: number
  userCount: number
  departmentCount: number
  subscriptionStatus: SubscriptionStatus | null
  createdAt: string
}

interface EmpresasListProps {
  empresas: EmpresaRow[]
}

const PLAN_BADGE: Record<Plan, { label: string; classes: string }> = {
  FREE:         { label: "Free",         classes: "bg-outline/20 text-outline" },
  STARTER:      { label: "Starter",      classes: "bg-secondary/20 text-secondary" },
  PROFESSIONAL: { label: "Professional", classes: "bg-tertiary/20 text-tertiary" },
  ENTERPRISE:   { label: "Enterprise",   classes: "bg-primary/20 text-primary" },
}

const SUB_BADGE: Record<SubscriptionStatus, { label: string; classes: string }> = {
  TRIALING:  { label: "Trial",    classes: "bg-tertiary/20 text-tertiary" },
  ACTIVE:    { label: "Activa",   classes: "bg-secondary/20 text-secondary" },
  PAST_DUE:  { label: "Vencida",  classes: "bg-error/20 text-error" },
  CANCELED:  { label: "Cancelada",classes: "bg-outline/20 text-outline" },
  PAUSED:    { label: "Pausada",  classes: "bg-primary/20 text-primary" },
}

export default function EmpresasList({ empresas }: EmpresasListProps) {
  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin"
              className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
            >
              Admin
            </Link>
            <span className="text-outline/40">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Empresas
            </span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Gestión de Empresas
          </h1>
          <p className="text-[12px] text-outline mt-1">
            {empresas.length} empresa{empresas.length !== 1 ? "s" : ""} registrada{empresas.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/empresas/nueva"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-sm">add_business</span>
          Nueva Empresa
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
        <div className="rounded-lg bg-surface-bright overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-surface-container-lowest">
            {["Empresa", "Plan", "Usuarios", "Depts.", "Suscripción", "Acciones"].map((col) => (
              <p key={col} className="text-[9px] font-bold uppercase tracking-widest text-outline">
                {col}
              </p>
            ))}
          </div>

          {empresas.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <span className="material-symbols-outlined text-4xl text-outline/40 block mb-3">
                corporate_fare
              </span>
              <p className="text-[12px] text-outline">No hay empresas registradas aún.</p>
              <Link
                href="/admin/empresas/nueva"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md bg-surface-container-high text-primary text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Crear primera empresa
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-container-lowest">
              {empresas.map((emp) => {
                const plan = PLAN_BADGE[emp.plan]
                const sub = emp.subscriptionStatus ? SUB_BADGE[emp.subscriptionStatus] : null
                const date = new Date(emp.createdAt).toLocaleDateString("es-MX", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })

                return (
                  <div
                    key={emp.id}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-surface-container-high transition-colors"
                  >
                    {/* Name */}
                    <div>
                      <p className="text-[13px] font-semibold text-on-surface">{emp.name}</p>
                      <p className="text-[10px] text-outline mt-0.5">/{emp.slug}</p>
                      <p className="text-[9px] text-outline/60 mt-0.5">{date}</p>
                    </div>

                    {/* Plan */}
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${plan.classes}`}
                    >
                      {plan.label}
                    </span>

                    {/* Users */}
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">group</span>
                      <span className="text-[12px] text-on-surface-variant">
                        {emp.userCount}/{emp.seats}
                      </span>
                    </div>

                    {/* Departments */}
                    <div className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-outline">account_tree</span>
                      <span className="text-[12px] text-on-surface-variant">{emp.departmentCount}</span>
                    </div>

                    {/* Subscription */}
                    {sub ? (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${sub.classes}`}
                      >
                        {sub.label}
                      </span>
                    ) : (
                      <span className="text-[10px] text-outline/40">—</span>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/empresas/${emp.id}`}
                        className="p-1.5 rounded-md text-outline hover:text-primary hover:bg-surface-container-high transition-colors active:scale-95"
                        title="Ver detalle"
                      >
                        <span className="material-symbols-outlined text-base">visibility</span>
                      </Link>
                      <Link
                        href={`/admin/empresas/${emp.id}/usuarios`}
                        className="p-1.5 rounded-md text-outline hover:text-tertiary hover:bg-surface-container-high transition-colors active:scale-95"
                        title="Gestionar usuarios"
                      >
                        <span className="material-symbols-outlined text-base">manage_accounts</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
