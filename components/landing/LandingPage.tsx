"use client"

import { useRef, useState, useEffect } from "react"

// ---------------------------------------------------------------------------
// Scroll-reveal hook
// ---------------------------------------------------------------------------

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ---------------------------------------------------------------------------
// Reusable: Material icon helper
// ---------------------------------------------------------------------------

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  )
}

// ---------------------------------------------------------------------------
// SECTION 1 — Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(true), [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-surface">
      {/* Subtle gold radial gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(233,196,0,0.12),transparent_70%)]" />

      <div
        className={`relative z-10 mx-auto flex max-w-[1600px] flex-col items-center px-6 py-24 text-center transition-all duration-1000 ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Badge */}
        <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-container/60 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary font-label">
          <Icon name="sports_esports" className="text-base" />
          Gamificacion Corporativa
        </span>

        {/* Title */}
        <h1 className="font-headline text-5xl font-extrabold uppercase tracking-tight text-on-surface sm:text-6xl lg:text-7xl">
          Work{" "}
          <span className="bg-gradient-to-r from-primary to-primary-fixed bg-clip-text text-transparent">
            Leveling
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl font-headline text-xl font-bold text-on-surface-variant sm:text-2xl">
          Transforma la gestion de tu equipo en una experiencia de juego
        </p>

        {/* Description */}
        <p className="mt-4 max-w-xl font-body text-base text-on-surface-variant/70">
          La plataforma que convierte objetivos corporativos en misiones epicas.
          Tus empleados suben de nivel mientras crecen profesionalmente.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button className="group relative rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim px-8 py-3 text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-glow-gold transition-transform active:scale-95">
            <span className="relative z-10">Solicitar Demo</span>
            {/* Pulsing glow */}
            <span className="absolute inset-0 animate-pulse rounded-md bg-primary/20 blur-xl" />
          </button>

          <button
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 rounded-md px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98]"
          >
            Ver como funciona
            <Icon name="arrow_downward" className="text-base" />
          </button>
        </div>

        {/* Decorative floating icons */}
        <div className="pointer-events-none absolute -bottom-10 left-1/2 flex -translate-x-1/2 gap-8 opacity-20">
          <Icon name="emoji_events" className="text-5xl text-primary" />
          <Icon name="military_tech" className="text-5xl text-secondary" />
          <Icon name="trending_up" className="text-5xl text-tertiary" />
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 2 — Problema / Solucion
// ---------------------------------------------------------------------------

const problems = [
  { icon: "visibility_off", text: "Los empleados no ven su progreso" },
  {
    icon: "description",
    text: "Los objetivos se pierden en hojas de Excel",
  },
  {
    icon: "trending_flat",
    text: "No hay forma de medir el crecimiento real",
  },
]

const solutions = [
  {
    icon: "bar_chart",
    text: "Progreso visible con barras de atributos y niveles",
  },
  {
    icon: "assignment_turned_in",
    text: "Misiones claras con objetivos paso a paso",
  },
  {
    icon: "insights",
    text: "Metricas reales de rendimiento y crecimiento",
  },
]

