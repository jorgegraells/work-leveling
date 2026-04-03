import { NextResponse } from "next/server"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function POST() {
  const user = await requireCurrentUser()
  if (!user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const attributes = [
    { key: "logica",        label: "Lógica",         color: "primary",               side: "left"  },
    { key: "creatividad",   label: "Creatividad",     color: "tertiary",              side: "left"  },
    { key: "liderazgo",     label: "Liderazgo",       color: "secondary",             side: "left"  },
    { key: "negociacion",   label: "Negociación",     color: "on-tertiary-container", side: "left"  },
    { key: "estrategia",    label: "Estrategia",      color: "outline",               side: "right" },
    { key: "analisis",      label: "Análisis",        color: "tertiary",              side: "right" },
    { key: "comunicacion",  label: "Comunicación",    color: "secondary",             side: "right" },
    { key: "adaptabilidad", label: "Adaptabilidad",   color: "primary",               side: "right" },
  ]

  const results = await Promise.all(
    attributes.map((attr) =>
      prisma.attribute.upsert({
        where: { key: attr.key },
        update: { label: attr.label, color: attr.color, side: attr.side },
        create: attr,
      })
    )
  )

  return NextResponse.json({ seeded: results.length, attributes: results })
}
