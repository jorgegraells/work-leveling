"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

// After sign-up Clerk redirects here.
// We poll until the webhook has created the DB user, then send to /perfil.
export default function OnboardingClient() {
  const router = useRouter()
  const t = useTranslations("onboarding")
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const dotsInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."))
    }, 400)

    let attempts = 0
    const maxAttempts = 20 // ~10 seconds

    const poll = async () => {
      try {
        const res = await fetch("/api/me/ready")
        if (res.ok) {
          clearInterval(dotsInterval)
          router.replace("/perfil")
          return
        }
      } catch {
        // ignore
      }

      attempts++
      if (attempts < maxAttempts) {
        setTimeout(poll, 500)
      } else {
        // Webhook took too long — send anyway, page will handle it
        clearInterval(dotsInterval)
        router.replace("/perfil")
      }
    }

    setTimeout(poll, 800) // small initial delay to let webhook arrive

    return () => clearInterval(dotsInterval)
  }, [router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface gap-6">
      <div className="w-16 h-16 rounded-2xl bg-surface-container-highest flex items-center justify-center shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
        <span
          className="material-symbols-outlined text-3xl text-primary animate-spin"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          progress_activity
        </span>
      </div>
      <div className="text-center space-y-1">
        <p className="text-on-surface font-headline font-bold text-lg">
          {`${t("preparing")}${dots}`}
        </p>
        <p className="text-outline text-sm">{t("moment")}</p>
      </div>
    </div>
  )
}
