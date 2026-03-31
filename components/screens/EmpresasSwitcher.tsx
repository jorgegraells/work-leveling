"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { useOrg } from "@/contexts/OrgContext"

type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "MEMBER"

interface OrgWithRole {
  id: string
  name: string
  slug: string
  plan: Plan
  role: Role
}

interface PendingInvitation {
  id: string
  role: Role
  organization: { id: string; name: string; slug: string; plan: Plan }
}

interface EmpresasSwitcherProps {
  orgs: OrgWithRole[]
  currentOrgId: string
  pendingInvitations: PendingInvitation[]
}

const PLAN_STYLE: Record<Plan, { label: string; className: string }> = {
  FREE:         { label: "Free",         className: "border border-outline text-outline" },
  STARTER:      { label: "Starter",      className: "bg-tertiary/20 text-tertiary" },
  PROFESSIONAL: { label: "Professional", className: "bg-secondary/20 text-secondary" },
  ENTERPRISE:   { label: "Enterprise",   className: "bg-primary/20 text-primary" },
}

const ROLE_CLASS: Record<Role, string> = {
  SUPER_ADMIN: "bg-primary/20 text-primary",
  ORG_ADMIN:   "bg-tertiary/20 text-tertiary",
  MANAGER:     "bg-secondary/20 text-secondary",
  MEMBER:      "bg-outline/20 text-outline",
}

export default function EmpresasSwitcher({ orgs, currentOrgId: propCurrentOrgId, pendingInvitations }: EmpresasSwitcherProps) {
  const router = useRouter()
  const t = useTranslations("empresasSwitcher")
  const [processing, setProcessing] = useState<string | null>(null)
  const { currentOrgId: contextOrgId, setCurrentOrg } = useOrg()
  const currentOrgId = contextOrgId ?? propCurrentOrgId

  const ROLE_LABEL: Record<Role, string> = {
    SUPER_ADMIN: "Super Admin",
    ORG_ADMIN:   "Org Admin",
    MANAGER:     "Manager",
    MEMBER:      t("roleMember"),
  }

  async function handleAccept(roleId: string) {
    setProcessing(roleId)
    try {
      const res = await fetch(`/api/me/invitaciones/${roleId}`, { method: "PATCH" })
      if (res.ok) router.refresh()
    } finally {
      setProcessing(null)
    }
  }

  async function handleReject(roleId: string) {
    setProcessing(roleId)
    try {
      const res = await fetch(`/api/me/invitaciones/${roleId}`, { method: "DELETE" })
      if (res.ok) router.refresh()
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="space-y-10">
      {/* Pending invitations */}
      {pendingInvitations.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-primary">mail</span>
            <h2 className="font-headline text-lg font-bold text-on-surface">{t("pendingInvitations")}</h2>
            <span className="bg-primary/20 text-primary px-2.5 py-0.5 rounded-full text-[10px] font-bold">
              {pendingInvitations.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvitations.map((inv) => {
              const plan = PLAN_STYLE[inv.organization.plan]
              const isProcessing = processing === inv.id

              return (
                <div key={inv.id} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)] ring-1 ring-primary/30">
                  <div className="rounded-lg bg-surface-bright p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <span className="material-symbols-outlined text-xl text-primary">corporate_fare</span>
                      </div>
                      <div>
                        <h3 className="font-headline text-base font-bold text-on-surface">{inv.organization.name}</h3>
                        <p className="text-[10px] text-outline tracking-wide">/{inv.organization.slug}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${plan.className}`}>
                        {plan.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${ROLE_CLASS[inv.role]}`}>
                        {t("asRole", { role: ROLE_LABEL[inv.role] })}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(inv.id)}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 bg-secondary text-on-secondary-fixed font-bold rounded-md uppercase text-[10px] tracking-widest hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isProcessing ? "..." : t("accept")}
                      </button>
                      <button
                        onClick={() => handleReject(inv.id)}
                        disabled={isProcessing}
                        className="flex-1 py-2.5 bg-surface-container-high text-outline font-bold rounded-md uppercase text-[10px] tracking-widest hover:bg-surface-variant transition-all active:scale-95 disabled:opacity-50"
                      >
                        {t("reject")}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Confirmed orgs */}
      <div>
        <h2 className="font-headline text-lg font-bold text-on-surface mb-4">{t("myCompanies")}</h2>

        {orgs.length === 0 ? (
          <div className="rounded-xl bg-surface-container-highest p-1">
            <div className="rounded-lg bg-surface-bright p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-3 block">business</span>
              <p className="text-outline text-sm">{t("noCompanies")}</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orgs.map((org) => {
              const isCurrent = org.id === currentOrgId
              const plan = PLAN_STYLE[org.plan]

              return (
                <div
                  key={org.id}
                  onClick={() => !isCurrent && setCurrentOrg(org.id)}
                  className={`rounded-xl bg-surface-container-highest p-1 transition-transform hover:scale-[1.02] cursor-pointer ${
                    isCurrent ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-outline-variant/30"
                  }`}
                >
                  <div className="rounded-lg bg-surface-bright p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                          <span className="material-symbols-outlined text-xl text-on-surface-variant">corporate_fare</span>
                        </div>
                        <div>
                          <h3 className="font-headline text-base font-bold">{org.name}</h3>
                          <p className="text-[10px] text-outline tracking-wide">/{org.slug}</p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                          {t("current")}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${plan.className}`}>
                        {plan.label}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${ROLE_CLASS[org.role]}`}>
                        {ROLE_LABEL[org.role]}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
