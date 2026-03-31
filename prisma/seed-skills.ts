import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const SKILLS = [
  { name: "C++",              slug: "cpp",                icon: "code",            color: "tertiary" },
  { name: "Python",           slug: "python",             icon: "code",            color: "secondary" },
  { name: "JavaScript",       slug: "javascript",         icon: "code",            color: "primary" },
  { name: "TypeScript",       slug: "typescript",         icon: "code",            color: "tertiary" },
  { name: "SQL",              slug: "sql",                icon: "database",        color: "on-tertiary-container" },
  { name: "Excel",            slug: "excel",              icon: "table_chart",     color: "secondary" },
  { name: "Sage",             slug: "sage",               icon: "account_balance", color: "primary" },
  { name: "SAP",              slug: "sap",                icon: "inventory",       color: "outline" },
  { name: "Leadership",       slug: "leadership",         icon: "groups",          color: "primary" },
  { name: "Communication",    slug: "communication",      icon: "campaign",        color: "secondary" },
  { name: "Strategy",         slug: "strategy",           icon: "psychology",      color: "primary" },
  { name: "Negotiation",      slug: "negotiation",        icon: "handshake",       color: "tertiary" },
  { name: "Data Analysis",    slug: "data-analysis",      icon: "analytics",       color: "on-tertiary-container" },
  { name: "Project Management", slug: "project-management", icon: "account_tree",  color: "tertiary" },
]

async function main() {
  console.log("Seeding skills...")

  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: {},
      create: skill,
    })
    console.log(`  - ${skill.name}`)
  }

  console.log("Skills seeded successfully.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
