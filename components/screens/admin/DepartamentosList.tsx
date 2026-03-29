"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DepartmentMember {
  id: string
  user: { id: string; name: string }
  role: string
}

interface DepartmentData {
  id: string
  name: string
  manager: { id: string; name: string } | null
  members: DepartmentMember[]
}

interface UserBasic {
  id: string
  name: string
}

interface DepartamentosListProps {
  departments: DepartmentData[]
  orgId: string
  users: UserBasic[]
}

export default function DepartamentosList({ departments, orgId, users }: DepartamentosListProps) {
  const router = useRouter()

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editManagerId, setEditManagerId] = useState<string>("")
  const [editLoading, setEditLoading] = useState(false)

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // New department state
  const [newName, setNewName] = useState("")
  const [newManagerId, setNewManagerId] = useState("")
  const [createLoading, setCreateLoading] = useState(false)

  const startEdit = (dept: DepartmentData) => {
    setEditingId(dept.id)
    setEditName(dept.name)
    setEditManagerId(dept.manager?.id ?? "")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName("")
    setEditManagerId("")
  }

  const handleUpdate = async (deptId: string) => {
    if (!editName.trim()) return
    setEditLoading(true)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/departamentos/${deptId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          managerId: editManagerId || null,
        }),
      })
      if (res.ok) {
        cancelEdit()
        router.refresh()
      }
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (deptId: string) => {
    setDeleteLoading(true)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/departamentos/${deptId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setDeletingId(null)
        router.refresh()
      }
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreateLoading(true)
    try {
      const res = await fetch(`/api/admin/empresas/${orgId}/departamentos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          managerId: newManagerId || null,
        }),
      })
      if (res.ok) {
        setNewName("")
        setNewManagerId("")
        router.refresh()
      }
    } finally {
      setCreateLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Existing departments */}
      {departments.map((dept) => (
        <div key={dept.id} className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-4">
            {editingId === dept.id ? (
              /* Inline edit form */
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-[12px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  placeholder="Nombre del departamento"
                />
                <select
                  value={editManagerId}
                  onChange={(e) => setEditManagerId(e.target.value)}
                  className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
                >
                  <option value="">Sin manager</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdate(dept.id)}
                    disabled={editLoading || !editName.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                  >
                    {editLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                    Guardar
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-3 py-1.5 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">account_tree</span>
                    <p className="text-[13px] font-semibold text-on-surface">{dept.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(dept)}
                      className="p-1.5 text-outline hover:text-tertiary hover:bg-surface-container-high rounded-md transition-colors active:scale-95"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button
                      onClick={() => setDeletingId(dept.id)}
                      className="p-1.5 text-outline hover:text-error hover:bg-error/10 rounded-md transition-colors active:scale-95"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-[11px] text-outline">
                  {dept.manager && (
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-tertiary">shield_person</span>
                      {dept.manager.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-secondary">group</span>
                    {dept.members.length} miembro{dept.members.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Delete confirmation inline */}
                {deletingId === dept.id && (
                  <div className="mt-3 bg-error/5 rounded-lg p-3 border border-error/20">
                    <p className="text-[11px] text-error mb-2">
                      ¿Eliminar <strong>{dept.name}</strong>? Esta accion no se puede deshacer.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(dept.id)}
                        disabled={deleteLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-error-container text-error text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {deleteLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
                        Confirmar
                      </button>
                      <button
                        onClick={() => setDeletingId(null)}
                        className="px-3 py-1.5 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {departments.length === 0 && (
        <div className="text-center py-6">
          <span className="material-symbols-outlined text-3xl text-outline/30 block mb-2">account_tree</span>
          <p className="text-[11px] text-outline/60">No hay departamentos creados</p>
        </div>
      )}

      {/* New department form */}
      <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
        <div className="rounded-lg bg-surface-bright p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
            Nuevo departamento
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-[12px] text-on-surface placeholder:text-outline/40 focus:outline-none focus:ring-1 focus:ring-primary/40"
              placeholder="Nombre del departamento"
            />
            <select
              value={newManagerId}
              onChange={(e) => setNewManagerId(e.target.value)}
              className="w-full bg-surface-container-lowest rounded-lg px-3 py-2 text-[12px] text-on-surface focus:outline-none focus:ring-1 focus:ring-primary/40"
            >
              <option value="">Seleccionar manager (opcional)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button
              onClick={handleCreate}
              disabled={createLoading || !newName.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
            >
              {createLoading && <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>}
              <span className="material-symbols-outlined text-sm">add</span>
              Crear departamento
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
