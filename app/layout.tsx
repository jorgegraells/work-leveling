import type { Metadata } from "next"
import { Manrope, Inter, Geist } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"
import { cn } from "@/lib/utils"
import PageTransitionWrapper from "@/components/layout/PageTransitionWrapper"

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="es" className={cn("dark", "font-sans", geist.variable)}>
        <head>
          {/* Material Symbols variable font — required by all screen components */}
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          />
        </head>
        <body className={`${manrope.variable} ${inter.variable} font-body`}>
          <PageTransitionWrapper>{children}</PageTransitionWrapper>
        </body>
      </html>
    </ClerkProvider>
  )
}
