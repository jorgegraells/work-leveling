"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Department {
  id: string
  name: string
}

interface OrgUser {
  id: string
  name: string
  avatarUrl: string | null
  level: number
}

interface AsignacionModalProps {
  missionId: string
  orgId: string
  onClose: () => void
}

type Mode = "usuarios" | "departamento"

export default function AsignacionModal({
  missionId,
  orgId,
  onClose,
}: AsignacionModalProps) {
  const [mode, setMode] = useState<Mode>("usuarios")
  const [users, setUsers] = useState<OrgUser[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [selectedDeptId, setSelectedDeptId] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ assigned: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [usersRes, deptsRes] = await Promise.all([
          fetch(`/api/admin/orgs/${orgId}/usuarios`),
          fetch(`/api/admin/orgs/${orgId}/departamentos`),
        ])
        if (usersRes.ok) setUsers(await usersRes.json())
        if (deptsRes.ok) setDepartments(await deptsRes.json())
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [orgId])

  function toggleUser(userId: string) {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  async function handleConfirm() {
    setSubmitting(true)
    setError(null)
    try {
      const body =
        mode === "usuarios"
          ? { userIds: selectedUserIds }
          : { departmentId: selectedDeptId }

      const res = await fetch(`/api/admin/misiones/${missionId}/asignar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? "Error al asignar")
        return
      }

      const data = await res.json()
      setResult(data)
    } catch {
      setError("Error de conexión")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent
        className="bg-surface-container-highest/60 backdrop-blur-xl border-none max-w-lg w-full rounded-xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="font-headline text-lg font-bold text-on-surface">
              Asignar Misión
            </DialogTitle>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-outline hover:text-on-surface transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>
        </DialogHeader>

        {result ? (
          /* Success state */
          <div className="py-8 text-center space-y-4">
            <span className="material-symbols-outlined text-5xl text-secondary block">
              check_circle
            </span>
            <p className="font-headline text-xl font-bold text-on-surface">
              {result.assigned} usuario{result.assigned !== 1 ? "s" : ""} asignado
              {result.assigned !== 1 ? "s" : ""}
            </p>
            <p className="text-sm text-on-surface-variant">
              Se han enviado notificaciones a los usuarios.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-6 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Mode selector */}
            <div className="flex gap-2 p-1 rounded-lg bg-surface-container-lowest">
              {(["usuarios", "departamento"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95 ${
                    mode === m
                      ? "bg-surface-container-highest text-on-surface"
                      : "text-outline hover:text-on-surface-variant"
                  }`}
                >
                  {m === "usuarios" ? "Usuarios Específicos" : "Por Departamento"}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="py-8 flex items-center justify-center">
                <span className="material-symbols-outlined text-outline animate-spin text-2xl">
                  progress_activity
                </span>
              </div>
            ) : mode === "usuarios" ? (
              /* User multiselect */
              <div className="space-y-2 max-h-64 overflow-y-auto no-scrollbar">
                {users.length === 0 ? (
                  <p className="text-sm text-outline text-center py-4">
                    No hay usuarios disponibles.
                  </p>
                ) : (
                  users.map((u) => {
                    const selected = selectedUserIds.includes(u.id)
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => toggleUser(u.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left active:scale-[0.98] ${
                          selected
                            ? "bg-primary-container/30 border border-primary/20"
                            : "bg-surface-container-lowest hover:bg-surface-container-high"
                        }`}
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-outline-variant/20"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center">
                            <span className="material-symbols-outlined text-outline text-base">
                              person
                            </span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-[13px] font-medium text-on-surface">{u.name}</p>
                          <p className="text-[10px] text-outline">Nivel {u.level}</p>
                        </div>
                        {selected && (
                          <span className="material-symbols-outlined text-primary text-base">
                            check_circle
                          </span>
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            ) : (
              /* Department select */
              <div className="space-y-2">
                {departments.length === 0 ? (
                  <p className="text-sm text-outline text-center py-4">
                    No hay departamentos configurados.
                  </p>
                ) : (
                  departments.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => setSelectedDeptId(d.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left active:scale-[0.98] ${
                        selectedDeptId === d.id
                          ? "bg-primary-container/30 border border-primary/20"
                          : "bg-surface-container-lowest hover:bg-surface-container-high"
                      }`}
                    >
                      <span className="material-symbols-outlined text-outline text-lg">
                        corporate_fare
                      </span>
                      <span className="text-[13px] text-on-surface">{d.name}</span>
                      {selectedDeptId === d.id && (
                        <span className="material-symbols-outlined text-primary text-base ml-auto">
                          check_circle
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-error-container/20 text-error text-sm">
                <span className="material-symbols-outlined text-base">error</span>
                {error}
              </div>
            )}

            {/* Footer */}
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={
                  submitting ||
                  (mode === "usuarios" && selectedUserIds.length === 0) ||
                  (mode === "departamento" && !selectedDeptId)
                }
                className="flex items-center gap-2 px-6 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-transform disabled:opacity-50"
              >
                {submitting && (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    progress_activity
                  </span>
                )}
                Confirmar Asignación
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
