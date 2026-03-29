"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    setVisible(false)
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className="transition-opacity duration-150"
      style={{ opacity: visible ? 1 : 0 }}
    >
      {children}
    </div>
  )
}