function ProblemSolutionSection() {
  const section = useScrollReveal()

  return (
    <section
      ref={section.ref}
      className={`relative bg-surface px-6 py-24 transition-all duration-700 ${
        section.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <h2 className="mb-16 text-center font-headline text-3xl font-bold text-on-surface sm:text-4xl">
          Tu equipo necesita{" "}
          <span className="text-primary">motivacion</span>?
        </h2>

        <div className="grid gap-12 lg:grid-cols-[1fr_auto_1fr]">
          {/* Problems */}
          <div className="flex flex-col gap-5">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-error font-label">
              El problema
            </span>
            {problems.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg bg-surface-container-lowest p-5 transition-all duration-500"
                style={{
                  transitionDelay: section.visible ? `${i * 100}ms` : "0ms",
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible
                    ? "translateY(0)"
                    : "translateY(20px)",
                }}
              >
                <Icon
                  name={p.icon}
                  className="mt-0.5 text-2xl text-error/70"
                />
                <p className="font-body text-base text-on-surface-variant">
                  {p.text}
                </p>
              </div>
            ))}
          </div>

          {/* Arrow / divider */}
          <div className="hidden items-center justify-center lg:flex">
            <div className="flex flex-col items-center gap-2">
              <div className="h-24 w-px bg-gradient-to-b from-error/40 to-secondary/40" />
              <Icon
                name="arrow_forward"
                className="text-3xl text-primary"
              />
              <div className="h-24 w-px bg-gradient-to-b from-secondary/40 to-transparent" />
            </div>
          </div>

          {/* Mobile arrow */}
          <div className="flex items-center justify-center lg:hidden">
            <Icon
              name="arrow_downward"
              className="text-3xl text-primary"
            />
          </div>

          {/* Solutions */}
          <div className="flex flex-col gap-5">
            <span className="mb-2 text-[10px] font-bold uppercase tracking-widest text-secondary font-label">
              La solucion
            </span>
            {solutions.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg bg-surface-container-lowest p-5 transition-all duration-500"
                style={{
                  transitionDelay: section.visible
                    ? `${(i + 3) * 100}ms`
                    : "0ms",
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible
                    ? "translateY(0)"
                    : "translateY(20px)",
                }}
              >
                <Icon
                  name={s.icon}
                  className="mt-0.5 text-2xl text-secondary"
                />
                <p className="font-body text-base text-on-surface-variant">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 3 — Como funciona (timeline)
// ---------------------------------------------------------------------------

const steps = [
  {
    icon: "account_tree",
    title: "El admin crea proyectos",
    description:
      "Define los proyectos con objetivos claros y asigna recursos.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: "assignment",
    title: "Asigna misiones al equipo",
    description:
      "Cada proyecto se divide en misiones con pasos concretos.",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    icon: "military_tech",
    title: "Los empleados completan y suben de nivel",
    description:
      "Ganan XP, trofeos y kredits al completar cada mision.",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    icon: "approval",
    title: "El manager aprueba y evalua",
    description:
      "Revisa el trabajo, puntua atributos y da retroalimentacion.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
]

function HowItWorksSection() {
  const section = useScrollReveal()

  return (
    <section
      id="como-funciona"
      ref={section.ref}
      className={`relative bg-surface-container-lowest px-6 py-24 transition-all duration-700 ${
        section.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <span className="mb-4 block text-center text-[10px] font-bold uppercase tracking-widest text-primary font-label">
          Flujo de trabajo
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-bold text-on-surface sm:text-4xl">
          Como funciona
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block">
          <div className="relative grid grid-cols-4 gap-8">
            {/* Connector line */}
            <div className="absolute left-[12.5%] right-[12.5%] top-[60px] h-px bg-gradient-to-r from-primary/40 via-tertiary/40 to-primary/40" />

            {steps.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center transition-all duration-500"
                style={{
                  transitionDelay: section.visible
                    ? `${i * 150}ms`
                    : "0ms",
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible
                    ? "translateY(0)"
                    : "translateY(30px)",
                }}
              >
                {/* Step number */}
                <span className="mb-3 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 font-label">
                  Paso {i + 1}
                </span>

                {/* Icon circle */}
                <div
                  className={`relative z-10 mb-6 flex h-[72px] w-[72px] items-center justify-center rounded-full ${step.bg} shadow-card`}
                >
                  <Icon name={step.icon} className={`text-4xl ${step.color}`} />
                </div>

                {/* Card */}
                <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
                  <div className="rounded-lg bg-surface-bright px-5 py-6">
                    <h3 className="mb-2 font-headline text-sm font-bold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant/70">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden">
          <div className="relative ml-6 border-l border-outline-variant/30 pl-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative mb-10 last:mb-0 transition-all duration-500"
                style={{
                  transitionDelay: section.visible
                    ? `${i * 150}ms`
                    : "0ms",
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible
                    ? "translateX(0)"
                    : "translateX(-20px)",
                }}
              >
                {/* Dot on the line */}
                <div
                  className={`absolute -left-[calc(2rem+6px)] top-2 flex h-3 w-3 items-center justify-center rounded-full ${step.bg} ring-2 ring-surface-container-lowest`}
                />

                <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/50 font-label">
                  Paso {i + 1}
                </span>

                <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
                  <div className="flex items-start gap-4 rounded-lg bg-surface-bright p-5">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${step.bg}`}
                    >
                      <Icon
                        name={step.icon}
                        className={`text-2xl ${step.color}`}
                      />
                    </div>
                    <div>
                      <h3 className="mb-1 font-headline text-sm font-bold text-on-surface">
                        {step.title}
                      </h3>
                      <p className="font-body text-xs text-on-surface-variant/70">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 4 — Caracteristicas (feature grid)
// ---------------------------------------------------------------------------

const features = [
  {
    icon: "rocket_launch",
    title: "Proyectos & Misiones",
    description:
      "Crea proyectos con misiones paso a paso. Los empleados completan y avanzan.",
    accent: "text-tertiary",
    glow: "group-hover:shadow-glow-blue",
  },
  {
    icon: "trending_up",
    title: "Sistema de Niveles",
    description:
      "XP, niveles, trofeos y kredits. Progreso visible y motivante.",
    accent: "text-secondary",
    glow: "group-hover:shadow-glow-green",
  },
  {
    icon: "psychology",
    title: "Atributos & Skills",
    description:
      "8 atributos evaluados por managers. Crecimiento profesional medible.",
    accent: "text-primary",
    glow: "group-hover:shadow-glow-gold",
  },
  {
    icon: "fact_check",
    title: "Aprobaciones",
    description:
      "Los managers revisan, puntuan y dejan notas. Trazabilidad completa.",
    accent: "text-primary",
    glow: "group-hover:shadow-glow-gold",
  },
  {
    icon: "apartment",
    title: "Multi-Empresa",
    description:
      "Un admin puede gestionar multiples empresas con departamentos.",
    accent: "text-tertiary",
    glow: "group-hover:shadow-glow-blue",
  },
  {
    icon: "analytics",
    title: "Estadisticas & KPIs",
    description:
      "Dashboards con metricas de rendimiento, rankings y tendencias.",
    accent: "text-secondary",
    glow: "group-hover:shadow-glow-green",
  },
]

function FeaturesSection() {
  const section = useScrollReveal()

  return (
    <section
      ref={section.ref}
      className={`relative bg-surface px-6 py-24 transition-all duration-700 ${
        section.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <span className="mb-4 block text-center text-[10px] font-bold uppercase tracking-widest text-primary font-label">
          Caracteristicas
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-bold text-on-surface sm:text-4xl">
          Todo lo que necesitas para{" "}
          <span className="text-primary">nivelar</span> tu equipo
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={i}
              className={`group rounded-xl bg-surface-container-highest p-1 transition-all duration-500 hover:scale-[1.02] ${f.glow}`}
              style={{
                transitionDelay: section.visible
                  ? `${i * 100}ms`
                  : "0ms",
                opacity: section.visible ? 1 : 0,
                transform: section.visible
                  ? "translateY(0)"
                  : "translateY(30px)",
              }}
            >
              <div className="flex h-full flex-col rounded-lg bg-surface-bright p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-lowest">
                  <Icon name={f.icon} className={`text-2xl ${f.accent}`} />
                </div>
                <h3 className="mb-2 font-headline text-base font-bold text-on-surface">
                  {f.title}
                </h3>
                <p className="font-body text-sm text-on-surface-variant/70">
                  {f.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main Landing Page component
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <HeroSection />
      <ProblemSolutionSection />
      <HowItWorksSection />
      <FeaturesSection />
    </main>
  )
}
