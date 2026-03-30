"use client"

import { useEffect, useState } from "react"

interface LevelUpNotification {
  id: string
  title: string
  body: string
}

export function useLevelUpCheck() {
  const [queue, setQueue] = useState<LevelUpNotification[]>([])

  useEffect(() => {
    fetch("/api/me/notifications/level-up")
      .then((r) => r.json())
      .then(({ notifications }: { notifications: LevelUpNotification[] }) => {
        if (notifications?.length > 0) {
          setQueue(notifications)
        }
      })
      .catch(() => {})
  }, [])

  function dismissCurrent() {
    setQueue((q) => q.slice(1))
  }

  // Parse level from notification body — "Has alcanzado el nivel 5. ¡Sigue así!"
  function parseLevelFromBody(body: string): number {
    const match = body.match(/nivel\s+(\d+)/i)
    return match ? parseInt(match[1], 10) : 0
  }

  const current = queue[0] ?? null
  const currentLevel = current ? parseLevelFromBody(current.body) : null

  return { current, currentLevel, dismissCurrent }
}
