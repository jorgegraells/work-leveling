"use client"

import { useRef, useState, useEffect } from "react"
import { useLandingLang } from "./LandingContext"
import { t } from "./LandingTranslations"

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function AnimatedNumber({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) {
  const { ref, visible } = useScrollReveal()
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!visible) return
    let current = 0
    const step = target / 50
    const timer = setInterval(() => {
      current += step
      if (current >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 25)
    return () => clearInterval(timer)
  }, [visible, target])
  return (
    <span ref={ref} className="font-headline font-black">
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Engagement trend chart (Gallup 2020-2024)
// ---------------------------------------------------------------------------

function EngagementChart() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  return (
    <div ref={ref} className="col-span-1 lg:col-span-2 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-headline font-bold text-on-surface text-lg">{s.engagementTitle}</h4>
          <span className="text-[9px] font-bold uppercase tracking-widest text-outline">{s.engagementSource}</span>
        </div>
        <p className="text-xs text-outline mb-4">{s.engagementSubtitle}</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          {s.engagementExplainer}
        </p>

        <div className="flex items-end gap-8 sm:gap-12 justify-center">
          {/* US */}
          <div className="flex flex-col items-center gap-2 w-32">
            <span className="text-3xl font-headline font-black text-primary">
              {visible ? "33%" : "\u2014"}
            </span>
            <div className="w-full flex flex-col justify-end bg-surface-container-lowest rounded-t-lg" style={{ height: 200 }}>
              <div
                className="w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: visible ? "33%" : "0%" }}
              />
            </div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{s.engagementUS}</span>
          </div>

          {/* Europe */}
          <div className="flex flex-col items-center gap-2 w-32">
            <span className="text-3xl font-headline font-black text-error">
              {visible ? "12%" : "\u2014"}
            </span>
            <div className="w-full flex flex-col justify-end bg-surface-container-lowest rounded-t-lg" style={{ height: 200 }}>
              <div
                className="w-full bg-error/70 rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: visible ? "12%" : "0%", transitionDelay: "150ms" }}
              />
            </div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">{s.engagementEurope}</span>
          </div>
        </div>

        <p className="text-[9px] text-outline mt-6 text-center max-w-lg mx-auto">
          {s.engagementFootnote} <span className="text-error font-bold">{s.engagementFootnoteHighlight}</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Europe country engagement (worst performers)
// ---------------------------------------------------------------------------

function EuropeBarChart() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const EUROPE_COUNTRIES = [
    { name: s.europeCountry0, value: 35, color: "bg-secondary" },
    { name: s.europeCountry1, value: 13, color: "bg-primary" },
    { name: s.europeCountry2, value: 9, color: "bg-error/70" },
    { name: s.europeCountry3, value: 8, color: "bg-error/70" },
    { name: s.europeCountry4, value: 8, color: "bg-error/70" },
    { name: s.europeCountry5, value: 7, color: "bg-error/70" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">{s.europeTitle}</h4>
        <p className="text-xs text-outline mb-4">{s.europeSubtitle}</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          {s.europeExplainer}
        </p>

        <div className="space-y-3">
          {EUROPE_COUNTRIES.map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-on-surface w-28 text-right truncate">{c.name}</span>
              <div className="flex-1 h-6 bg-surface-container-lowest rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${c.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: visible ? `${c.value}%` : "0%",
                    transitionDelay: `${i * 80}ms`,
                  }}
                />
              </div>
              <span className="text-[10px] font-black text-on-surface w-10">{c.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Feedback frequency impact
// ---------------------------------------------------------------------------

function FeedbackChart() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const data = [
    { label: s.feedbackLabel0, engaged: 61, color: "bg-secondary" },
    { label: s.feedbackLabel1, engaged: 38, color: "bg-primary" },
    { label: s.feedbackLabel2, engaged: 18, color: "bg-error/70" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">{s.feedbackTitle}</h4>
        <p className="text-xs text-outline mb-4">{s.feedbackSubtitle}</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          {s.feedbackExplainer}
        </p>

        <div className="flex items-end gap-6 justify-center">
          {data.map((d, i) => (
            <div key={d.label} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
              <span className="text-2xl font-headline font-black text-on-surface">
                {visible ? `${d.engaged}%` : "\u2014"}
              </span>
              <div className="w-full flex flex-col justify-end bg-surface-container-lowest rounded-t-lg" style={{ height: 160 }}>
                <div
                  className={`w-full ${d.color} rounded-t-lg transition-all duration-1000 ease-out`}
                  style={{
                    height: visible ? `${d.engaged}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
              <span className="text-[9px] font-bold text-outline text-center uppercase tracking-wider leading-tight">{d.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-outline mt-4 text-center">
          {s.feedbackFootnote}<span className="text-secondary font-bold">{s.feedbackFootnoteHighlight}</span>{s.feedbackFootnoteSuffix}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Cost of turnover
// ---------------------------------------------------------------------------

function TurnoverCost() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const roles = [
    { role: s.turnoverRole0, pct: 200, color: "bg-error" },
    { role: s.turnoverRole1, pct: 80, color: "bg-primary" },
    { role: s.turnoverRole2, pct: 40, color: "bg-tertiary" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">{s.turnoverTitle}</h4>
        <p className="text-xs text-outline mb-4">{s.turnoverSubtitle}</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          {s.turnoverExplainer}
        </p>

        <div className="space-y-4">
          {roles.map((r, i) => (
            <div key={r.role}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface">{r.role}</span>
                <span className="text-[10px] font-black text-on-surface">
                  {visible ? `${r.pct}%` : "\u2014"} <span className="text-outline font-normal">{s.turnoverSalarySuffix}</span>
                </span>
              </div>
              <div className="h-4 bg-surface-container-lowest rounded-full overflow-hidden relative">
                {/* 100% mark */}
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-on-surface/20 z-10" />
                <div
                  className={`h-full ${r.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: visible ? `${Math.min((r.pct / 200) * 100, 100)}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
              {i === 0 && (
                <div className="flex justify-between mt-0.5">
                  <span className="text-[8px] text-outline">0%</span>
                  <span className="text-[8px] text-outline">100%</span>
                  <span className="text-[8px] text-outline">200%</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-surface-container-lowest rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-2xl">payments</span>
            <div>
              <p className="text-on-surface font-headline font-bold text-lg">
                <AnimatedNumber target={438} prefix="$" suffix={s.turnoverBigNumber} />
              </p>
              <p className="text-[10px] text-outline">{s.turnoverBigLabel}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tenure by age
// ---------------------------------------------------------------------------

function TenureChart() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const data = [
    { age: "25-34", years: 2.7, color: "bg-error/70" },
    { age: "35-44", years: 4.1, color: "bg-primary" },
    { age: "45-54", years: 6.8, color: "bg-tertiary" },
    { age: "55-64", years: 9.6, color: "bg-secondary" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">{s.tenureTitle}</h4>
        <p className="text-xs text-outline mb-4">{s.tenureSubtitle}</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          {s.tenureExplainer}
        </p>

        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.age}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface">{d.age} {s.tenureYearsSuffix}</span>
                <span className="text-[10px] font-black text-on-surface">{d.years} {s.tenureYearsSuffix}</span>
              </div>
              <div className="h-4 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className={`h-full ${d.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: visible ? `${(d.years / 15) * 100}%` : "0%",
                    transitionDelay: `${i * 120}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-outline mt-4 text-center">
          {s.tenureFootnote}<span className="text-primary font-bold">{s.tenureFootnoteHighlight}</span>
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Gamification impact
// ---------------------------------------------------------------------------

function GamificationImpact() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const items = [
    { stat: s.gamificationStat0, desc: s.gamificationDesc0, color: "text-secondary" },
    { stat: s.gamificationStat1, desc: s.gamificationDesc1, color: "text-primary" },
    { stat: s.gamificationStat2, desc: s.gamificationDesc2, color: "text-tertiary" },
    { stat: s.gamificationStat3, desc: s.gamificationDesc3, color: "text-on-tertiary-container" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">{s.gamificationTitle}</h4>
        <p className="text-xs text-outline mb-6">{s.gamificationSubtitle}</p>

        <div className="space-y-4">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-3 rounded-lg bg-surface-container-lowest transition-all duration-700"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateX(0)" : "translateX(-20px)",
                transitionDelay: `${i * 120}ms`,
              }}
            >
              <span className={`text-2xl font-headline font-black ${item.color} min-w-[72px]`}>{item.stat}</span>
              <span className="text-xs text-on-surface-variant">{item.desc}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-outline mt-4">
          {s.gamificationSources}
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Big KPIs row
// ---------------------------------------------------------------------------

function BigKpis() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const kpis = [
    { value: 21, suffix: "%", label: s.kpiLabel0, color: "text-error", sub: s.kpiSub0 },
    { value: 13, suffix: "%", label: s.kpiLabel1, color: "text-error", sub: s.kpiSub1 },
    { value: 3.5, suffix: lang === "es" ? " años" : " yrs", label: s.kpiLabel2, color: "text-primary", sub: s.kpiSub2 },
    { value: 438, suffix: "B$", label: s.kpiLabel3, color: "text-error", sub: s.kpiSub3 },
  ]

  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {kpis.map((kpi, i) => (
        <div key={i} className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-5 text-center h-full flex flex-col justify-center">
            <div className={`text-4xl lg:text-5xl font-headline font-black ${kpi.color}`}>
              {visible ? <AnimatedNumber target={kpi.value} suffix={kpi.suffix} /> : "\u2014"}
            </div>
            <p className="text-[10px] text-on-surface-variant mt-2 leading-relaxed">{kpi.label}</p>
            <p className="text-[9px] text-outline mt-1">{kpi.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export default function LandingData() {
  const { ref, visible } = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-[1600px]">
        {/* Section header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-error">
            {s.dataLabel}
          </span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
            {s.dataHeadline}
            <span className="bg-gradient-to-r from-error to-error/60 bg-clip-text text-transparent">
              {s.dataHeadlineHighlight}
            </span>
          </h2>
          <p className="mt-4 text-on-surface-variant max-w-2xl mx-auto">
            {s.dataSubtitle}
          </p>
        </div>

        {/* Big KPIs */}
        <div className="mb-12">
          <BigKpis />
        </div>

        {/* Engagement chart (full width) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EngagementChart />
        </div>

        {/* Europe + Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EuropeBarChart />
          <FeedbackChart />
        </div>

        {/* Tenure + Turnover */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TenureChart />
          <TurnoverCost />
        </div>

        {/* Gamification impact */}
        <div className="grid grid-cols-1 gap-6 mb-12">
          <GamificationImpact />
        </div>

        {/* Closing statement */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-lg leading-relaxed">
            {s.closingStatement}
            <span className="text-primary font-semibold">
              {s.closingHighlight}
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
