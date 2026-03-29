"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { Role } from "@prisma/client"
import RoleTree from "./RoleTree"

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

interface UsuariosOrgProps {
  orgId: string
  orgName: string
  members: Member[]
  departments: Department[]
}

const ROLE_BADGE: Record<Role, { label: string; classes: string }> = {
  SUPER_ADMIN: { label: "Super Admin", classes: "bg-primary/20 text-primary" },
  ORG_ADMIN:   { label: "Org Admin",   classes: "bg-tertiary/20 text-tertiary" },
  MANAGER:     { label: "Manager",     classes: "bg-secondary/20 text-secondary" },
  MEMBER:      { label: "Member",      classes: "bg-outline/20 text-outline" },
}

const ROLES: Role[] = ["SUPER_ADMIN", "ORG_ADMIN", "MANAGER", "MEMBER"]

export default function UsuariosOrg({ orgId, orgName, members, departments }: UsuariosOrgProps) {
  const router = useRouter()
  const [view, setView] = useState<"table" | "tree">("table")
  const [showAddModal, setShowAddModal] = useState(false)
  const [editMember, setEditMember] = useState<Member | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Add user form state
  const [addEmail, setAddEmail] = useState("")
  const [addRole, setAddRole] = useState<Role>("MEMBER")
  const [addDept, setAddDept] = useState("")
  const [addError, setAddError] = useState<string | null>(null)
  const [addLoading, setAddLoading] = useState(false)

  // Edit role form state
  const [editRole, setEditRole] = useState<Role>("MEMBER")
  const [editDept, setEditDept] = useState("")

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError(null)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/usuarios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userEmail: addEmail,
          role: addRole,
          departmentId: addDept || undefined,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Error ${res.status}`)
      }
      setShowAddModal(false)
      setAddEmail("")
      setAddRole("MEMBER")
      setAddDept("")
      router.refresh()
    } catch (err) {
      setAddError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setAddLoading(false)
    }
  }

  const openEdit = (member: Member) => {
    setEditMember(member)
    setEditRole(member.role)
    setEditDept(member.department?.id ?? "")
  }

  const handleEditRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editMember) return
    setActionLoading(editMember.userId)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/usuarios/${editMember.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: editRole, departmentId: editDept || null }),
      })
      if (res.ok) {
        setEditMember(null)
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (userId: string) => {
    if (!confirm("¿Quitar este usuario de la organización?")) return
    setActionLoading(userId)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/usuarios/${userId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link href="/admin" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">Admin</Link>
            <span className="text-outline/40">/</span>
            <Link href="/admin/empresas" className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">Empresas</Link>
            <span className="text-outline/40">/</span>
            <Link href={`/admin/empresas/${orgId}`} className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors">{orgName}</Link>
            <span className="text-outline/40">/</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-tertiary">Usuarios</span>
          </div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">
            Usuarios — {orgName}
          </h1>
          <p className="text-[12px] text-outline mt-1">
            {members.length} miembro{members.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-surface-container-highest rounded-lg p-0.5">
            {(["table", "tree"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  view === v ? "bg-surface-bright text-on-surface" : "text-outline hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">{v === "table" ? "table_rows" : "account_tree"}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            Agregar Usuario
          </button>
        </div>
      </div>

      {view === "tree" ? (
        <RoleTree members={members} departments={departments} />
      ) : (
        /* Table view */
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-surface-container-lowest">
              {["Usuario", "Rol", "Departamento", "Nivel", "Acciones"].map((col) => (
                <p key={col} className="text-[9px] font-bold uppercase tracking-widest text-outline">{col}</p>
              ))}
            </div>

            {members.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-outline/40 block mb-3">group</span>
                <p className="text-[12px] text-outline">Sin miembros en esta organización.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-container-lowest">
                {members.map((m) => {
                  const badge = ROLE_BADGE[m.role]
                  return (
                    <div
                      key={m.id}
                      className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-surface-container-high transition-colors"
                    >
                      {/* User */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden flex-shrink-0">
                          {m.user.avatarUrl ? (
                            <img src={m.user.avatarUrl} alt={m.user.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-sm text-outline">person</span>
                          )}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-on-surface">{m.user.name}</p>
                          <p className="text-[10px] text-outline">{m.user.email}</p>
                        </div>
                      </div>

                      {/* Role */}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest w-fit ${badge.classes}`}>
                        {badge.label}
                      </span>

                      {/* Department */}
                      <p className="text-[12px] text-outline">
                        {m.department?.name ?? "—"}
                      </p>

                      {/* Level */}
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">military_tech</span>
                        <span className="text-[12px] text-on-surface-variant">{m.user.level}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(m)}
                          disabled={actionLoading === m.userId}
                          className="p-1.5 rounded-md text-outline hover:text-tertiary hover:bg-surface-container-high transition-colors active:scale-95 disabled:opacity-40"
                          title="Cambiar rol"
                        >
                          <span className="material-symbols-outlined text-base">edit</span>
                        </button>
                        <button
                          onClick={() => handleRemove(m.userId)}
                          disabled={actionLoading === m.userId}
                          className="p-1.5 rounded-md text-outline hover:text-error hover:bg-surface-container-high transition-colors active:scale-95 disabled:opacity-40"
                          title="Quitar de la org"
                        >
                          <span className="material-symbols-outlined text-base">
                            {actionLoading === m.userId ? "progress_activity" : "person_remove"}
                          </span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-[20px]">
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card max-w-sm w-full mx-4">
            <div className="rounded-lg bg-surface-bright p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-base font-bold text-on-surface">Agregar Usuario</h2>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-outline hover:text-on-surface rounded-md hover:bg-surface-container-high active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                {addError && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/30 border border-error/20">
                    <span className="material-symbols-outlined text-error text-sm">error</span>
                    <p className="text-[11px] text-error">{addError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">Email del usuario</label>
                  <input
                    type="email"
                    value={addEmail}
                    onChange={(e) => setAddEmail(e.target.value)}
                    required
                    placeholder="usuario@empresa.com"
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-[12px] text-on-surface placeholder:text-outline/40 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">Rol</label>
                  <select
                    value={addRole}
                    onChange={(e) => setAddRole(e.target.value as Role)}
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-[12px] text-on-surface outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_BADGE[r].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">Departamento (opcional)</label>
                  <select
                    value={addDept}
                    onChange={(e) => setAddDept(e.target.value)}
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-[12px] text-on-surface outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  >
                    <option value="">Sin departamento</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-3 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95">
                    Cancelar
                  </button>
                  <button type="submit" disabled={addLoading} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50">
                    {addLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    Agregar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {editMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-[20px]">
          <div className="rounded-xl bg-surface-container-highest p-1 shadow-card max-w-sm w-full mx-4">
            <div className="rounded-lg bg-surface-bright p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-headline text-base font-bold text-on-surface">Cambiar Rol</h2>
                <button onClick={() => setEditMember(null)} className="p-1 text-outline hover:text-on-surface rounded-md hover:bg-surface-container-high active:scale-95 transition-all">
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              </div>
              <p className="text-[12px] text-outline mb-4">{editMember.user.name} · {editMember.user.email}</p>
              <form onSubmit={handleEditRole} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">Rol</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-[12px] text-on-surface outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{ROLE_BADGE[r].label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-1.5">Departamento</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-surface-container-lowest rounded-lg px-3 py-2.5 text-[12px] text-on-surface outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                  >
                    <option value="">Sin departamento</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setEditMember(null)} className="flex-1 px-3 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95">
                    Cancelar
                  </button>
                  <button type="submit" disabled={actionLoading === editMember.userId} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-surface-container-high text-on-surface text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50">
                    {actionLoading === editMember.userId && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
