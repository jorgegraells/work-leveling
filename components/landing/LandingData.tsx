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

// Average 2020-2024: US = (36+34+32+33+30)/5 = 33%, Europe = (11+11+13+13+13)/5 = 12.2% ≈ 12%
function EngagementChart() {
  const { ref, visible } = useScrollReveal()

  return (
    <div ref={ref} className="col-span-1 lg:col-span-2 rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-headline font-bold text-on-surface text-lg">Empleados comprometidos</h4>
          <span className="text-[9px] font-bold uppercase tracking-widest text-outline">Fuente: Gallup</span>
        </div>
        <p className="text-xs text-outline mb-4">Media 2020–2024 — EE.UU. vs Europa (sobre 100%)</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          «Engaged» = empleados emocionalmente involucrados y motivados en su trabajo. El resto está desconectado o activamente desmotivado.
        </p>

        <div className="flex items-end gap-8 sm:gap-12 justify-center">
          {/* US */}
          <div className="flex flex-col items-center gap-2 w-32">
            <span className="text-3xl font-headline font-black text-primary">
              {visible ? "33%" : "—"}
            </span>
            <div className="w-full flex flex-col justify-end bg-surface-container-lowest rounded-t-lg" style={{ height: 200 }}>
              <div
                className="w-full bg-primary rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: visible ? "33%" : "0%" }}
              />
            </div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">EE.UU.</span>
          </div>

          {/* Europe */}
          <div className="flex flex-col items-center gap-2 w-32">
            <span className="text-3xl font-headline font-black text-error">
              {visible ? "12%" : "—"}
            </span>
            <div className="w-full flex flex-col justify-end bg-surface-container-lowest rounded-t-lg" style={{ height: 200 }}>
              <div
                className="w-full bg-error/70 rounded-t-lg transition-all duration-1000 ease-out"
                style={{ height: visible ? "12%" : "0%", transitionDelay: "150ms" }}
              />
            </div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-widest">Europa</span>
          </div>
        </div>

        <p className="text-[9px] text-outline mt-6 text-center max-w-lg mx-auto">
          De media, solo 1 de cada 3 empleados en EE.UU. está comprometido. En Europa, apenas 1 de cada 8. <span className="text-error font-bold">El resto está desconectado o activamente desmotivado.</span>
        </p>
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
        <p className="text-xs text-outline mb-4">Porcentaje de empleados comprometidos por país (sobre 100%)</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          Solo cuentan como «comprometidos» los empleados que muestran alta motivación e implicación activa.
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

  const data = [
    { label: "Feedback semanal", engaged: 61, color: "bg-secondary" },
    { label: "Feedback mensual", engaged: 38, color: "bg-primary" },
    { label: "Feedback anual", engaged: 18, color: "bg-error/70" },
  ]

  return (
    <div ref={ref} className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
      <div className="rounded-lg bg-surface-bright p-6">
        <h4 className="font-headline font-bold text-on-surface text-lg mb-1">Frecuencia del feedback</h4>
        <p className="text-xs text-outline mb-4">Empleados comprometidos según frecuencia de retroalimentación (sobre 100%)</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          «Feedback» = retroalimentación del manager sobre el trabajo del empleado: evaluaciones, comentarios y reconocimiento.
        </p>

        <div className="flex items-end gap-6 justify-center">
          {data.map((d, i) => (
            <div key={d.label} className="flex flex-col items-center gap-2 flex-1 max-w-[120px]">
              <span className="text-2xl font-headline font-black text-on-surface">
                {visible ? `${d.engaged}%` : "—"}
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
          Fuente: Gallup 2024 — Los empleados con retroalimentación semanal son <span className="text-secondary font-bold">3.6x más propensos</span> a sentirse motivados
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
        <p className="text-xs text-outline mb-4">Coste de reemplazar un empleado según su nivel (% del salario anual)</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          «Turnover» = rotación de personal. Incluye costes de selección, formación, pérdida de productividad y tiempo de adaptación.
        </p>

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
                <AnimatedNumber target={438} prefix="$" suffix=" mil millones" />
              </p>
              <p className="text-[10px] text-outline">Pérdida global anual por falta de compromiso laboral (Gallup 2025)</p>
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
        <p className="text-xs text-outline mb-4">Antigüedad media por rango de edad en años (EE.UU. 2024)</p>
        <p className="text-[9px] text-on-surface-variant/60 mb-6 italic">
          «Tenure» = tiempo medio que un empleado permanece en la misma empresa antes de cambiar.
        </p>

        <div className="space-y-3">
          {data.map((d, i) => (
            <div key={d.age}>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] font-bold text-on-surface">{d.age} años</span>
                <span className="text-[10px] font-black text-on-surface">{d.years} años</span>
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
            { stat: "3.6x", desc: "más motivación con retroalimentación frecuente vs. anual", color: "text-tertiary" },
            { stat: "80%", desc: "de empleados con retroalimentación significativa están plenamente comprometidos", color: "text-on-tertiary-container" },
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
        { value: 438, suffix: "B$", label: "pérdida anual por falta de compromiso", color: "text-error", sub: "Gallup 2025" },
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
            El compromiso laboral no es un extra. Es la diferencia entre una empresa que retiene talento y una que lo pierde.{" "}
            <span className="text-primary font-semibold">
              La gamificación no es un juego — es la herramienta que cierra esa brecha.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
