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
/*  Browser Frame — reusable monitor chrome                           */
/* ------------------------------------------------------------------ */
function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-surface-container-highest p-1 shadow-card">
      <div className="rounded-lg bg-surface-bright overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-highest/60">
          <span className="w-2 h-2 rounded-full bg-error/60" />
          <span className="w-2 h-2 rounded-full bg-primary/60" />
          <span className="w-2 h-2 rounded-full bg-secondary/60" />
          <span className="ml-2 text-[8px] font-label text-on-surface-variant truncate">
            {url}
          </span>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Mini Progress Bar                                                  */
/* ------------------------------------------------------------------ */
function MiniBar({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  return (
    <div className="h-1 rounded-full bg-surface-container-lowest overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 5 — Mockup / Demo Visual  (dos mini-pantallas)            */
/* ------------------------------------------------------------------ */
function MockupSection() {
  return (
    <Section id="demo">
      <div className="text-center mb-12">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-3">
          Vista del empleado
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface">
          Así es como tu equipo ve su progreso
        </h2>
        <p className="text-sm font-body text-on-surface-variant mt-3">
          Diseño dark premium. Información clara. Progreso visible.
        </p>
      </div>

      {/* Glow wrapper */}
      <div className="relative mx-auto max-w-5xl">
        <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ---- Mini-pantalla 1: Dashboard ---- */}
          <div>
            <BrowserFrame url="workleveling.app/dashboard">
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-[8px] font-body text-on-surface-variant">Bienvenido,</p>
                  <p className="text-[11px] font-headline font-bold text-on-surface">María</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[7px] font-label font-bold text-on-surface-variant">Nivel 8</span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/20 text-[7px] font-label font-bold text-primary">
                    68% → 9
                  </span>
                </div>
              </div>

              {/* 4 KPI mini cards */}
              <div className="grid grid-cols-4 gap-1.5 mb-2">
                {[
                  { label: "XP", value: "1.2k", color: "text-primary" },
                  { label: "Activos", value: "3", color: "text-tertiary" },
                  { label: "Completados", value: "5", color: "text-secondary" },
                  { label: "Trofeos", value: "2", color: "text-on-tertiary-container" },
                ].map((kpi) => (
                  <div key={kpi.label} className="rounded bg-surface-container-lowest p-1.5 text-center">
                    <p className="text-[7px] font-label text-on-surface-variant">{kpi.label}</p>
                    <p className={`text-[11px] font-headline font-bold ${kpi.color}`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* 2 proyectos activos */}
              <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Proyectos activos
              </p>
              <div className="space-y-1.5 mb-2">
                <div className="rounded bg-surface-container-lowest p-1.5">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[8px] font-body text-on-surface">Rediseño Web</span>
                    <span className="text-[7px] font-label text-tertiary">65%</span>
                  </div>
                  <MiniBar percent={65} color="bg-tertiary" />
                </div>
                <div className="rounded bg-surface-container-lowest p-1.5">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="text-[8px] font-body text-on-surface">Migración API</span>
                    <span className="text-[7px] font-label text-secondary">30%</span>
                  </div>
                  <MiniBar percent={30} color="bg-secondary" />
                </div>
              </div>

              {/* 2 misiones pendientes */}
              <p className="text-[7px] font-label font-bold uppercase tracking-widest text-on-surface-variant mb-1">
                Misiones pendientes
              </p>
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-1.5 rounded bg-surface-container-lowest p-1.5">
                  <span className="material-symbols-outlined text-primary text-[11px]">flag</span>
                  <span className="text-[8px] font-body text-on-surface">Entregar prototipo v2</span>
                </div>
                <div className="flex items-center gap-1.5 rounded bg-surface-container-lowest p-1.5">
                  <span className="material-symbols-outlined text-tertiary text-[11px]">code</span>
                  <span className="text-[8px] font-body text-on-surface">Revisar pull requests</span>
                </div>
              </div>
            </BrowserFrame>
            <p className="text-center text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-3">
              Vista Dashboard — Centro de control
            </p>
          </div>

          {/* ---- Mini-pantalla 2: Perfil ---- */}
          <div>
            <BrowserFrame url="workleveling.app/perfil">
              {/* Centro: badge nivel + nombre */}
              <div className="flex flex-col items-center mb-3">
                <div className="relative w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mb-1.5 shadow-[0_0_16px_rgba(233,196,0,0.25)]">
                  <span className="text-[11px] font-headline font-black text-primary">8</span>
                  <span className="absolute -bottom-0.5 text-[6px] font-label font-bold text-primary uppercase">
                    Nivel
                  </span>
                </div>
                <p className="text-[10px] font-headline font-bold text-on-surface">María López</p>
                <p className="text-[7px] font-body text-on-surface-variant">Diseñadora Senior</p>
              </div>

              {/* Atributos — 2 columnas */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 mb-3">
                {/* Columna izquierda */}
                {[
                  { name: "Lógica", pct: 72, color: "bg-primary" },
                  { name: "Creatividad", pct: 85, color: "bg-tertiary" },
                  { name: "Liderazgo", pct: 45, color: "bg-secondary" },
                  { name: "Negociación", pct: 60, color: "bg-on-tertiary-container" },
                ].map((attr) => (
                  <div key={attr.name}>
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-label text-on-surface-variant">{attr.name}</span>
                      <span className="text-[7px] font-label text-on-surface-variant">{attr.pct}%</span>
                    </div>
                    <MiniBar percent={attr.pct} color={attr.color} />
                  </div>
                ))}
                {/* Columna derecha */}
                {[
                  { name: "Estrategia", pct: 78, color: "bg-primary" },
                  { name: "Análisis", pct: 62, color: "bg-tertiary" },
                  { name: "Comunicación", pct: 70, color: "bg-secondary" },
                  { name: "Adaptabilidad", pct: 88, color: "bg-on-tertiary-container" },
                ].map((attr) => (
                  <div key={attr.name}>
                    <div className="flex justify-between items-center">
                      <span className="text-[7px] font-label text-on-surface-variant">{attr.name}</span>
                      <span className="text-[7px] font-label text-on-surface-variant">{attr.pct}%</span>
                    </div>
                    <MiniBar percent={attr.pct} color={attr.color} />
                  </div>
                ))}
              </div>

              {/* Anillo de progreso de rango + proyecto completado */}
              <div className="flex items-center gap-3">
                {/* Anillo de progreso */}
                <div className="relative w-10 h-10 shrink-0">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      className="text-surface-container-lowest"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="15"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="94.2"
                      strokeDashoffset="30.1"
                      strokeLinecap="round"
                      className="text-primary"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[7px] font-headline font-bold text-primary">
                    68%
                  </span>
                </div>
                {/* Proyecto completado */}
                <div className="flex-1 rounded bg-surface-container-lowest p-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[11px]">check_circle</span>
                    <div>
                      <p className="text-[8px] font-body font-medium text-on-surface">App Móvil v3</p>
                      <p className="text-[7px] font-body text-on-surface-variant">Completado — +320 XP</p>
                    </div>
                  </div>
                </div>
              </div>
            </BrowserFrame>
            <p className="text-center text-[10px] font-label font-bold uppercase tracking-widest text-on-surface-variant mt-3">
              Vista Perfil — Ficha del empleado
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección 6 — Argumentos Profundos                                  */
/* ------------------------------------------------------------------ */

const attributes = [
  { name: "Lógica", width: "85%", color: "bg-primary" },
  { name: "Creatividad", width: "72%", color: "bg-tertiary" },
  { name: "Liderazgo", width: "60%", color: "bg-secondary" },
  { name: "Negociación", width: "90%", color: "bg-on-tertiary-container" },
  { name: "Estrategia", width: "55%", color: "bg-primary" },
  { name: "Análisis", width: "78%", color: "bg-tertiary" },
  { name: "Comunicación", width: "68%", color: "bg-secondary" },
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
        { icon: "send", label: "Reenvío", color: "text-tertiary" },
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
          label: "Vencido — Escalación",
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
    { name: "JavaScript", level: 8, color: "bg-primary text-on-primary" },
    { name: "TypeScript", level: 7, color: "bg-tertiary text-on-tertiary" },
    { name: "React", level: 9, color: "bg-secondary text-on-secondary" },
    { name: "Python", level: 6, color: "bg-on-tertiary-container text-on-tertiary-fixed" },
    { name: "SQL", level: 5, color: "bg-outline text-surface" },
    { name: "Excel", level: 7, color: "bg-primary text-on-primary" },
    { name: "Figma", level: 8, color: "bg-tertiary text-on-tertiary" },
    { name: "C++", level: 4, color: "bg-secondary text-on-secondary" },
    { name: "SolidWorks", level: 6, color: "bg-on-tertiary-container text-on-tertiary-fixed" },
    { name: "AutoCAD", level: 5, color: "bg-outline text-surface" },
    { name: "PowerPoint", level: 7, color: "bg-primary text-on-primary" },
    { name: "Sage", level: 4, color: "bg-tertiary text-on-tertiary" },
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
    title: "8 atributos, no una casilla de verificación",
    body: "Cuando un manager aprueba una misión, no marca un 'completado'. Puntúa Lógica, Creatividad, Liderazgo, Negociación, Estrategia, Análisis, Comunicación y Adaptabilidad. Del 1 al 5. Cada puntuación actualiza el perfil del empleado. Después de 10 misiones, tienes un mapa real de quién es esa persona profesionalmente.",
    Visual: AttributeBarsVisual,
  },
  {
    title: "El rechazo no castiga, enseña",
    body: "Si un manager rechaza una misión, el empleado no pierde su progreso. Mantiene el 80%. Recibe una nota explicando qué mejorar. Puede reenviar. No es un sistema de castigo — es un sistema de mejora continua.",
    Visual: RejectionFlowVisual,
  },
  {
    title: "Deadlines que se respetan solos",
    body: "48 horas antes: recordatorio. 24 horas: alerta. Vencido: escalación. Tres niveles de urgencia que eliminan la necesidad de que el manager mande emails de seguimiento. El sistema lo hace por ti.",
    Visual: DeadlineBadgesVisual,
  },
  {
    title: "Multi-empresa sin fricción",
    body: "¿Gestionas una agencia con 12 clientes? ¿Un holding con 5 marcas? Una cuenta. Todas las empresas. Cada empleado ve su contexto. El CEO ve el panorama completo. Sin duplicar licencias.",
    Visual: MultiOrgVisual,
  },
  {
    title: "Compliance que se documenta solo",
    body: "¿Quién aprobó la misión de María? ¿Qué puntuación tenía Carlos cuando se evaluó su rendimiento? ¿Cuántas misiones completó Ana en los últimos 3 meses? Todo registrado. Todo trazable. Todo defendible.",
    Visual: AuditTrailVisual,
  },
  {
    title: "Skills que se demuestran, no se declaran",
    body: "Cada misión puede estar etiquetada con habilidades técnicas: JavaScript, React, SQL, Figma. Al completar misiones, el empleado acumula puntos de skill. Nivel 1 a 10. No es un curso — es evidencia de trabajo real.",
    Visual: SkillPillsVisual,
  },
];

function DeepArgumentsSection() {
  return (
    <Section id="argumentos">
      <div className="text-center mb-16 max-w-3xl mx-auto">
        <p className="text-[10px] font-label font-bold uppercase tracking-widest text-primary mb-4">
          Por qué funciona
        </p>
        <h2 className="text-2xl md:text-3xl font-headline font-bold text-on-surface mb-4">
          No es un juego. Es tu sistema de gestión de talento.
        </h2>
        <p className="text-base font-body text-on-surface-variant leading-relaxed">
          Cada decisión en tu empresa deja un rastro. Cada empleado tiene un
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
  "¿Cuántos de tus empleados recibieron feedback esta semana?",
  "¿Sabes quién de tu equipo tiene skills en una tecnología específica?",
  "¿Tus managers evalúan con datos o con intuición?",
  "Si un empleado se va mañana, ¿tienes registro de su contribución?",
  "¿Cuánto tiempo pasa entre que alguien termina un proyecto y recibe feedback?",
  "Cuando llega un nuevo proyecto, ¿cómo decides a quién asignarlo?",
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
            Preguntas que tu empresa debería poder responder
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
            Tus empleados merecen saber cómo lo están haciendo.
          </p>
          <p className="text-lg md:text-xl font-body text-on-surface leading-relaxed">
            Tus managers merecen herramientas para evaluar con justicia.
          </p>
          <p className="text-lg md:text-xl font-body text-on-surface-variant leading-relaxed">
            Tu empresa merece{" "}
            <span className="text-primary font-semibold">
              datos que defiendan cada decisión.
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
          Implementación en menos de 5 minutos
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
    { label: "Contacto", href: "mailto:info@workleveling.com" },
  ],
  Legal: [
    { label: "Privacidad", href: "#" },
    { label: "Términos", href: "#" },
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
              La plataforma de gestión de talento que convierte cada proyecto en
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
      <CtaSection />
      <Footer />
    </>
  );
}
