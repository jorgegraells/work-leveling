"use client"

import { useRef, useState, useEffect } from "react"

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

const ENGAGEMENT_DATA = [
  { year: "2020", global: 20, europe: 11, label: "COVID-19" },
  { year: "2021", global: 21, europe: 11, label: "" },
  { year: "2022", global: 23, europe: 13, label: "Pico" },
  { year: "2023", global: 23, europe: 13, label: "" },
  { year: "2024", global: 21, europe: 13, label: "Caída" },
]

function EngagementChart() {
  const { ref, visible } = useScrollReveal()
  const maxVal = 30

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-headline font-bold text-on-surface text-lg">Empleados comprometidos</h4>
          <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Fuente: Gallup 2025</span>
        </div>
        <p className="text-xs text-outline mb-6">Porcentaje de empleados engaged en su trabajo</p>

        <div className="flex items-end gap-3 h-48">
          {ENGAGEMENT_DATA.map((d, i) => (
            <div key={d.year} className="flex-1 flex flex-col items-center gap-1">
              {/* Global bar */}
              <div className="w-full flex gap-1 items-end justify-center" style={{ height: "100%" }}>
                <div className="relative flex-1 flex flex-col justify-end items-center">
                  <span className="text-[9px] font-bold text-primary mb-1">
                    {visible ? `${d.global}%` : ""}
                  </span>
                  <div
                    className="w-full bg-primary rounded-t transition-all duration-1000 ease-out"
                    style={{
                      height: visible ? `${(d.global / maxVal) * 100}%` : "0%",
                      transitionDelay: `${i * 100}ms`,
                      minHeight: visible ? 4 : 0,
                    }}
                  />
                </div>
                <div className="relative flex-1 flex flex-col justify-end items-center">
                  <span className="text-[9px] font-bold text-error mb-1">
                    {visible ? `${d.europe}%` : ""}
                  </span>
                  <div
                    className="w-full bg-error/70 rounded-t transition-all duration-1000 ease-out"
                    style={{
                      height: visible ? `${(d.europe / maxVal) * 100}%` : "0%",
                      transitionDelay: `${i * 100 + 50}ms`,
                      minHeight: visible ? 4 : 0,
                    }}
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-outline">{d.year}</span>
              {d.label && (
                <span className="text-[8px] text-on-surface-variant">{d.label}</span>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-6 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-[10px] text-outline">Global</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-error/70" />
            <span className="text-[10px] text-outline">Europa</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Europe country engagement (worst performers)
// ---------------------------------------------------------------------------

const EUROPE_COUNTRIES = [
  { name: "Rumanía", value: 35, color: "bg-secondary" },
  { name: "Europa media", value: 13, color: "bg-primary" },
  { name: "España", value: 9, color: "bg-error/70" },
  { name: "Francia", value: 8, color: "bg-error/70" },
  { name: "Suiza", value: 8, color: "bg-error/70" },
  { name: "Croacia", value: 7, color: "bg-error/70" },
]

function EuropeBarChart() {
  const { ref, visible } = useScrollReveal()

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">Europa: la región menos comprometida</h4>
        <p className="text-xs text-outline mb-6">Empleados engaged por país (2024)</p>

        <div className="space-y-3">
          {EUROPE_COUNTRIES.map((c, i) => (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-on-surface w-28 text-right truncate">{c.name}</span>
              <div className="flex-1 h-5 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className={`h-full ${c.color} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                  style={{
                    width: visible ? `${(c.value / 40) * 100}%` : "0%",
                    transitionDelay: `${i * 80}ms`,
                  }}
                >
                  <span className="text-[9px] font-black text-on-primary">{c.value}%</span>
                </div>
              </div>
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

  const data = [
    { label: "Feedback semanal", engaged: 61, color: "bg-secondary" },
    { label: "Feedback mensual", engaged: 38, color: "bg-primary" },
    { label: "Feedback anual", engaged: 18, color: "bg-error/70" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">Frecuencia del feedback</h4>
        <p className="text-xs text-outline mb-6">Empleados engaged según frecuencia de feedback recibido</p>

        <div className="flex items-end gap-4 h-44 justify-center">
          {data.map((d, i) => (
            <div key={d.label} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
              <span className="text-2xl font-headline font-black text-on-surface">
                {visible ? `${d.engaged}%` : "—"}
              </span>
              <div className="w-full bg-surface-container-lowest rounded-t-lg overflow-hidden" style={{ height: 120 }}>
                <div
                  className={`w-full ${d.color} rounded-t-lg transition-all duration-1000 ease-out`}
                  style={{
                    height: visible ? `${(d.engaged / 65) * 100}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                    marginTop: visible ? `${100 - (d.engaged / 65) * 100}%` : "100%",
                  }}
                />
              </div>
              <span className="text-[9px] font-bold text-outline text-center uppercase tracking-wider leading-tight">{d.label}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-outline mt-4 text-center">
          Fuente: Gallup 2024 — Los empleados con feedback semanal son <span className="text-secondary font-bold">3.6x más propensos</span> a sentirse motivados
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

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">El coste de perder talento</h4>
        <p className="text-xs text-outline mb-6">Coste de reemplazar un empleado según su nivel</p>

        <div className="space-y-4">
          {[
            { role: "Directivo / Manager", pct: 200, color: "bg-error" },
            { role: "Técnico / Profesional", pct: 80, color: "bg-primary" },
            { role: "Operativo / Junior", pct: 40, color: "bg-tertiary" },
          ].map((r, i) => (
            <div key={r.role}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface">{r.role}</span>
                <span className="text-[10px] font-black text-on-surface">
                  {visible ? `${r.pct}%` : "—"} <span className="text-outline font-normal">del salario anual</span>
                </span>
              </div>
              <div className="h-3 bg-surface-container-lowest rounded-full overflow-hidden">
                <div
                  className={`h-full ${r.color} rounded-full transition-all duration-1000 ease-out`}
                  style={{
                    width: visible ? `${(r.pct / 220) * 100}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-surface-container-lowest rounded-lg">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-error text-2xl">payments</span>
            <div>
              <p className="text-on-surface font-headline font-bold text-lg">
                <AnimatedNumber target={438} prefix="$" suffix=" mil millones" />
              </p>
              <p className="text-[10px] text-outline">Pérdida global anual por falta de engagement (Gallup 2025)</p>
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

  const data = [
    { age: "25-34", years: 2.7, color: "bg-error/70" },
    { age: "35-44", years: 4.1, color: "bg-primary" },
    { age: "45-54", years: 6.8, color: "bg-tertiary" },
    { age: "55-64", years: 9.6, color: "bg-secondary" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">¿Cuánto dura un empleado?</h4>
        <p className="text-xs text-outline mb-6">Antigüedad media por rango de edad (EE.UU. 2024)</p>

        <div className="flex items-end gap-3 h-40 justify-center">
          {data.map((d, i) => (
            <div key={d.age} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-lg font-headline font-black text-on-surface">
                {visible ? `${d.years}` : "—"}
              </span>
              <span className="text-[8px] text-outline">años</span>
              <div className="w-full bg-surface-container-lowest rounded-t-lg overflow-hidden" style={{ height: 80 }}>
                <div
                  className={`w-full ${d.color} rounded-t-lg transition-all duration-1000 ease-out`}
                  style={{
                    height: visible ? `${(d.years / 10) * 100}%` : "0%",
                    transitionDelay: `${i * 150}ms`,
                    marginTop: visible ? `${100 - (d.years / 10) * 100}%` : "100%",
                  }}
                />
              </div>
              <span className="text-[10px] font-bold text-outline">{d.age}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-outline mt-4 text-center">
          Fuente: Bureau of Labor Statistics 2024 — Mediana sector privado: <span className="text-primary font-bold">3.5 años</span>
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

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">La gamificación funciona</h4>
        <p className="text-xs text-outline mb-6">Impacto demostrado en entornos corporativos</p>

        <div className="space-y-4">
          {[
            { stat: "+25%", desc: "aumento en productividad (KPMG, programa gamificado)", color: "text-secondary" },
            { stat: "+22%", desc: "más oportunidades de negocio generadas", color: "text-primary" },
            { stat: "3.6x", desc: "más motivación con feedback frecuente vs. anual", color: "text-tertiary" },
            { stat: "80%", desc: "de empleados con feedback significativo están fully engaged", color: "text-on-tertiary-container" },
          ].map((item, i) => (
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
          Fuentes: KPMG 2023, Gallup 2024, Harvard Business Review 2024
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

  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
    >
      {[
        { value: 21, suffix: "%", label: "de empleados están engaged globalmente", color: "text-error", sub: "79% desconectados" },
        { value: 13, suffix: "%", label: "en Europa — la peor región del mundo", color: "text-error", sub: "España: solo 9%" },
        { value: 3.5, suffix: " años", label: "antigüedad media en el sector privado", color: "text-primary", sub: "2.7 años en jóvenes 25-34" },
        { value: 438, suffix: "B$", label: "pérdida anual por falta de engagement", color: "text-error", sub: "Gallup 2025" },
      ].map((kpi, i) => (
        <div key={i} className="rounded-xl bg-surface-container-highest p-1">
          <div className="rounded-lg bg-surface-bright p-5 text-center h-full flex flex-col justify-center">
            <div className={`text-4xl lg:text-5xl font-headline font-black ${kpi.color}`}>
              {visible ? <AnimatedNumber target={kpi.value} suffix={kpi.suffix} /> : "—"}
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

  return (
    <section className="bg-surface px-6 py-24">
      <div className="mx-auto max-w-[1600px]">
        {/* Section header */}
        <div
          ref={ref}
          className={`text-center mb-16 transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="mb-4 block text-[10px] font-bold uppercase tracking-widest text-error">
            Los datos hablan
          </span>
          <h2 className="font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
            Hay un problema real.{" "}
            <span className="bg-gradient-to-r from-error to-error/60 bg-clip-text text-transparent">
              Y está empeorando.
            </span>
          </h2>
          <p className="mt-4 text-on-surface-variant max-w-2xl mx-auto">
            Estos no son nuestros datos. Son de Gallup, Harvard Business Review y el Bureau of Labor Statistics. La desconexión laboral es una crisis global — y tu empresa no es inmune.
          </p>
        </div>

        {/* Big KPIs */}
        <div className="mb-12">
          <BigKpis />
        </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <EngagementChart />
          <EuropeBarChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <FeedbackChart />
          <TenureChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          <TurnoverCost />
          <GamificationImpact />
        </div>

        {/* Closing statement */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-on-surface-variant text-lg leading-relaxed">
            El engagement no es un &quot;nice to have&quot;. Es la diferencia entre una empresa que retiene talento y una que lo pierde.{" "}
            <span className="text-primary font-semibold">
              La gamificación no es un juego — es la herramienta que cierra esa brecha.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
