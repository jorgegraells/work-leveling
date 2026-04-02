import type { Metadata } from "next"
export const metadata: Metadata = { title: "Iniciar sesión | Work Leveling" }

import { SignIn } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export default async function SignInPage() {
  const { userId } = await auth()
  if (userId) redirect("/dashboard")
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface relative overflow-hidden">
      <div className="absolute inset-0 bg-primary opacity-5 blur-[100px] pointer-events-none" />
      <div className="relative z-10 p-1 wood-bezel-shadow rounded-2xl bg-surface-container-highest">
        <SignIn
          appearance={{
            elements: {
              card: "bg-surface-bright shadow-2xl rounded-xl border border-outline-variant/10",
              headerTitle: "text-on-surface font-headline font-black text-2xl uppercase tracking-tighter",
              headerSubtitle: "text-outline text-xs",
              socialButtonsBlockButton: "border-outline-variant hover:bg-surface-container-high transition-colors",
              socialButtonsBlockButtonText: "text-on-surface font-bold text-sm",
              dividerLine: "bg-outline-variant/30",
              dividerText: "text-outline",
              formFieldLabel: "text-outline font-bold text-xs uppercase tracking-widest",
              formFieldInput: "bg-surface-container-lowest border-outline-variant text-on-surface focus:border-primary focus:ring-primary/20",
              formButtonPrimary: "bg-primary text-on-primary hover:bg-primary/90 font-headline font-black uppercase tracking-widest transition-colors",
              footerActionText: "text-outline",
              footerActionLink: "text-primary hover:text-primary/80 font-bold",
            },
          }}
        />
      </div>
    </div>
  )
}
