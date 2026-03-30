import { headers } from "next/headers"
import { Webhook } from "svix"
import { prisma } from "@/lib/prisma"

// ---------------------------------------------------------------------------
// Clerk webhook types (subset we care about)
// ---------------------------------------------------------------------------

interface ClerkUserCreatedEvent {
  type: "user.created"
  data: {
    id: string
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string | null
  }
}

interface ClerkUserUpdatedEvent {
  type: "user.updated"
  data: {
    id: string
    image_url: string | null
    first_name: string | null
    last_name: string | null
    email_addresses: { email_address: string; id: string }[]
    primary_email_address_id: string
  }
}

type ClerkEvent = ClerkUserCreatedEvent | ClerkUserUpdatedEvent | { type: string; data: unknown }

// ---------------------------------------------------------------------------
// Default attributes every new user gets (value = 0)
// Colors must match design-token names used in the components
// ---------------------------------------------------------------------------

const DEFAULT_ATTRIBUTES = [
  { key: "logica",        label: "Lógica",        color: "primary",                side: "left"  },
  { key: "creatividad",   label: "Creatividad",    color: "tertiary",               side: "left"  },
  { key: "liderazgo",     label: "Liderazgo",      color: "secondary",              side: "left"  },
  { key: "negociacion",   label: "Negociación",    color: "on-tertiary-container",  side: "left"  },
  { key: "estrategia",    label: "Estrategia",     color: "primary",                side: "right" },
  { key: "analisis",      label: "Análisis",       color: "tertiary",               side: "right" },
  { key: "comunicacion",  label: "Comunicación",   color: "secondary",              side: "right" },
  { key: "adaptabilidad", label: "Adaptabilidad",  color: "on-tertiary-container",  side: "right" },
]

// ---------------------------------------------------------------------------
// POST /api/webhooks/clerk
// ---------------------------------------------------------------------------

export async function POST(req: Request) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error("CLERK_WEBHOOK_SECRET is not set")
    return new Response("Webhook secret not configured", { status: 500 })
  }

  // Verify signature with svix
  const headerPayload = await headers()
  const svixId        = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const body = await req.text()
  const wh   = new Webhook(webhookSecret)

  let event: ClerkEvent
  try {
    event = wh.verify(body, {
      "svix-id":        svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  // Handle user.updated — sync avatar and name
  if (event.type === "user.updated") {
    const { data } = event as ClerkUserUpdatedEvent
    const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || undefined
    await prisma.user.updateMany({
      where: { clerkUserId: data.id },
      data: {
        ...(data.image_url !== undefined ? { avatarUrl: data.image_url } : {}),
        ...(name ? { name } : {}),
      },
    })
    return new Response("User updated", { status: 200 })
  }

  // Only handle user.created for the rest
  if (event.type !== "user.created") {
    return new Response("OK", { status: 200 })
  }

  const { data } = event as ClerkUserCreatedEvent

  // Derive email and name
  const primaryEmail = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id
  )?.email_address

  if (!primaryEmail) {
    return new Response("No primary email found", { status: 400 })
  }

  const name = [data.first_name, data.last_name].filter(Boolean).join(" ") || primaryEmail.split("@")[0]

  // Check if this user should be the super admin
  const isSuperAdmin = !!process.env.SUPER_ADMIN_EMAIL && primaryEmail === process.env.SUPER_ADMIN_EMAIL

  try {
    await prisma.$transaction(async (tx) => {
      let organizationId: string | undefined = undefined

      if (!isSuperAdmin) {
        // 1. Create a personal organization for regular users
        const orgSlug = `org-${data.id.slice(-8).toLowerCase()}`
        const org = await tx.organization.create({
          data: {
            clerkOrgId: `personal_${data.id}`,
            name:       `${name}'s Org`,
            slug:       orgSlug,
          },
        })
        organizationId = org.id
      }

      // 2. Create the user record
      const user = await tx.user.create({
        data: {
          clerkUserId:    data.id,
          email:          primaryEmail,
          name,
          avatarUrl:      data.image_url,
          title:          isSuperAdmin ? "Super Admin" : "Executive",
          level:          1,
          xp:             0,
          xpToNextLevel:  1000,
          trophies:       0,
          kredits:        0,
          isSuperAdmin,
          ...(organizationId ? { organizationId } : {}),
        },
      })

      // 3. Upsert global attributes and assign them to the user with value 0
      for (const attr of DEFAULT_ATTRIBUTES) {
        const attribute = await tx.attribute.upsert({
          where:  { key: attr.key },
          update: {},
          create: attr,
        })

        await tx.userAttribute.create({
          data: {
            userId:      user.id,
            attributeId: attribute.id,
            value:       0,
          },
        })
      }
    })

    return new Response("User created", { status: 201 })
  } catch (err) {
    console.error("Error creating user in DB:", err)
    return new Response("Internal server error", { status: 500 })
  }
}
