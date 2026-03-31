"use client"

import { useRef, useState, useEffect } from "react"
import Link from "next/link"
import { useLandingLang } from "./LandingContext"
import { t } from "./LandingTranslations"

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
  const { lang } = useLandingLang()
  const s = t[lang]

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
          {s.heroPhilosophy}{" "}
          <span className="text-primary font-semibold">
            {s.heroFusion}
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
  const { lang } = useLandingLang()
  const s = t[lang]

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
          {s.heroHeadline}
          <span className="bg-gradient-to-r from-primary to-primary-fixed bg-clip-text text-transparent">
            {s.heroHeadlineHighlight}
          </span>
        </h2>

        <p className="mt-6 max-w-2xl font-body text-lg text-on-surface-variant sm:text-xl">
          {s.heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/sign-up"
            className="group relative rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim px-8 py-3.5 text-[10px] font-bold uppercase tracking-widest text-on-primary shadow-[0_0_25px_rgba(233,196,0,0.2)] transition-transform active:scale-95"
          >
            <span className="relative z-10">{s.ctaStart}</span>
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
            {s.ctaHow}
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

function ProblemSection() {
  const section = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const painPoints = [
    {
      icon: "visibility_off",
      color: "text-error",
      bg: "bg-error/10",
      title: s.painTitle0,
      description: s.painDesc0,
    },
    {
      icon: "description",
      color: "text-outline",
      bg: "bg-outline/10",
      title: s.painTitle1,
      description: s.painDesc1,
    },
    {
      icon: "trending_down",
      color: "text-error",
      bg: "bg-error/10",
      title: s.painTitle2,
      description: s.painDesc2,
    },
    {
      icon: "gavel",
      color: "text-outline",
      bg: "bg-outline/10",
      title: s.painTitle3,
      description: s.painDesc3,
    },
    {
      icon: "mood_bad",
      color: "text-error",
      bg: "bg-error/10",
      title: s.painTitle4,
      description: s.painDesc4,
    },
    {
      icon: "help_center",
      color: "text-outline",
      bg: "bg-outline/10",
      title: s.painTitle5,
      description: s.painDesc5,
    },
  ]

  return (
    <section
      ref={section.ref}
      id="como-funciona"
      className={`relative bg-surface-container-lowest px-6 py-24 transition-all duration-700 ${
        section.visible
          ? "translate-y-0 opacity-100"
          : "translate-y-10 opacity-0"
      }`}
    >
      <div className="mx-auto max-w-[1600px]">
        <span className="mb-4 block text-center text-[10px] font-bold uppercase tracking-widest text-error font-label">
          {s.problemLabel}
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          {s.problemHeadline}
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

function TransformationSection() {
  const section = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const results = [
    {
      metric: s.resultMetric0,
      description: s.resultDesc0,
      icon: "rate_review",
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      metric: s.resultMetric1,
      description: s.resultDesc1,
      icon: "verified_user",
      color: "text-secondary",
      bg: "bg-secondary/10",
    },
    {
      metric: s.resultMetric2,
      description: s.resultDesc2,
      icon: "trending_up",
      color: "text-tertiary",
      bg: "bg-tertiary/10",
    },
    {
      metric: s.resultMetric3,
      description: s.resultDesc3,
      icon: "analytics",
      color: "text-on-tertiary-container",
      bg: "bg-on-tertiary-container/10",
    },
  ]

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
          {s.transformLabel}
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          {s.transformHeadline}
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

function HowItWorksSection() {
  const section = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const steps = [
    { title: s.stepTitle0, description: s.stepDesc0, detail: s.stepDetail0 },
    { title: s.stepTitle1, description: s.stepDesc1, detail: s.stepDetail1 },
    { title: s.stepTitle2, description: s.stepDesc2, detail: s.stepDetail2 },
    { title: s.stepTitle3, description: s.stepDesc3, detail: s.stepDetail3 },
    { title: s.stepTitle4, description: s.stepDesc4, detail: s.stepDetail4 },
  ]

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
        <span className="mb-4 block text-center text-[10px] font-bold uppercase tracking-widest text-primary font-label">
          {s.howLabel}
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          {s.howHeadline}
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

function RolesSection() {
  const section = useScrollReveal()
  const { lang } = useLandingLang()
  const s = t[lang]

  const roles = [
    {
      icon: "shield_person",
      title: s.roleTitle0,
      subtitle: s.roleSubtitle0,
      color: "text-primary",
      borderColor: "border-primary/20",
      bg: "bg-primary/10",
      points: [s.rolePoint0_0, s.rolePoint0_1, s.rolePoint0_2, s.rolePoint0_3],
    },
    {
      icon: "supervisor_account",
      title: s.roleTitle1,
      subtitle: s.roleSubtitle1,
      color: "text-tertiary",
      borderColor: "border-tertiary/20",
      bg: "bg-tertiary/10",
      points: [s.rolePoint1_0, s.rolePoint1_1, s.rolePoint1_2, s.rolePoint1_3],
    },
    {
      icon: "person",
      title: s.roleTitle2,
      subtitle: s.roleSubtitle2,
      color: "text-secondary",
      borderColor: "border-secondary/20",
      bg: "bg-secondary/10",
      points: [s.rolePoint2_0, s.rolePoint2_1, s.rolePoint2_2, s.rolePoint2_3],
    },
  ]

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
          {s.rolesLabel}
        </span>
        <h2 className="mb-16 text-center font-headline text-3xl font-extrabold text-on-surface sm:text-4xl lg:text-5xl">
          {s.rolesHeadline}
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
