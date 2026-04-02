"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

interface LevelUpModalProps {
  level: number
  onClose: () => void
}

export default function LevelUpModal({ level, onClose }: LevelUpModalProps) {
  const t = useTranslations("levelUp")
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation on next frame
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, 400)
  }

  return (
    <div
      className={`fixed inset-0 z-[200] flex items-center justify-center transition-opacity duration-300 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Card */}
      <div
        className={`relative z-10 flex flex-col items-center gap-6 px-12 py-10 rounded-2xl bg-surface-container-highest border border-primary/30 shadow-[0_0_80px_rgba(233,196,0,0.25)] transition-all duration-500 ${
          visible ? "scale-100 opacity-100 translate-y-0" : "scale-75 opacity-0 translate-y-8"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none level-up-glow" />

        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
          <span
            className="material-symbols-outlined text-primary text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            military_tech
          </span>
        </div>

        {/* Label */}
        <div className="text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-outline mb-2">
            {t("title")}
          </p>
          <p className="font-headline text-8xl font-black text-primary leading-none level-up-number">
            {level}
          </p>
          <p className="text-outline text-xs mt-3 uppercase tracking-widest">
            {t("subtitle")}
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="mt-2 px-8 py-2.5 rounded-md bg-primary text-on-primary font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform hover:brightness-110"
        >
          {t("continue")}
        </button>
      </div>
    </div>
  )
}
