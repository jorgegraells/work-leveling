import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Start seeding...")

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { slug: "tech-corp" },
    update: {},
    create: {
      name: "Tech Corp",
      slug: "tech-corp",
      clerkOrgId: "org_sample_123", // Dummy ID
    },
  })

  // 2. Create User "Steve Smith"
  const user = await prisma.user.upsert({
    where: { email: "steve.smith@example.com" },
    update: {},
    create: {
      email: "steve.smith@example.com",
      clerkUserId: "user_sample_123", // Dummy string, real log in will create another logic later or update this
      name: "Steve Smith",
      title: "Senior QA Engineer",
      level: 42,
      kredits: 2500,
      organizationId: org.id,
    },
  })

  // 3. Create Attributes
  const attributesData = [
    { key: "logic", label: "Lógica", color: "#FF3B30", side: "LEFT" },
    { key: "memory", label: "Memoria", color: "#FF9500", side: "LEFT" },
    { key: "focus", label: "Enfoque", color: "#4CD964", side: "LEFT" },
    { key: "creativity", label: "Creatividad", color: "#5AC8FA", side: "LEFT" },
    { key: "leadership", label: "Liderazgo", color: "#007AFF", side: "RIGHT" },
    { key: "teamwork", label: "Trabajo en Eq.", color: "#5856D6", side: "RIGHT" },
    { key: "communication", label: "Comunicación", color: "#FF2D55", side: "RIGHT" },
    { key: "problem_solving", label: "Resolución", color: "#E5E5EA", side: "RIGHT" },
  ]

  for (const attr of attributesData) {
    const attribute = await prisma.attribute.upsert({
      where: { key: attr.key },
      update: {},
      create: attr,
    })

    // Assign to Steve Smith with values replicating the mockup
    const mockupValues: Record<string, number> = {
      "logic": 85,
      "memory": 60,
      "focus": 40,
      "creativity": 30,
      "leadership": 50,
      "teamwork": 75,
      "communication": 65,
      "problem_solving": 90,
    }
    
    await prisma.userAttribute.upsert({
      where: {
        userId_attributeId: {
          userId: user.id,
          attributeId: attribute.id,
        }
      },
      update: {
        value: mockupValues[attr.key]
      },
      create: {
        userId: user.id,
        attributeId: attribute.id,
        value: mockupValues[attr.key],
      }
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
