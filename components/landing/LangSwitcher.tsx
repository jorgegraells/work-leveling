"use client"
import { useLandingLang } from "./LandingContext"

export default function LangSwitcher() {
  const { lang, setLang } = useLandingLang()
  return (
    <div className="fixed top-6 right-6 z-50 flex gap-1 p-1 rounded-lg bg-surface-container-highest/80 backdrop-blur-sm">
      <button
        onClick={() => setLang("es")}
        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${
          lang === "es" ? "bg-primary text-on-primary" : "text-outline hover:text-on-surface"
        }`}
      >
        ES
      </button>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors ${
          lang === "en" ? "bg-primary text-on-primary" : "text-outline hover:text-on-surface"
        }`}
      >
        EN
      </button>
    </div>
  )
}
