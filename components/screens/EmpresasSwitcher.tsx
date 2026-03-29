"use client"

type Plan = "FREE" | "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
type Role = "SUPER_ADMIN" | "ORG_ADMIN" | "MANAGER" | "MEMBER"

interface OrgWithRole {
  id: string
  name: string
  slug: string
  plan: Plan
  role: Role
}

interface EmpresasSwitcherProps {
  orgs: OrgWithRole[]
  currentOrgId: string
}

const PLAN_STYLE: Record<Plan, { label: string; className: string }> = {
  FREE:         { label: "Free",         className: "border border-outline text-outline" },
  STARTER:      { label: "Starter",      className: "bg-tertiary/20 text-tertiary" },
  PROFESSIONAL: { label: "Professional", className: "bg-secondary/20 text-secondary" },
  ENTERPRISE:   { label: "Enterprise",   className: "bg-primary/20 text-primary" },
}

const ROLE_STYLE: Record<Role, { label: string; className: string }> = {
  SUPER_ADMIN: { label: "Super Admin", className: "bg-primary/20 text-primary" },
  ORG_ADMIN:   { label: "Org Admin",   className: "bg-tertiary/20 text-tertiary" },
  MANAGER:     { label: "Manager",     className: "bg-secondary/20 text-secondary" },
  MEMBER:      { label: "Miembro",     className: "bg-outline/20 text-outline" },
}

export default function EmpresasSwitcher({ orgs, currentOrgId }: EmpresasSwitcherProps) {
  if (orgs.length === 0) {
    return (
      <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
        <h1 className="font-headline text-2xl font-bold mb-8">Empresas</h1>
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-8 text-center">
            <span className="material-symbols-outlined text-4xl text-outline mb-3 block">
              business
            </span>
            <p className="text-on-surface-variant text-sm">
              No perteneces a ninguna empresa todavia
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-2xl font-bold mb-8">Empresas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgs.map((org) => {
          const isCurrent = org.id === currentOrgId
          const plan = PLAN_STYLE[org.plan]
          const role = ROLE_STYLE[org.role]

          return (
            <div
              key={org.id}
              className={`rounded-xl bg-surface-container-highest p-1 shadow-card transition-transform hover:scale-[1.02] ${
                isCurrent ? "ring-2 ring-primary" : ""
              }`}
            >
              <div className="rounded-lg bg-surface-bright p-5 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center">
                      <span className="material-symbols-outlined text-xl text-on-surface-variant">
                        corporate_fare
                      </span>
                    </div>
                    <div>
                      <h2 className="font-headline text-base font-bold">{org.name}</h2>
                      <p className="text-[10px] text-outline tracking-wide">/{org.slug}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
                      Actual
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${plan.className}`}>
                    {plan.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${role.className}`}>
                    {role.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
