"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { Plan } from "@prisma/client"

interface EmpresaFormProps {
  mode: "create" | "edit"
  initialData?: {
    id: string
    name: string
    slug: string
    plan: Plan
    seats: number
    logoUrl?: string | null
    clerkOrgId?: string
  }
}

const PLAN_COLORS: Record<Plan, string> = {
  FREE:         "text-outline border-outline/30 bg-outline/5",
  STARTER:      "text-secondary border-secondary/30 bg-secondary/5",
  PROFESSIONAL: "text-tertiary border-tertiary/30 bg-tertiary/5",
  ENTERPRISE:   "text-primary border-primary/30 bg-primary/5",
}

export default function EmpresaForm({ mode, initialData }: EmpresaFormProps) {
  const router = useRouter()
  const t = useTranslations("empresas")
  const tCommon = useTranslations("common")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState(initialData?.name ?? "")
  const [slug, setSlug] = useState(initialData?.slug ?? "")
  const [plan, setPlan] = useState<Plan>(initialData?.plan ?? "FREE")
  const [seats, setSeats] = useState(String(initialData?.seats ?? 5))
  const [clerkOrgId, setClerkOrgId] = useState(initialData?.clerkOrgId ?? "")

  const PLANS: { value: Plan; label: string; description: string }[] = [
    { value: "FREE",         label: tCommon("planFree"),         description: t("planFreeDesc") },
    { value: "STARTER",      label: tCommon("planStarter"),      description: t("planStarterDesc") },
    { value: "PROFESSIONAL", label: tCommon("planProfessional"), description: t("planProDesc") },
    { value: "ENTERPRISE",   label: tCommon("planEnterprise"),   description: t("planEnterpriseDesc") },
  ]

  // Auto-generate slug from name (only in create mode)
  const handleNameChange = (val: string) => {
    setName(val)
    if (mode === "create") {
      setSlug(
        val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      )
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url =
        mode === "create"
          ? "/api/admin/empresas"
          : `/api/admin/empresas/${initialData!.id}`

      const method = mode === "create" ? "POST" : "PATCH"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          plan,
          seats: parseInt(seats, 10),
          ...(mode === "create" && { clerkOrgId }),
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Error ${res.status}`)
      }

      const org = await res.json()
      router.push(`/admin/empresas/${org.id}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("unknownError"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface font-body text-on-surface px-6 py-8 max-w-[800px] mx-auto">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => router.back()}
            className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            Admin
          </button>
          <span className="text-outline/40">/</span>
          <button
            onClick={() => router.push("/admin/empresas")}
            className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-primary transition-colors"
          >
            {t("breadcrumb")}
          </button>
          <span className="text-outline/40">/</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
            {mode === "create" ? t("formNew") : t("formEdit")}
          </span>
        </div>
        <h1 className="font-headline text-2xl font-bold text-on-surface">
          {mode === "create" ? t("formNewTitle") : t("formEditTitle", { name: initialData?.name ?? "" })}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
          <div className="rounded-lg bg-surface-bright p-6 space-y-6">
            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-error-container/30 border border-error/20">
                <span className="material-symbols-outlined text-error text-base">error</span>
                <p className="text-[12px] text-error">{error}</p>
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                {t("fieldName")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="Acme Corp"
                className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-[13px] text-on-surface placeholder:text-outline/40 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>

            {/* Slug */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                {t("fieldSlug")}
              </label>
              <div className="flex items-center bg-surface-container-lowest rounded-lg overflow-hidden focus-within:ring-1 focus-within:ring-primary/40 transition-all">
                <span className="px-3 text-[11px] text-outline/60 select-none">workleveling.app/org/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                  pattern="[a-z0-9-]+"
                  title={t("fieldSlugValidation")}
                  placeholder="acme-corp"
                  className="flex-1 bg-transparent py-3 pr-4 text-[13px] text-on-surface placeholder:text-outline/40 outline-none"
                />
              </div>
              <p className="text-[10px] text-outline/60 mt-1.5">
                {t("fieldSlugHint")}
              </p>
            </div>

            {/* Clerk Org ID (only in create mode) */}
            {mode === "create" && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                  {t("fieldClerkOrgId")}
                </label>
                <input
                  type="text"
                  value={clerkOrgId}
                  onChange={(e) => setClerkOrgId(e.target.value)}
                  required
                  placeholder="org_xxxxxxxxxxxxxxxxxx"
                  className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-[13px] text-on-surface placeholder:text-outline/40 outline-none focus:ring-1 focus:ring-primary/40 transition-all font-mono"
                />
                <p className="text-[10px] text-outline/60 mt-1.5">
                  {t("fieldClerkOrgIdHint")}
                </p>
              </div>
            )}

            {/* Plan */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-3">
                {t("fieldPlan")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PLANS.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPlan(p.value)}
                    className={`text-left p-3 rounded-lg border transition-all active:scale-[0.98] ${
                      plan === p.value
                        ? PLAN_COLORS[p.value]
                        : "border-outline/10 bg-surface-container-lowest text-outline hover:border-outline/30"
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-widest">{p.label}</p>
                    <p className="text-[10px] mt-0.5 opacity-70">{p.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-outline mb-2">
                {t("fieldSeats")}
              </label>
              <input
                type="number"
                min={1}
                max={9999}
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                required
                className="w-full bg-surface-container-lowest rounded-lg px-4 py-3 text-[13px] text-on-surface placeholder:text-outline/40 outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded-md text-outline hover:bg-surface-container-high text-[10px] font-bold uppercase tracking-widest transition-colors active:scale-95"
          >
            {t("cancelButton")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading && (
              <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
            )}
            {mode === "create" ? t("createButton") : t("saveButton")}
          </button>
        </div>
      </form>
    </div>
  )
}
