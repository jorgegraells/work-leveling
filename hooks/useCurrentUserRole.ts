"use client"

import { useEffect, useState } from "react"

interface RoleData {
  role: string | null
  isSuperAdmin: boolean
  orgId: string | null
}

// Module-level cache so the fetch only happens once per page load
let cache: RoleData | null = null
let fetchPromise: Promise<RoleData> | null = null

async function fetchRole(): Promise<RoleData> {
  if (cache) return cache
  if (!fetchPromise) {
    fetchPromise = fetch("/api/me/role")
      .then((res) => res.json())
      .then((data: RoleData) => {
        cache = data
        return data
      })
      .catch(() => {
        fetchPromise = null
        return { role: null, isSuperAdmin: false, orgId: null }
      })
  }
  return fetchPromise
}

export function useCurrentUserRole() {
  const [data, setData] = useState<RoleData>({
    role: null,
    isSuperAdmin: false,
    orgId: null,
  })
  const [loading, setLoading] = useState(!cache)

  useEffect(() => {
    if (cache) {
      setData(cache)
      setLoading(false)
      return
    }
    fetchRole().then((result) => {
      setData(result)
      setLoading(false)
    })
  }, [])

  return { role: data.role, isSuperAdmin: data.isSuperAdmin, loading }
}
