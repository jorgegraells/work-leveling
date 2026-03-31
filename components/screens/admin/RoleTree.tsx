"use client"

import { useTranslations } from "next-intl"
import type { Role } from "@prisma/client"

interface Member {
  id: string
  role: Role
  userId: string
  user: {
    name: string
    email: string
    avatarUrl: string | null
    level: number
    title: string | null
  }
  department: { id: string; name: string } | null
  createdAt: string
}

interface Department {
  id: string
  name: string
}

interface RoleTreeProps {
  members: Member[]
  departments: Department[]
}

const ROLE_BADGE: Record<Role, { label: string; classes: string; dotClass: string }> = {
  SUPER_ADMIN: { label: "Super Admin", classes: "bg-primary/20 text-primary",    dotClass: "bg-primary" },
  ORG_ADMIN:   { label: "Org Admin",   classes: "bg-tertiary/20 text-tertiary",  dotClass: "bg-tertiary" },
  MANAGER:     { label: "Manager",     classes: "bg-secondary/20 text-secondary",dotClass: "bg-secondary" },
  MEMBER:      { label: "Member",      classes: "bg-outline/20 text-outline",    dotClass: "bg-outline" },
}

function UserCard({ member }: { member: Member }) {
  const badge = ROLE_BADGE[member.role]
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest rounded-lg px-3 py-2.5">
      <div className="w-7 h-7 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden flex-shrink-0">
        {member.user.avatarUrl ? (
          <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="material-symbols-outlined text-xs text-outline">person</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-on-surface truncate">{member.user.name}</p>
        <p className="text-[9px] text-outline truncate">{member.user.email}</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <div className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${badge.classes}`}>
          {badge.label}
        </span>
      </div>
    </div>
  )
}

export default function RoleTree({ members, departments }: RoleTreeProps) {
  const t = useTranslations("roletree")

  // Admins (no department or ORG_ADMIN)
  const orgAdmins = members.filter((m) => m.role === "ORG_ADMIN" || m.role === "SUPER_ADMIN")
  const unassigned = members.filter((m) => !m.department && m.role !== "ORG_ADMIN" && m.role !== "SUPER_ADMIN")

  // Members grouped by department
  const byDept = departments.map((dept) => ({
    dept,
    members: members.filter((m) => m.department?.id === dept.id),
  }))

  return (
    <div className="space-y-4">
      {/* Org-level admins */}
      {orgAdmins.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary text-base">shield_person</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t("admins")}</p>
              <span className="ml-auto text-[9px] text-outline/60">{orgAdmins.length}</span>
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-primary/20">
              {orgAdmins.map((m) => <UserCard key={m.id} member={m} />)}
            </div>
          </div>
        </div>
      )}

      {/* Department groups */}
      {byDept.map(({ dept, members: deptMembers }) => {
        const managers = deptMembers.filter((m) => m.role === "MANAGER")
        const rest = deptMembers.filter((m) => m.role !== "MANAGER")

        return (
          <div key={dept.id} className="rounded-xl bg-surface-container-highest p-1 shadow-card">
            <div className="rounded-lg bg-surface-bright p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-tertiary text-base">account_tree</span>
                <p className="text-[10px] font-bold uppercase tracking-widest text-tertiary">{dept.name}</p>
                <span className="ml-auto text-[9px] text-outline/60">{deptMembers.length}</span>
              </div>

              {deptMembers.length === 0 ? (
                <p className="text-[11px] text-outline/50 text-center py-3">{t("noMembers")}</p>
              ) : (
                <div className="pl-4 border-l-2 border-tertiary/20 space-y-3">
                  {managers.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-secondary mb-1.5">{t("managers")}</p>
                      <div className="space-y-1.5">
                        {managers.map((m) => <UserCard key={m.id} member={m} />)}
                      </div>
                    </div>
                  )}
                  {rest.length > 0 && (
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-outline mb-1.5">{t("members")}</p>
                      <div className="space-y-1.5">
                        {rest.map((m) => <UserCard key={m.id} member={m} />)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Unassigned members */}
      {unassigned.length > 0 && (
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-outline text-base">person_off</span>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">{t("noDepartment")}</p>
              <span className="ml-auto text-[9px] text-outline/60">{unassigned.length}</span>
            </div>
            <div className="space-y-2 pl-4 border-l-2 border-outline/20">
              {unassigned.map((m) => <UserCard key={m.id} member={m} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
