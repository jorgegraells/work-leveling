"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import type { NotificationType } from "@prisma/client"

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  data: Record<string, unknown> | null
  createdAt: string
}

const TYPE_ICON: Record<NotificationType, string> = {
  MISSION_COMPLETED: "check_circle",
  MISSION_APPROVED: "verified",
  MISSION_REJECTED: "cancel",
  MISSION_ASSIGNED: "assignment",
  LEVEL_UP: "arrow_upward",
  SKILL_LEVEL_UP: "trending_up",
  DUE_SOON: "alarm",
  DEADLINE_CRITICAL: "alarm_on",
  OVERDUE: "alarm_off",
  MISSION_OBJECTIVE_APPROVED: "task_alt",
  MISSION_OBJECTIVE_REJECTED: "unpublished",
}

const TYPE_COLOR: Record<NotificationType, string> = {
  MISSION_COMPLETED: "text-tertiary",
  MISSION_APPROVED: "text-secondary",
  MISSION_REJECTED: "text-error",
  MISSION_ASSIGNED: "text-primary",
  LEVEL_UP: "text-primary",
  SKILL_LEVEL_UP: "text-secondary",
  DUE_SOON: "text-primary",
  DEADLINE_CRITICAL: "text-error",
  OVERDUE: "text-error",
  MISSION_OBJECTIVE_APPROVED: "text-secondary",
  MISSION_OBJECTIVE_REJECTED: "text-error",
}

function timeAgo(dateStr: string, t: (key: string, values?: Record<string, number>) => string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return t("justNow")
  if (mins < 60) return t("minutesAgo", { mins })
  const hours = Math.floor(mins / 60)
  if (hours < 24) return t("hoursAgo", { hours })
  const days = Math.floor(hours / 24)
  if (days < 30) return t("daysAgo", { days })
  return t("monthsAgo", { months: Math.floor(days / 30) })
}

export default function Notificaciones({
  notifications: initialNotifications,
  hasMore: initialHasMore = false,
}: {
  notifications: NotificationItem[]
  hasMore?: boolean
}) {
  const router = useRouter()
  const t = useTranslations("notificaciones")
  const [notifications, setNotifications] = useState(initialNotifications)
  const [markingAll, setMarkingAll] = useState(false)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const [loadingMore, setLoadingMore] = useState(false)

  async function fetchMore() {
    setLoadingMore(true)
    try {
      const res = await fetch(`/api/notificaciones?skip=${notifications.length}&take=20`)
      if (res.ok) {
        const data = await res.json()
        const newItems: NotificationItem[] = data.notifications ?? []
        setNotifications((prev) => [...prev, ...newItems])
        setHasMore(newItems.length === 20)
      }
    } catch {
      // silent fail
    } finally {
      setLoadingMore(false)
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  async function markAllRead() {
    setMarkingAll(true)
    try {
      const res = await fetch("/api/notificaciones", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
        router.refresh()
      }
    } catch {
      // silent fail
    } finally {
      setMarkingAll(false)
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg bg-surface-bright p-12 text-center">
          <span className="material-symbols-outlined text-4xl text-outline mb-4 block">
            notifications_off
          </span>
          <p className="text-on-surface font-body text-sm">
            {t("empty")}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mark all read button */}
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button
            onClick={markAllRead}
            disabled={markingAll}
            className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-on-surface transition-colors disabled:opacity-50"
          >
            {markingAll ? t("markingAll") : t("markAllRead", { count: unreadCount })}
          </button>
        </div>
      )}

      {/* Notification list */}
      <div className="rounded-xl bg-surface-container-highest p-1">
        <div className="rounded-lg overflow-hidden divide-y divide-outline-variant/15">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 flex items-start gap-4 transition-colors ${
                notif.read ? "bg-surface" : "bg-surface-container-high"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                <span
                  className={`material-symbols-outlined text-xl ${TYPE_COLOR[notif.type]}`}
                  style={
                    !notif.read
                      ? { fontVariationSettings: "'FILL' 1" }
                      : undefined
                  }
                >
                  {TYPE_ICON[notif.type]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3
                    className={`text-sm font-body ${
                      notif.read
                        ? "text-on-surface-variant font-normal"
                        : "text-on-surface font-semibold"
                    }`}
                  >
                    {notif.title}
                  </h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1 whitespace-pre-line">
                  {notif.body}
                </p>
              </div>
              <span className="text-[10px] text-outline flex-shrink-0 mt-1">
                {timeAgo(notif.createdAt, t)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center">
          <button
            onClick={fetchMore}
            disabled={loadingMore}
            className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-on-surface bg-surface-container-highest rounded-md hover:bg-surface-container-high transition-colors disabled:opacity-50 active:scale-95"
          >
            {loadingMore ? "Cargando..." : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  )
}
