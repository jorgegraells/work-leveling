import type { Metadata } from "next"
import OnboardingClient from "./OnboardingClient"

export const metadata: Metadata = { title: "Bienvenido | Work Leveling", description: "Configurando tu cuenta" }

export default function OnboardingPage() {
  return <OnboardingClient />
}
