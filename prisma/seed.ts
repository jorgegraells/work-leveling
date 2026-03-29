import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Attributes must match DEFAULT_ATTRIBUTES in /api/webhooks/clerk/route.ts
// color = design token name, side = "left" | "right" (lowercase)
const ATTRIBUTES = [
  { key: "logica",        label: "Lógica",        color: "primary",               side: "left"  },
  { key: "creatividad",   label: "Creatividad",    color: "tertiary",              side: "left"  },
  { key: "liderazgo",     label: "Liderazgo",      color: "secondary",             side: "left"  },
  { key: "negociacion",   label: "Negociación",    color: "on-tertiary-container", side: "left"  },
  { key: "estrategia",    label: "Estrategia",     color: "primary",               side: "right" },
  { key: "analisis",      label: "Análisis",       color: "tertiary",              side: "right" },
  { key: "comunicacion",  label: "Comunicación",   color: "secondary",             side: "right" },
  { key: "adaptabilidad", label: "Adaptabilidad",  color: "on-tertiary-container", side: "right" },
]

// Demo values matching the Stitch screens
const STEVE_VALUES: Record<string, number> = {
  logica:        85,
  creatividad:   92,
  liderazgo:     78,
  negociacion:   65,
  estrategia:    89,
  analisis:      74,
  comunicacion:  81,
  adaptabilidad: 95,
}

async function main() {
  console.log("Start seeding...")

  // 1. Organization
  const org = await prisma.organization.upsert({
    where:  { slug: "tech-corp" },
    update: {},
    create: {
      name:       "Tech Corp",
      slug:       "tech-corp",
      clerkOrgId: "org_sample_123",
    },
  })

  // 2. User Steve Smith (demo — clerkUserId gets updated on first real login)
  const user = await prisma.user.upsert({
    where:  { email: "steve.smith@example.com" },
    update: {},
    create: {
      email:          "steve.smith@example.com",
      clerkUserId:    "user_sample_123",
      name:           "Steve Smith",
      title:          "Architect of the Atelier",
      level:          42,
      xp:             720,
      xpToNextLevel:  1000,
      trophies:       14,
      kredits:        8400,
      organizationId: org.id,
    },
  })

  // 3. Attributes + UserAttributes
  for (const attr of ATTRIBUTES) {
    const attribute = await prisma.attribute.upsert({
      where:  { key: attr.key },
      update: { label: attr.label, color: attr.color, side: attr.side },
      create: attr,
    })

    await prisma.userAttribute.upsert({
      where: { userId_attributeId: { userId: user.id, attributeId: attribute.id } },
      update: { value: STEVE_VALUES[attr.key] },
      create: { userId: user.id, attributeId: attribute.id, value: STEVE_VALUES[attr.key] },
    })
  }

  // 4. Sample completed missions for "Misiones Recientes" on the dashboard
  const missions = [
    {
      title:       "Operación Horizonte Dorado",
      description: "Estrategia de mercado expansiva para el segmento A1",
      module:      "ALIANZAS_CONTRATOS" as const,
      icon:        "rocket_launch",
      xpReward:    2400,
      priority:    "ALTA",
      isGlobal:    true,
    },
    {
      title:       "Sincronización de Nodos",
      description: "Análisis y alineación de alianzas estratégicas",
      module:      "PROYECTOS_CRONOGRAMA" as const,
      icon:        "hub",
      xpReward:    1150,
      priority:    "NORMAL",
      isGlobal:    true,
    },
    {
      title:       "Protocolo de Resiliencia",
      description: "Gestión integral de riesgos operativos",
      module:      "INFORMES_CUMPLIMIENTO" as const,
      icon:        "shield",
      xpReward:    3800,
      priority:    "ALTA",
      isGlobal:    true,
    },
  ]

  for (const m of missions) {
    const mission = await prisma.mission.upsert({
      where:  { id: `seed-${m.module.toLowerCase()}` },
      update: {},
      create: { id: `seed-${m.module.toLowerCase()}`, ...m },
    })

    await prisma.userMission.upsert({
      where:  { userId_missionId: { userId: user.id, missionId: mission.id } },
      update: {},
      create: {
        userId:      user.id,
        missionId:   mission.id,
        status:      "COMPLETED",
        progress:    100,
        completedAt: new Date(),
      },
    })
  }

  console.log("Seeding finished.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
