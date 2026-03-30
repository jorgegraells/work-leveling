"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"

export interface OrgInfo {
  id: string
  name: string
  slug: string
  plan: string
  role: string
}

interface OrgContextType {
  currentOrgId: string | null
  currentOrg: OrgInfo | null
  orgs: OrgInfo[]
  setCurrentOrg: (orgId: string) => Promise<void>
}

const OrgContext = createContext<OrgContextType>({
  currentOrgId: null,
  currentOrg: null,
  orgs: [],
  setCurrentOrg: async () => {},
})

export function OrgContextProvider({
  children,
  initialOrgId,
  initialOrgs,
}: {
  children: ReactNode
  initialOrgId: string | null
  initialOrgs: OrgInfo[]
}) {
  const router = useRouter()
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(initialOrgId)
  const [orgs] = useState<OrgInfo[]>(initialOrgs)

  const currentOrg = orgs.find((o) => o.id === currentOrgId) ?? null

  const setCurrentOrg = useCallback(
    async (orgId: string) => {
      await fetch("/api/me/org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId }),
      })
      setCurrentOrgId(orgId)
      router.refresh()
    },
    [router]
  )

  return (
    <OrgContext.Provider value={{ currentOrgId, currentOrg, orgs, setCurrentOrg }}>
      {children}
    </OrgContext.Provider>
  )
}

export const useOrg = () => useContext(OrgContext)
