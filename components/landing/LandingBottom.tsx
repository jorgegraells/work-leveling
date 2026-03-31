"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  useScrollReveal — triggers once when element enters viewport      */
/* ------------------------------------------------------------------ */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  AnimatedNumber                                                     */
/* ------------------------------------------------------------------ */
function AnimatedNumber({
  target,
  suffix,
}: {
  target: number;
  suffix: string;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    let current = 0;
    const step = target / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [visible, target]);

  return (
    <div ref={ref}>
      <span className="text-5xl font-headline font-black text-primary">
        {count}
        {suffix}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper                                                    */
/* ------------------------------------------------------------------ */
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <section
      id={id}
      ref={ref}
      className={`py-20 md:py-28 transition-opacity duration-700 ${visible ? "opacity-100" : "opacity-0"} ${className}`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 5 — Mockup / Demo Visual                                  */
/* ------------------------------------------------------------------ */
function MockupSection() {
  return (
    <Section id="demo">
      <div className="text-center mb-12">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Vista del empleado — Dashboard
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Tu equipo verá algo así
        </h2>
      </div>

      {/* Glow wrapper */}
      <div className="relative mx-auto max-w-4xl">
        <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl pointer-events-none" />

        {/* Wood-bezel frame */}
        <div className="relative rounded-xl bg-surface-container-highest p-1 shadow-card-lg">
          <div className="rounded-lg bg-surface-bright overflow-hidden">
            {/* Fake top bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest/60">
              <span className="w-2.5 h-2.5 rounded-full bg-error/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60" />
              <span className="w-2.5 h-2.5 rounded-full bg-secondary/60" />
              <span className="ml-3 text-[10px] font-label text-on-surface-variant">
                app.workleveling.com/dashboard
              </span>
            </div>

            <div className="flex min-h-[320px]">
              {/* Mini sidebar */}
              <div className="w-14 shrink-0 bg-surface-container-lowest flex flex-col items-center py-4 gap-5">
                <span className="material-symbols-outlined text-primary text-xl">
                  home
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  assignment
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  bar_chart
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  group
                </span>
                <span className="material-symbols-outlined text-on-surface-variant text-xl">
                  settings
                </span>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-5 space-y-5">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-body text-on-surface-variant">
                      Buenos días
                    </p>
                    <h3 className="text-lg font-headline font-bold text-on-surface">
                      Bienvenido, María
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">
                      Nivel 12
                    </span>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-sm">
                        person
                      </span>
                    </div>
                  </div>
                </div>

                {/* KPI cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-container-lowest p-3">
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      XP Total
                    </p>
                    <p className="text-xl font-headline font-black text-primary">
                      4,820
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full w-3/4 rounded-full bg-primary" />
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-container-lowest p-3">
                    <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                      Misiones
                    </p>
                    <p className="text-xl font-headline font-black text-secondary">
                      18/24
                    </p>
                    <div className="mt-2 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full w-3/5 rounded-full bg-secondary" />
                    </div>
                  </div>
                </div>

                {/* Project bars */}
                <div className="space-y-3">
                  <div className="rounded-lg bg-surface-container-lowest p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-body font-medium text-on-surface">
                        Proyecto Alpha
                      </p>
                      <span className="text-[10px] font-label text-tertiary">
                        72%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full rounded-full bg-tertiary" style={{ width: "72%" }} />
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-container-lowest p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-body font-medium text-on-surface">
                        Campaña Q2
                      </p>
                      <span className="text-[10px] font-label text-secondary">
                        45%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div className="h-full rounded-full bg-secondary" style={{ width: "45%" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-on-surface-variant font-body text-sm mt-8">
        Diseño dark premium inspirado en videojuegos AAA
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 6 — Beneficios para cada rol                               */
/* ------------------------------------------------------------------ */
const roles = [
  {
    icon: "shield_person",
    title: "Para el CEO / Director",
    accent: "text-primary",
    accentBg: "bg-primary/10",
    accentBorder: "ring-primary/20",
    bullets: [
      "Visibilidad total del rendimiento de tu equipo",
      "KPIs en tiempo real por empresa y departamento",
      "Decisiones basadas en datos, no intuiciones",
    ],
  },
  {
    icon: "supervisor_account",
    title: "Para el Manager",
    accent: "text-tertiary",
    accentBg: "bg-tertiary/10",
    accentBorder: "ring-tertiary/20",
    bullets: [
      "Aprueba misiones y evalúa atributos",
      "Crea proyectos y asigna a tu equipo",
      "Seguimiento del progreso en tiempo real",
    ],
  },
  {
    icon: "person",
    title: "Para el Empleado",
    accent: "text-secondary",
    accentBg: "bg-secondary/10",
    accentBorder: "ring-secondary/20",
    bullets: [
      "Ve tu progreso con barras de skills y niveles",
      "Completa misiones y sube de nivel",
      "Recibe feedback real de tus managers",
    ],
  },
] as const;

function BenefitsSection() {
  return (
    <Section id="roles">
      <div className="text-center mb-14">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Para cada rol
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Beneficios para todo tu equipo
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.title}
            className="rounded-xl bg-surface-container-highest p-1 shadow-card"
          >
            <div className="rounded-lg bg-surface-bright p-6 h-full flex flex-col">
              <div
                className={`w-12 h-12 rounded-lg ${role.accentBg} flex items-center justify-center mb-5`}
              >
                <span className={`material-symbols-outlined ${role.accent} text-2xl`}>
                  {role.icon}
                </span>
              </div>
              <h3 className={`text-lg font-headline font-bold ${role.accent} mb-4`}>
                {role.title}
              </h3>
              <ul className="space-y-3 flex-1">
                {role.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm font-body text-on-surface-variant">
                    <span className={`material-symbols-outlined ${role.accent} text-base mt-0.5 shrink-0`}>
                      check_circle
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 7 — Números / Social Proof                                 */
/* ------------------------------------------------------------------ */
const stats = [
  { target: 200, suffix: "%", label: "de engagement en equipos que usan Work Leveling" },
  { target: 95, suffix: "%", label: "de empleados reportan mayor claridad en sus objetivos" },
  { target: 3, suffix: "x", label: "más feedback entre managers y empleados" },
  { target: 24, suffix: "h", label: "para implementación completa" },
] as const;

function SocialProofSection() {
  return (
    <Section id="resultados">
      <div className="text-center mb-14">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Resultados reales
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Números que hablan solos
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-surface-container-highest p-1 shadow-card"
          >
            <div className="rounded-lg bg-surface-bright p-6 text-center">
              <AnimatedNumber target={s.target} suffix={s.suffix} />
              <p className="mt-3 text-sm font-body text-on-surface-variant leading-snug">
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 8 — Pricing                                                */
/* ------------------------------------------------------------------ */
const plans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    features: [
      "Hasta 5 empleados",
      "1 empresa",
      "Proyectos ilimitados",
      "Soporte por email",
    ],
    cta: "Empezar Gratis",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Professional",
    price: "9\u20AC",
    period: "/usuario/mes",
    features: [
      "Empleados ilimitados",
      "3 empresas",
      "KPIs avanzados",
      "Soporte prioritario",
    ],
    cta: "Solicitar Demo",
    href: "mailto:info@workleveling.com",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Contacto",
    period: "",
    features: [
      "Todo de Professional",
      "Empresas ilimitadas",
      "API personalizada",
      "Manager dedicado",
      "SSO / SAML",
    ],
    cta: "Contactar Ventas",
    href: "mailto:info@workleveling.com",
    popular: false,
  },
] as const;

function PricingSection() {
  return (
    <Section id="precios">
      <div className="text-center mb-14">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Precios
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Un plan para cada equipo
        </h2>
        <p className="mt-3 text-on-surface-variant font-body text-sm max-w-md mx-auto">
          Empieza gratis y escala cuando lo necesites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl bg-surface-container-highest p-1 shadow-card transition-transform ${
              plan.popular ? "ring-2 ring-primary md:scale-105 relative z-10" : ""
            }`}
          >
            <div className="rounded-lg bg-surface-bright p-6 flex flex-col h-full">
              {/* Popular badge */}
              {plan.popular && (
                <span className="self-start mb-4 px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-label font-bold uppercase tracking-widest">
                  Popular
                </span>
              )}

              <h3 className="text-lg font-headline font-bold text-on-surface">
                {plan.name}
              </h3>

              <div className="mt-3 mb-5">
                <span className="text-3xl font-headline font-black text-primary">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-sm font-body text-on-surface-variant">
                    {plan.period}
                  </span>
                )}
              </div>

              <ul className="space-y-3 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-base">
                      check
                    </span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`block text-center py-3 rounded-md text-[10px] font-label font-bold uppercase tracking-widest transition-all active:scale-95 ${
                  plan.popular
                    ? "bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary"
                    : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 9 — CTA Final                                             */
/* ------------------------------------------------------------------ */
function CtaSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-primary/5 to-surface pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 text-center">
        <h2 className="text-3xl md:text-4xl font-headline font-black text-on-surface mb-4">
          ¿Listo para gamificar tu empresa?
        </h2>
        <p className="text-on-surface-variant font-body text-base md:text-lg max-w-lg mx-auto mb-10">
          Empieza gratis hoy. Sin tarjeta de crédito.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-label font-bold uppercase tracking-widest shadow-glow-gold transition-all active:scale-95 hover:shadow-[0_0_35px_rgba(233,196,0,0.4)]"
          >
            Crear Cuenta Gratis
          </Link>
          <Link
            href="mailto:info@workleveling.com"
            className="px-8 py-4 rounded-md text-on-surface text-[10px] font-label font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all active:scale-95"
          >
            Solicitar Demo
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 10 — Footer                                               */
/* ------------------------------------------------------------------ */
const footerLinks = {
  Producto: ["Producto", "Precios", "Blog"],
  Legal: ["Privacidad", "Términos"],
} as const;

function Footer() {
  return (
    <footer className="border-t border-outline-variant/15 bg-surface-container-lowest">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-12">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Brand */}
          <div className="space-y-3">
            <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary">
              Work Leveling
            </p>
            <p className="text-xs font-body text-on-surface-variant max-w-xs">
              La plataforma de gamificación laboral que transforma el rendimiento de tu equipo.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Link groups */}
          <div className="flex gap-16">
            {Object.entries(footerLinks).map(([group, links]) => (
              <div key={group}>
                <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface mb-3">
                  {group}
                </p>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface mb-3">
                Contacto
              </p>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:info@workleveling.com"
                    className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
                  >
                    info@workleveling.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-outline-variant/15 text-center">
          <p className="text-xs font-body text-on-surface-variant">
            &copy; 2026 Work Leveling. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */
export default function LandingBottom() {
  return (
    <>
      <MockupSection />
      <BenefitsSection />
      <SocialProofSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </>
  );
}
