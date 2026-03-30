"use client"

import { useState, useRef } from "react"
import { useUser } from "@clerk/nextjs"

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
  const { user: clerkUser } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [name, setName] = useState(user.name)
  const [title, setTitle] = useState(user.title ?? "")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !clerkUser) return
    setUploading(true)
    setUploadError(null)
    try {
      await clerkUser.setProfileImage({ file })
      await clerkUser.reload()
      await fetch('/api/me/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: clerkUser.imageUrl }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setUploadError('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

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
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-outline-variant/20 bg-surface-container-lowest">
                  {(clerkUser?.imageUrl || user.avatarUrl) ? (
                    <img src={clerkUser?.imageUrl ?? user.avatarUrl ?? ''} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-outline">person</span>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {uploading ? (
                    <span className="material-symbols-outlined text-white animate-spin">refresh</span>
                  ) : (
                    <span className="material-symbols-outlined text-white">photo_camera</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-on-surface">Foto de perfil</p>
                <p className="text-[11px] text-outline mt-0.5">Haz clic para cambiar · JPG, PNG, GIF</p>
                {uploadError && <p className="text-[11px] text-error mt-1">{uploadError}</p>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
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
