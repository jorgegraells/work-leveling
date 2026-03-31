"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

export default function NotificationBell() {
  const t = useTranslations("notificaciones")
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/notificaciones?count=true")
        if (res.status === 404) return
        if (!res.ok) return
        const data = await res.json()
        setUnread(data.unread ?? 0)
      } catch {
        // network error — silent fail
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <Link
      href="/notificaciones"
      className="relative p-1.5 text-outline hover:text-on-surface transition-colors flex-shrink-0 bg-surface-container-high rounded-md active:scale-95"
      aria-label={t("ariaLabel")}
    >
      <span className="material-symbols-outlined text-lg">notifications</span>
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-error text-on-error text-[9px] font-bold flex items-center justify-center leading-none">
          {unread > 99 ? "99+" : unread}
        </span>
      )}
    </Link>
  )
}
