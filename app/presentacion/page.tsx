import { LandingLangProvider } from "@/components/landing/LandingContext"
import LangSwitcher from "@/components/landing/LangSwitcher"
import LandingPage from "@/components/landing/LandingPage"
import LandingData from "@/components/landing/LandingData"
import LandingBottom from "@/components/landing/LandingBottom"

export default function PublicPage() {
  return (
    <LandingLangProvider>
      <LangSwitcher />
      <LandingPage />
      <LandingData />
      <LandingBottom />
    </LandingLangProvider>
  )
}
