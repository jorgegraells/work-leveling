"use client"

import Link from "next/link"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        return (
          <span key={index} className="flex items-center gap-1">
            {index > 0 && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">
                /
              </span>
            )}
            {isLast || !item.href ? (
              <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-[10px] font-bold uppercase tracking-widest text-outline hover:text-on-surface transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
