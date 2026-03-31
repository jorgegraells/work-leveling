"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { Plan, SubscriptionStatus } from "@prisma/client"
import DepartamentosList from "./DepartamentosList"

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

interface DepartmentDetailData {
  id: string
  name: string
  manager: { id: string; name: string } | null
  members: { id: string; user: { id: string; name: string }; role: string }[]
}

interface UserBasic {
  id: string
  name: string
}

interface EmpresaDetailProps {
  org: OrgData
  departments?: DepartmentDetailData[]
  users?: UserBasic[]
}

const PLAN_BADGE: Record<Plan, { label: string; classes: string }> = {
  FREE:         { label: "Free",         classes: "bg-outline/20 text-outline" },
  STARTER:      { label: "Starter",      classes: "bg-secondary/20 text-secondary" },
  PROFESSIONAL: { label: "Professional", classes: "bg-tertiary/20 text-tertiary" },
  ENTERPRISE:   { label: "Enterprise",   classes: "bg-primary/20 text-primary" },
}

export default function EmpresaDetail({ org, departments, users }: EmpresaDetailProps) {
  const router = useRouter()
  const t = useTranslations("empresas")
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const SUB_STATUS: Record<SubscriptionStatus, { label: string; classes: string }> = {
    TRIALING: { label: "Trial",              classes: "bg-tertiary/20 text-tertiary" },
    ACTIVE:   { label: t("subActive"),       classes: "bg-secondary/20 text-secondary" },
    PAST_DUE: { label: t("subPastDue"),      classes: "bg-error/20 text-error" },
    CANCELED: { label: t("subCanceled"),     classes: "bg-outline/20 text-outline" },
    PAUSED:   { label: t("subPaused"),       classes: "bg-primary/20 text-primary" },
  }

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

  const INFO_ROWS = [
    { label: t("fieldPlanLabel"),    value: <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${plan.classes}`}>{plan.label}</span> },
    { label: t("fieldSeatsLabel"),   value: t("seatsValue", { count: org.seats }) },
    { label: t("fieldSubscription"), value: sub ? <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${sub.classes}`}>{sub.label}</span> : <span className="text-outline/40">—</span> },
    { label: t("fieldPeriod"),       value: org.subscription ? new Date(org.subscription.currentPeriodEnd).toLocaleDateString("es-MX") : "—" },
  ]

  const METRICS = [
    { icon: "group",         label: t("metricUsers"),   value: org.userCount,       accent: "text-tertiary",  bg: "bg-tertiary/10" },
    { icon: "military_tech", label: t("metricMissions"),value: org.missionCount,    accent: "text-secondary", bg: "bg-secondary/10" },
    { icon: "account_tree",  label: t("metricDepts"),   value: org.departmentCount, accent: "text-primary",   bg: "bg-primary/10" },
  ]

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      {/* Breadcrumb + actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">Admin</Link>
            <span className="text-outline/40">/</span>
            <Link href="/admin/empresas" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">{t("breadcrumb")}</Link>
            <span className="text-outline/40">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{org.name}</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">{org.name}</h1>
          <p className="text-[11px] text-outline mt-1">/{org.slug} · {t("createdAt", { date: createdDate })}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/empresas/${org.id}/usuarios`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest hover:bg-surface-variant active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm text-tertiary">manage_accounts</span>
            {t("usersButton")}
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-error text-[10px] font-bold uppercase tracking-widest hover:bg-error/10 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            {t("deleteButton")}
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
                {t("generalInfo")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {INFO_ROWS.map(({ label, value }) => (
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
                {t("metrics")}
              </p>
              <div className="grid grid-cols-3 gap-3">
                {METRICS.map((m) => (
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
                  <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{t("capacity")}</p>
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
                {t("departments")}
              </p>
              <span className="text-[10px] text-outline/60">{org.departments.length}</span>
            </div>

            {org.departments.length === 0 ? (
              <div className="text-center py-6">
                <span className="material-symbols-outlined text-3xl text-outline/30 block mb-2">account_tree</span>
                <p className="text-[11px] text-outline/60">{t("noDepartments")}</p>
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

      {/* Departamentos */}
      {departments && users && (
        <div className="mt-8">
          <h2 className="text-xl font-headline font-bold text-on-surface mb-4">{t("manageDepartments")}</h2>
          <DepartamentosList departments={departments} orgId={org.id} users={users} />
        </div>
      )}

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-[20px]">
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card max-w-sm w-full mx-4">
            <div className="rounded-lg bg-surface-bright p-6 text-center space-y-4">
              <span className="material-symbols-outlined text-3xl text-error block">warning</span>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                {t("deleteConfirmTitle")}
              </h2>
              <p className="text-[12px] text-outline">
                {t("deleteConfirmBody", { name: org.name })}
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
                >
                  {t("cancelButton")}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-error-container text-error text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                >
                  {deleting && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                  {t("deleteButton")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
