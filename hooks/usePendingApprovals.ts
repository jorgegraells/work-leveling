"use client"

import { useState, useEffect } from "react"

export function usePendingApprovals() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/admin/estadisticas")
        if (res.ok) {
          const data = await res.json()
          setCount(data.pendingApprovals ?? 0)
        }
      } catch {
        // ignore
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => clearInterval(interval)
  }, [])

  return { count }
}
