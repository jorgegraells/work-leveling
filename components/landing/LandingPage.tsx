"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"

// ---------------------------------------------------------------------------
// Scroll-reveal hook with stagger support
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
      { threshold: 0.1 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

// ---------------------------------------------------------------------------
// Material icon helper
// ---------------------------------------------------------------------------

function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`}>{name}</span>
  )
}

// ---------------------------------------------------------------------------
// Stagger delay helper for inline styles
// ---------------------------------------------------------------------------

function stagger(visible: boolean, index: number, base = 100) {
  return {
    transitionDelay: visible ? `${index * base}ms` : "0ms",
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(24px)",
  }
}

// ---------------------------------------------------------------------------
// SECTION 1 — Hero
// ---------------------------------------------------------------------------

function HeroSection() {
  const [loaded, setLoaded] = useState(false)
  useEffect(() => setLoaded(true), [])

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-surface">
      {/* Gold radial gradient top */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(233,196,0,0.10),transparent_70%)]" />

      <div
        className={`relative z-10 mx-auto flex max-w-[1600px] flex-col items-center px-6 py-24 text-center transition-all duration-1000 ${
          loaded ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        {/* Brand */}
        <div className="mb-10">
          <h1 className="font-headline text-6xl font-black uppercase tracking-tight sm:text-7xl lg:text-8xl">
            <span
              style={{
                background: "linear-gradient(135deg, #c4c7c7 0%, #e4e2e1 40%, #c4c7c7 70%, #8e9192 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              WORK
            </span>{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #e9c400 0%, #ffe16d 40%, #e9c400 60%, #b69900 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "glow-text 3s ease-in-out infinite alternate",
              }}
            >
              LEVELING
            </span>
          </h1>
          <style>{`
            @keyframes glow-text {
              0% { filter: drop-shadow(0 0 20px rgba(233,196,0,0.2)); }
              100% { filter: drop-shadow(0 0 40px rgba(233,196,0,0.4)); }
            }
          `}</style>
        </div>

        {/* Philosophy */}
        <p className="max-w-3xl font-body text-xl text-on-surface-variant sm:text-2xl leading-relaxed">
          Nos motiva más trabajar en un juego por dinero ficticio que trabajar en
          la vida por dinero real.{" "}
          <span className="text-primary font-semibold">
            Nosotros fusionamos ambos mundos.
          </span>
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 1B — Second hero (the 87% message)
// ---------------------------------------------------------------------------

function SecondHeroSection() {
  const { ref, visible } = useScrollReveal()

  return (
    <section className="relative bg-surface-container-lowest py-32 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(233,196,0,0.06),transparent_70%)]" />

      <div
        ref={ref}
        className={`relative z-10 mx-auto flex max-w-[1600px] flex-col items-center px-6 text-center transition-all duration-1000 ${
          visible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
        }`}
      >
        <h2 className="font-headline text-3xl font-extrabold leading-tight tracking-tight text-on-surface sm:text-4xl lg:text-5xl">
          El 87% de tus empleados{" "}
          <span className="bg-gradient-to-r from-primary to-primary-fixed bg-clip-text text-transparent">
            no saben si lo están haciendo bien
          </span>
        </h2>

        <p className="mt-6 max-w-2xl font-body text-lg text-on-surface-variant sm:text-xl">
          Las revisiones trimestrales llegan tarde. Los Excel se pierden. El
          talento se va sin que sepas por qué. Work Leveling convierte cada
          objetivo en una misión con progreso visible, feedback real y datos que
          no mienten.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="group relative rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-[0_0_25px_rgba(233,196,0,0.2)] transition-transform active:scale-95"
          >
            <span className="relative z-10">Empieza gratis</span>
            <span className="absolute inset-0 animate-pulse rounded-md bg-primary/15 blur-xl" />
          </Link>

          <button
            onClick={() =>
              document
                .getElementById("como-funciona")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 rounded-md px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-on-surface transition-colors hover:bg-surface-container-high active:scale-[0.98]"
          >
            Cómo funciona
            <Icon name="arrow_downward" className="text-base" />
          </button>
        </div>

{/* trust line removed */}
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 2 — El Problema (crear dolor)
// ---------------------------------------------------------------------------

const painPoints = [
  {
    icon: "visibility_off",
    color: "text-error",
    bg: "bg-error/10",
    title: "Progreso invisible",
    description:
      "Tu mejor empleado lleva 6 meses sin saber si va bien. Cuando le preguntas en la review trimestral, ya tiene una oferta de otra empresa.",
  },
  {
    icon: "description",
    color: "text-outline",
    bg: "bg-outline/10",
    title: "Feedback que llega tarde",
    description:
      "Un Excel compartido. Tres versiones distintas. Nadie sabe cuál es la buena. Cuando el manager da feedback, el empleado ya ni recuerda el proyecto.",
  },
  {
    icon: "trending_down",
    color: "text-error",
    bg: "bg-error/10",
    title: "Talento que se va en silencio",
    description:
      "No se fueron por el sueldo. Se fueron porque nadie les dijo que estaban creciendo. Porque ningún sistema les mostró su progreso.",
  },
  {
    icon: "gavel",
    color: "text-outline",
    bg: "bg-outline/10",
    title: "Decisiones sin datos",
    description:
      "Ascender a María o a Carlos? Sin datos objetivos, es intuición. Y la intuición no se defiende ante un comité.",
  },
  {
    icon: "mood_bad",
    color: "text-error",
    bg: "bg-error/10",
    title: "Herramientas que desmotivan",
    description:
      "Los programas de gestión actuales son fríos, burocráticos y aburridos. Tu equipo los usa por obligación, no por motivación. El resultado: más rechazo que adopción.",
  },
  {
    icon: "help_center",
    color: "text-outline",
    bg: "bg-outline/10",
    title: "Demasiadas tareas, cero prioridad",
    description:
      "Cada semana llegan más proyectos. Sin un sistema claro de misiones y prioridades, tu equipo no sabe por dónde empezar. Y lo urgente siempre aplasta lo importante.",
  },
]

function ProblemSection() {
  const section = useScrollReveal()

  return (
    <section
      ref={section.ref}
      className={`relative bg-surface-container-lowest px-6 py-24 transition-all duration-700 ${
        section.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <span className="mb-4 block text-center text-[10px] font-bold uppercase tracking-widest text-error font-label">
          La realidad
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          Esto pasa cada día en tu empresa
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {painPoints.map((p, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500"
              style={stagger(section.visible, i, 120)}
            >
              <div className="flex items-start gap-4 rounded-lg bg-surface-bright p-6">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${p.bg}`}
                >
                  <Icon name={p.icon} className={`text-2xl ${p.color}`} />
                </div>
                <div>
                  <h3 className="mb-1.5 font-headline text-base font-bold text-on-surface">
                    {p.title}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-on-surface-variant/70">
                    {p.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// SECTION 3 — La Transformación (resultados, no features)
// ---------------------------------------------------------------------------

const results = [
  {
    metric: "3x más feedback",
    description:
      "Cada misión completada genera una evaluación de 8 atributos. Tu equipo recibe feedback continuo, no anual.",
    icon: "rate_review",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    metric: "100% trazabilidad",
    description:
      "Quién creó el proyecto. Quién lo completó. Quién lo aprobó. Con qué puntuación. Qué nota dejó. Todo documentado.",
    icon: "verified_user",
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
  {
    metric: "Engagement real",
    description:
      "XP, niveles, atributos que crecen. El progreso es visible y adictivo. Tus empleados abren la app porque quieren, no porque deben.",
    icon: "trending_up",
    color: "text-tertiary",
    bg: "bg-tertiary/10",
  },
  {
    metric: "Decisiones con datos",
    description:
      "KPIs por empresa, departamento y persona. Tasa de completado, puntualidad, rendimiento. Todo en tiempo real.",
    icon: "analytics",
    color: "text-on-tertiary-container",
    bg: "bg-on-tertiary-container/10",
  },
]

function TransformationSection() {
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
          Resultados
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          Qué pasa cuando tu equipo tiene misiones claras
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {results.map((r, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-[1.02]"
              style={stagger(section.visible, i, 120)}
            >
              <div className="flex h-full flex-col rounded-lg bg-surface-bright p-6">
                <div
                  className={`mb-4 flex h-11 w-11 items-center justify-center rounded-full ${r.bg}`}
                >
                  <Icon name={r.icon} className={`text-2xl ${r.color}`} />
                </div>
                <h3 className={`mb-2 font-headline text-lg font-bold ${r.color}`}>
                  {r.metric}
                </h3>
                <p className="font-body text-sm leading-relaxed text-on-surface-variant/70">
                  {r.description}
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
// SECTION 4 — Cómo funciona (timeline)
// ---------------------------------------------------------------------------

const steps = [
  {
    title: "El admin crea un proyecto",
    description:
      "Define objetivos, asigna XP, establece deadline. Elige la empresa y el equipo.",
    detail: "Con selector de iconos, skills asociados y prioridad",
  },
  {
    title: "Lo asigna al equipo",
    description:
      "Cada empleado recibe notificación. El primer objetivo se desbloquea automáticamente.",
    detail: "Asignación individual o por departamento",
  },
  {
    title: "El empleado completa misiones",
    description:
      "Avanza objetivo por objetivo. Ve su progreso en tiempo real. Cada paso desbloquea el siguiente.",
    detail: "Sistema de bloqueo secuencial — sin saltarse pasos",
  },
  {
    title: "El manager aprueba y evalúa",
    description:
      "Puntúa 8 atributos del 1 al 5. Deja una nota personal. Puede rechazar con feedback constructivo.",
    detail: "El rechazo no penaliza — mantiene el 80% del progreso",
  },
  {
    title: "El empleado sube de nivel",
    description:
      "Gana XP, sus atributos crecen, su perfil refleja su evolución real. Todo visible, todo medible.",
    detail: "Curva exponencial — niveles iniciales rápidos, niveles altos prestigiosos",
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
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          Así funciona, en la práctica
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden lg:block">
          {/* Connector line */}
          <div className="relative">
            <div className="absolute left-[10%] right-[10%] top-[18px] h-px bg-gradient-to-r from-primary/30 via-primary/10 to-primary/30" />
          </div>

          <div className="grid grid-cols-5 gap-6">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative flex flex-col items-center text-center transition-all duration-500"
                style={stagger(section.visible, i, 150)}
              >
                {/* Step number */}
                <span className="relative z-10 mb-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-container-lowest font-headline text-xl font-black text-primary ring-2 ring-primary/30">
                  {i + 1}
                </span>

                {/* Card */}
                <div className="w-full rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
                  <div className="rounded-lg bg-surface-bright px-4 py-5">
                    <h3 className="mb-2 font-headline text-sm font-bold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mb-3 font-body text-xs leading-relaxed text-on-surface-variant/70">
                      {step.description}
                    </p>
                    <p className="font-body text-[10px] leading-relaxed text-primary/60">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="lg:hidden">
          <div className="relative ml-5 border-l border-primary/20 pl-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className="relative mb-10 last:mb-0 transition-all duration-500"
                style={{
                  transitionDelay: section.visible ? `${i * 120}ms` : "0ms",
                  opacity: section.visible ? 1 : 0,
                  transform: section.visible
                    ? "translateX(0)"
                    : "translateX(-20px)",
                }}
              >
                {/* Number on the line */}
                <span className="absolute -left-[calc(2rem+13px)] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-surface-container-lowest font-headline text-sm font-black text-primary ring-2 ring-primary/30">
                  {i + 1}
                </span>

                <div className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)]">
                  <div className="rounded-lg bg-surface-bright p-5">
                    <h3 className="mb-1 font-headline text-sm font-bold text-on-surface">
                      {step.title}
                    </h3>
                    <p className="mb-2 font-body text-xs leading-relaxed text-on-surface-variant/70">
                      {step.description}
                    </p>
                    <p className="font-body text-[10px] leading-relaxed text-primary/60">
                      {step.detail}
                    </p>
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
// SECTION 5 — Para cada rol
// ---------------------------------------------------------------------------

const roles = [
  {
    icon: "shield_person",
    title: "CEO / Director",
    subtitle: "Visibilidad total sin microgestión",
    color: "text-primary",
    borderColor: "border-primary/20",
    bg: "bg-primary/10",
    points: [
      "Dashboard con KPIs por empresa y departamento",
      "Tasa de completado, puntualidad y rendimiento en tiempo real",
      "Gestión de múltiples empresas desde una sola cuenta",
      "Datos para presentar al consejo, no intuiciones",
    ],
  },
  {
    icon: "supervisor_account",
    title: "Manager",
    subtitle: "Feedback estructurado que mejora al equipo",
    color: "text-tertiary",
    borderColor: "border-tertiary/20",
    bg: "bg-tertiary/10",
    points: [
      "Aprueba misiones puntuando 8 atributos profesionales",
      "Deja notas personalizadas que el empleado realmente lee",
      "Ve quién está bloqueado sin preguntar 'cómo vas'",
      "Crea proyectos con objetivos claros en minutos",
    ],
  },
  {
    icon: "person",
    title: "Empleado",
    subtitle: "Saber exactamente dónde estás y hacia dónde vas",
    color: "text-secondary",
    borderColor: "border-secondary/20",
    bg: "bg-secondary/10",
    points: [
      "Perfil profesional con atributos que crecen con cada misión",
      "Feedback real después de cada proyecto, no una vez al año",
      "Nivel, XP y skills visibles — tu crecimiento tiene forma",
      "Notificaciones cuando se aprueba tu trabajo, con la nota del manager",
    ],
  },
]

function RolesSection() {
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
          Para tu organización
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          Diseñado para cada persona de tu organización
        </h2>

        <div className="grid gap-6 lg:grid-cols-3">
          {roles.map((role, i) => (
            <div
              key={i}
              className="rounded-xl bg-surface-container-highest p-1 shadow-[0px_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500 hover:scale-[1.02]"
              style={stagger(section.visible, i, 150)}
            >
              <div className="flex h-full flex-col rounded-lg bg-surface-bright p-6">
                {/* Header */}
                <div className="mb-5 flex items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full ${role.bg}`}
                  >
                    <Icon
                      name={role.icon}
                      className={`text-2xl ${role.color}`}
                    />
                  </div>
                  <div>
                    <h3 className={`font-headline text-base font-bold ${role.color}`}>
                      {role.title}
                    </h3>
                    <p className="font-body text-xs text-on-surface-variant/70">
                      {role.subtitle}
                    </p>
                  </div>
                </div>

                {/* Checkpoints */}
                <ul className="flex flex-col gap-3">
                  {role.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-2.5">
                      <Icon
                        name="check_circle"
                        className={`mt-0.5 text-base ${role.color}`}
                      />
                      <span className="font-body text-sm leading-relaxed text-on-surface-variant">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Main Landing Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <HeroSection />
      <SecondHeroSection />
      <ProblemSection />
      <TransformationSection />
      <HowItWorksSection />
      <RolesSection />
    </main>
  )
}
