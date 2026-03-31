"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  useScrollReveal — triggers once when element enters viewport      */
/* ------------------------------------------------------------------ */
function useScrollReveal(threshold = 0.15) {
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
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

/* ------------------------------------------------------------------ */
/*  AnimatedCounter — counts up when visible                          */
/* ------------------------------------------------------------------ */
function AnimatedCounter({
  value,
  prefix = "",
  suffix = "",
}: {
  value: number;
  prefix?: string;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const { ref, visible } = useScrollReveal();

  useEffect(() => {
    if (!visible) return;
    let current = 0;
    const step = value / 40;
    const timer = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 30);
    return () => clearInterval(timer);
  }, [visible, value]);

  return (
    <div ref={ref}>
      <span className="text-5xl md:text-6xl font-headline font-black text-primary">
        {prefix}
        {count}
        {suffix}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section wrapper with scroll reveal                                */
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
/*  Stagger wrapper — delays children appearance                      */
/* ------------------------------------------------------------------ */
function StaggerItem({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const { ref, visible } = useScrollReveal(0.1);
  return (
    <div
      ref={ref}
      className="transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {children}
    </div>
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
          Tu equipo vera algo asi
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
                      Buenos dias
                    </p>
                    <h3 className="text-lg font-headline font-bold text-on-surface">
                      Bienvenido, Maria
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
                      <div
                        className="h-full rounded-full bg-tertiary"
                        style={{ width: "72%" }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-surface-container-lowest p-3">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs font-body font-medium text-on-surface">
                        Campana Q2
                      </p>
                      <span className="text-[10px] font-label text-secondary">
                        45%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className="h-full rounded-full bg-secondary"
                        style={{ width: "45%" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-on-surface-variant font-body text-sm mt-8">
        Diseno dark premium inspirado en videojuegos AAA
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 6 — Argumentos Profundos                                  */
/* ------------------------------------------------------------------ */

const attributes = [
  { name: "Logica", width: "85%", color: "bg-primary" },
  { name: "Creatividad", width: "72%", color: "bg-tertiary" },
  { name: "Liderazgo", width: "60%", color: "bg-secondary" },
  { name: "Negociacion", width: "90%", color: "bg-on-tertiary-container" },
  { name: "Estrategia", width: "55%", color: "bg-primary" },
  { name: "Analisis", width: "78%", color: "bg-tertiary" },
  { name: "Comunicacion", width: "68%", color: "bg-secondary" },
  { name: "Adaptabilidad", width: "82%", color: "bg-on-tertiary-container" },
];

function AttributeBarsVisual() {
  return (
    <div className="space-y-2.5">
      {attributes.map((attr) => (
        <div key={attr.name} className="flex items-center gap-3">
          <span className="text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant w-24 text-right shrink-0">
            {attr.name}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
            <div
              className={`h-full rounded-full ${attr.color} transition-all duration-1000`}
              style={{ width: attr.width }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RejectionFlowVisual() {
  return (
    <div className="flex items-center justify-center gap-2 md:gap-4">
      {[
        { icon: "cancel", label: "Rechazo", color: "text-error" },
        { icon: "description", label: "Nota", color: "text-on-surface-variant" },
        { icon: "send", label: "Reenvio", color: "text-tertiary" },
        { icon: "check_circle", label: "Aprobado", color: "text-secondary" },
      ].map((step, i) => (
        <div key={step.label} className="flex items-center gap-2 md:gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-12 h-12 rounded-lg bg-surface-container-lowest flex items-center justify-center">
              <span className={`material-symbols-outlined ${step.color} text-xl`}>
                {step.icon}
              </span>
            </div>
            <span className="text-[9px] font-label font-bold uppercase tracking-widest text-on-surface-variant">
              {step.label}
            </span>
          </div>
          {i < 3 && (
            <div className="w-6 h-px bg-outline-variant" />
          )}
        </div>
      ))}
    </div>
  );
}

function DeadlineBadgesVisual() {
  return (
    <div className="flex flex-col gap-4 items-center md:items-start">
      {[
        {
          icon: "schedule",
          label: "48h — Recordatorio",
          color: "text-tertiary",
          bg: "bg-tertiary/10",
          ring: "ring-tertiary/20",
        },
        {
          icon: "warning",
          label: "24h — Alerta",
          color: "text-primary",
          bg: "bg-primary/10",
          ring: "ring-primary/20",
        },
        {
          icon: "error",
          label: "Vencido — Escalacion",
          color: "text-error",
          bg: "bg-error/10",
          ring: "ring-error/20",
        },
      ].map((badge) => (
        <div
          key={badge.label}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg ${badge.bg} ring-1 ${badge.ring}`}
        >
          <span className={`material-symbols-outlined ${badge.color} text-lg`}>
            {badge.icon}
          </span>
          <span className={`text-xs font-body font-medium ${badge.color}`}>
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function MultiOrgVisual() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative">
        {/* Central node */}
        <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center z-10 relative">
          <span className="material-symbols-outlined text-primary text-xl">
            hub
          </span>
        </div>
        {/* Org nodes */}
        {[
          { top: "-40px", left: "-70px", icon: "business", color: "tertiary" },
          { top: "-40px", left: "70px", icon: "storefront", color: "secondary" },
          { top: "50px", left: "0px", icon: "corporate_fare", color: "on-tertiary-container" },
        ].map((org) => (
          <div
            key={org.icon}
            className="absolute flex flex-col items-center"
            style={{ top: org.top, left: org.left, transform: "translate(-50%, -50%)" }}
          >
            <div className={`w-10 h-10 rounded-full bg-${org.color}/15 border border-${org.color}/40 flex items-center justify-center`}>
              <span className={`material-symbols-outlined text-${org.color} text-sm`}>
                {org.icon}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditTrailVisual() {
  return (
    <div className="flex items-center justify-center gap-4">
      {[
        { icon: "verified", color: "text-secondary" },
        { icon: "description", color: "text-tertiary" },
        { icon: "gavel", color: "text-primary" },
      ].map((item, i) => (
        <div key={item.icon} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-lg bg-surface-container-lowest flex items-center justify-center">
            <span className={`material-symbols-outlined ${item.color} text-2xl`}>
              {item.icon}
            </span>
          </div>
          {i < 2 && (
            <div className="w-8 h-px bg-outline-variant" />
          )}
        </div>
      ))}
    </div>
  );
}

function SkillPillsVisual() {
  const skills = [
    { name: "React", level: 8, color: "bg-tertiary text-on-tertiary" },
    { name: "Ventas", level: 6, color: "bg-secondary text-on-secondary" },
    { name: "Negociacion", level: 7, color: "bg-primary text-on-primary" },
    { name: "SQL", level: 5, color: "bg-on-tertiary-container text-on-tertiary-fixed" },
    { name: "Liderazgo", level: 4, color: "bg-outline text-surface" },
  ];
  return (
    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
      {skills.map((skill) => (
        <span
          key={skill.name}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-label font-bold uppercase tracking-widest ${skill.color}`}
        >
          {skill.name}
          <span className="opacity-70">Nv.{skill.level}</span>
        </span>
      ))}
    </div>
  );
}

const deepArguments = [
  {
    title: "8 atributos, no una casilla de verificacion",
    body: "Cuando un manager aprueba una mision, no marca un 'completado'. Puntua Logica, Creatividad, Liderazgo, Negociacion, Estrategia, Analisis, Comunicacion y Adaptabilidad. Del 1 al 5. Cada puntuacion actualiza el perfil del empleado. Despues de 10 misiones, tienes un mapa real de quien es esa persona profesionalmente.",
    Visual: AttributeBarsVisual,
  },
  {
    title: "El rechazo no castiga, ensena",
    body: "Si un manager rechaza una mision, el empleado no pierde su progreso. Mantiene el 80%. Recibe una nota explicando que mejorar. Puede reenviar. No es un sistema de castigo — es un sistema de mejora continua.",
    Visual: RejectionFlowVisual,
  },
  {
    title: "Deadlines que se respetan solos",
    body: "48 horas antes: recordatorio. 24 horas: alerta. Vencido: escalacion. Tres niveles de urgencia que eliminan la necesidad de que el manager mande emails de seguimiento. El sistema lo hace por ti.",
    Visual: DeadlineBadgesVisual,
  },
  {
    title: "Multi-empresa sin friccion",
    body: "Gestionas una agencia con 12 clientes? Un holding con 5 marcas? Una cuenta. Todas las empresas. Cada empleado ve su contexto. El CEO ve el panorama completo. Sin duplicar licencias.",
    Visual: MultiOrgVisual,
  },
  {
    title: "Compliance que se documenta solo",
    body: "Quien aprobo el ascenso de Maria? Que puntuacion tenia Carlos cuando fue despedido? Cuantas misiones completo Ana antes de su promocion? Todo registrado. Todo trazable. Todo defendible.",
    Visual: AuditTrailVisual,
  },
  {
    title: "Skills que se demuestran, no se declaran",
    body: "Cada mision puede estar etiquetada con habilidades tecnicas: React, Ventas, Negociacion, SQL. Al completar misiones, el empleado acumula puntos de skill. Nivel 1 a 10. No es un curso — es evidencia de trabajo real.",
    Visual: SkillPillsVisual,
  },
];

function DeepArgumentsSection() {
  return (
    <Section id="argumentos">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-4">
          Por que funciona
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-4">
          No es un juego. Es tu sistema de gestion de talento.
        </h2>
        <p className="text-base font-body text-on-surface-variant leading-relaxed">
          Cada decision en tu empresa deja un rastro. Cada empleado tiene un
          perfil que cuenta su historia. Esto es lo que cambia.
        </p>
      </div>

      <div className="space-y-20 md:space-y-28">
        {deepArguments.map((arg, i) => {
          const isReversed = i % 2 !== 0;
          return (
            <StaggerItem key={arg.title} index={i}>
              <div
                className={`flex flex-col ${isReversed ? "md:flex-row-reverse" : "md:flex-row"} gap-10 md:gap-16 items-center`}
              >
                {/* Text column — 60% */}
                <div className="w-full md:w-[60%]">
                  <h3 className="text-xl md:text-2xl font-headline font-bold text-on-surface mb-4">
                    {arg.title}
                  </h3>
                  <p className="text-base font-body text-on-surface-variant leading-relaxed">
                    {arg.body}
                  </p>
                </div>

                {/* Visual column — 40% */}
                <div className="w-full md:w-[40%]">
                  <div className="rounded-xl bg-surface-container-highest p-1">
                    <div className="rounded-lg bg-surface-bright p-6">
                      <arg.Visual />
                    </div>
                  </div>
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 7 — Preguntas Incómodas                                   */
/* ------------------------------------------------------------------ */

const awkwardQuestions = [
  "Cuantos de tus empleados recibieron feedback esta semana?",
  "Puedes demostrar por que ascendiste a uno y no a otro?",
  "Sabes quien de tu equipo tiene skills en [tecnologia X]?",
  "Tus managers evaluan con datos o con intuicion?",
  "Si un empleado se va manana, tienes registro de su contribucion?",
  "Cuanto tiempo pasa entre que alguien termina un proyecto y recibe feedback?",
];

function AwkwardQuestionsSection() {
  return (
    <section className="py-20 md:py-28 bg-surface-container-lowest">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="text-center mb-14 max-w-2xl mx-auto">
          <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-4">
            Reflexiona
          </p>
          <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
            Preguntas que tu empresa deberia poder responder
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {awkwardQuestions.map((q, i) => (
            <StaggerItem key={q} index={i}>
              <div className="rounded-xl bg-surface-container-highest p-1 shadow-card h-full">
                <div className="rounded-lg bg-surface-bright p-6 h-full flex items-start gap-4">
                  <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
                    help_outline
                  </span>
                  <p className="text-sm font-body text-on-surface leading-relaxed">
                    {q}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </div>

        <p className="text-center text-on-surface-variant font-body text-base mt-12 max-w-xl mx-auto">
          Si no puedes responder con certeza,{" "}
          <span className="text-primary font-semibold">Work Leveling</span> te
          da las respuestas.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 8 — Métricas de Impacto                                   */
/* ------------------------------------------------------------------ */

const metrics = [
  { value: 3, suffix: "x", label: "mas feedback por empleado al mes" },
  { value: 91, suffix: "%", label: "tasa promedio de cumplimiento de deadlines" },
  { value: 24, prefix: "<", suffix: "h", label: "tiempo medio de respuesta en aprobaciones" },
  { value: 100, suffix: "%", label: "trazabilidad en decisiones de personal" },
];

function MetricsSection() {
  return (
    <Section id="metricas">
      <div className="text-center mb-14">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-4">
          Impacto real
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Lo que miden las empresas que usan Work Leveling
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {metrics.map((m, i) => (
          <StaggerItem key={m.label} index={i}>
            <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
              <div className="rounded-lg bg-surface-bright p-6 text-center">
                <AnimatedCounter
                  value={m.value}
                  prefix={m.prefix}
                  suffix={m.suffix}
                />
                <p className="mt-3 text-sm font-body text-on-surface-variant leading-snug">
                  {m.label}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </div>

      <p className="text-center text-xs font-body text-on-surface-variant/60 mt-8">
        Datos basados en uso interno durante fase de desarrollo
      </p>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 9 — Pricing                                               */
/* ------------------------------------------------------------------ */

const plans = [
  {
    name: "Starter",
    price: "Gratis",
    period: "",
    badge: null,
    features: [
      "Hasta 5 usuarios",
      "1 empresa",
      "Proyectos ilimitados",
      "Misiones y aprobaciones",
      "8 atributos profesionales",
      "Notificaciones",
    ],
    cta: "Empezar Gratis",
    href: "/sign-up",
    popular: false,
  },
  {
    name: "Professional",
    price: "9\u20AC",
    period: "/usuario/mes",
    badge: "RECOMENDADO",
    features: [
      "Usuarios ilimitados",
      "Hasta 3 empresas",
      "Todo de Starter +",
      "Skills y niveles tecnicos",
      "KPIs y estadisticas avanzadas",
      "Deadlines con alertas automaticas",
      "Soporte prioritario",
    ],
    cta: "Probar 14 dias gratis",
    href: "/sign-up",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Contacto",
    period: "",
    badge: null,
    features: [
      "Todo de Professional +",
      "Empresas ilimitadas",
      "API personalizada",
      "SSO / SAML",
      "Manager de cuenta dedicado",
      "Onboarding personalizado",
      "SLA garantizado",
    ],
    cta: "Contactar",
    href: "mailto:info@workleveling.com",
    popular: false,
  },
];

function PricingSection() {
  return (
    <Section id="precios">
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-4">
          Precios
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-3">
          Empieza hoy. Escala cuando quieras.
        </h2>
        <p className="text-base font-body text-on-surface-variant">
          Sin compromiso. Sin tarjeta de credito para empezar.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <StaggerItem key={plan.name} index={i}>
            <div
              className={`rounded-xl bg-surface-container-highest p-1 shadow-card transition-transform ${
                plan.popular
                  ? "ring-2 ring-primary md:scale-105 relative z-10"
                  : ""
              }`}
            >
              <div className="rounded-lg bg-surface-bright p-6 flex flex-col h-full">
                {/* Badge */}
                {plan.badge && (
                  <span className="self-start mb-4 px-3 py-1 rounded-full bg-primary text-on-primary text-[10px] font-label font-bold uppercase tracking-widest">
                    {plan.badge}
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
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm font-body text-on-surface-variant"
                    >
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
          </StaggerItem>
        ))}
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 10 — CTA Final                                            */
/* ------------------------------------------------------------------ */
function CtaSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-primary/5 to-surface pointer-events-none" />

      <div className="relative max-w-[1600px] mx-auto px-6 md:px-12 text-center">
        <div className="max-w-2xl mx-auto space-y-2 mb-12">
          <p className="text-lg md:text-xl font-body text-on-surface leading-relaxed">
            Tus empleados merecen saber como lo estan haciendo.
          </p>
          <p className="text-lg md:text-xl font-body text-on-surface leading-relaxed">
            Tus managers merecen herramientas para evaluar con justicia.
          </p>
          <p className="text-lg md:text-xl font-body text-on-surface-variant leading-relaxed">
            Tu empresa merece{" "}
            <span className="text-primary font-semibold">
              datos que defiendan cada decision.
            </span>
          </p>
        </div>

        <Link
          href="/sign-up"
          className="inline-block px-10 py-4 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-label font-bold uppercase tracking-widest shadow-glow-gold transition-all active:scale-95 hover:shadow-[0_0_35px_rgba(233,196,0,0.4)]"
        >
          Crear cuenta gratis
        </Link>
        <p className="mt-4 text-sm font-body text-on-surface-variant">
          Implementacion en menos de 5 minutos
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 11 — Footer                                               */
/* ------------------------------------------------------------------ */

const footerLinks = {
  Producto: [
    { label: "Producto", href: "#argumentos" },
    { label: "Precios", href: "#precios" },
    { label: "Contacto", href: "mailto:info@workleveling.com" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Terminos", href: "#" },
  ],
};

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
              La plataforma de gestion de talento que convierte cada proyecto en
              evidencia de rendimiento.
            </p>
            {/* Social icons */}
            <div className="flex gap-3 pt-2">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-.5 15.5v-5.3a3.26 3.26 0 00-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 011.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 001.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 00-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="X / Twitter"
                className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
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
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
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
      <DeepArgumentsSection />
      <AwkwardQuestionsSection />
      <MetricsSection />
      <PricingSection />
      <CtaSection />
      <Footer />
    </>
  );
}
