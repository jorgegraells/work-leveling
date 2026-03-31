"use client"
import { createContext, useContext, useState, ReactNode } from "react"

type Lang = "es" | "en"
const LandingLangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: "es", setLang: () => {} })

export function LandingLangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("es")
  return <LandingLangContext.Provider value={{ lang, setLang }}>{children}</LandingLangContext.Provider>
}

export function useLandingLang() { return useContext(LandingLangContext) }
export type { Lang }
