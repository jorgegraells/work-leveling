"use client"

import { useState } from "react"

interface SettingsProps {
  user: {
    id: string
    name: string
    email: string
    title: string | null
    avatarUrl: string | null
  }
}

export default function Settings({ user }: SettingsProps) {
  const [name, setName] = useState(user.name)
  const [title, setTitle] = useState(user.title ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch("/api/me/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, title }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? "Error al guardar")
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[1600px] mx-auto">
      <h1 className="font-headline text-2xl font-bold mb-8">Configuracion</h1>

      {/* Wood-bezel card */}
      <div className="rounded-xl bg-surface-container-highest p-1 max-w-2xl shadow-card">
        <div className="rounded-lg bg-surface-bright p-6 space-y-6">
          {/* Avatar section */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-container-lowest flex items-center justify-center overflow-hidden border border-outline-variant/15">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-3xl text-outline">
                  person
                </span>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-outline">
                Avatar
              </p>
              <p className="text-xs text-on-surface-variant mt-1">
                Cambiar avatar proximamente
              </p>
            </div>
          </div>

          {/* Divider via color shift */}
          <div className="h-px bg-surface-container-highest" />

          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Nombre
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface rounded-md px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/50 border border-outline-variant/15"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Titulo
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Architect of the Atelier"
              className="w-full bg-surface-container-lowest text-on-surface rounded-md px-4 py-2.5 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary/50 border border-outline-variant/15 placeholder:text-outline/50"
            />
          </div>

          {/* Email (readonly) */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-outline">
              Email
            </label>
            <input
              type="email"
              value={user.email}
              readOnly
              className="w-full bg-surface-container-lowest text-on-surface-variant rounded-md px-4 py-2.5 text-sm font-body opacity-50 cursor-not-allowed border border-outline-variant/15"
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-surface-container-highest" />

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary rounded-md px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            {saved && (
              <span className="text-secondary text-xs font-medium">
                Guardado correctamente
              </span>
            )}

            {error && (
              <span className="text-error text-xs font-medium">{error}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
