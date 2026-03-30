import type { Metadata } from "next"
import { Manrope, Inter, Geist } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { cookies } from "next/headers"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import "./globals.css"
import { cn } from "@/lib/utils"
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper"
import { OrgContextProvider } from "@/contexts/OrgContext"
import { prisma } from "@/lib/prisma"
import type { OrgInfo } from "@/contexts/OrgContext"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-manrope",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Work Leveling",
  description: "Panel Corporativo Gamificado — Executive Atelier Design System",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let userOrgs: OrgInfo[] = []
  let selectedOrgId: string | null = null
  const messages = await getMessages()

  try {
    const { userId } = await auth()
    if (userId) {
      const cookieStore = await cookies()
      selectedOrgId = cookieStore.get("selected-org-id")?.value ?? null

      const dbUser = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        include: {
          orgRoles: {
            where: { confirmed: true },
            include: { organization: true },
          },
        },
      })

      if (dbUser) {
        userOrgs = dbUser.orgRoles.map((r) => ({
          id: r.organization.id,
          name: r.organization.name,
          slug: r.organization.slug,
          plan: r.organization.plan,
          role: r.role,
        }))
        // Auto-select first org if no cookie set
        if (!selectedOrgId && userOrgs.length > 0) {
          selectedOrgId = userOrgs[0].id
        }
      }
    }
  } catch {
    // Not authenticated or DB unavailable — proceed with empty context
  }

  return (
    <ClerkProvider>
      <html lang="es" className={cn("dark", "font-sans", geist.variable)}>
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </head>
        <body className={`${manrope.variable} ${inter.variable} font-body`}>
          <NextIntlClientProvider messages={messages}>
            <OrgContextProvider initialOrgId={selectedOrgId} initialOrgs={userOrgs}>
              <PageTransitionWrapper>{children}</PageTransitionWrapper>
            </OrgContextProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
