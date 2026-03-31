"use client";

import { useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Screen = 0 | 1 | 2 | 3;

interface CursorPos {
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SCREEN_DURATIONS: Record<Screen, number> = {
  0: 5000,
  1: 6000,
  2: 4000,
  3: 5000,
};

const URLS: Record<Screen, string> = {
  0: "workleveling.app/admin/aprobaciones",
  1: "workleveling.app/admin/aprobaciones/12",
  2: "workleveling.app/admin/aprobaciones/12",
  3: "workleveling.app/admin/proyectos/nuevo",
};

const CURSOR_TARGETS: Record<Screen, CursorPos> = {
  0: { x: 180, y: 140 },
  1: { x: 280, y: 340 },
  2: { x: 200, y: 200 },
  3: { x: 280, y: 340 },
};

/* ------------------------------------------------------------------ */
/*  Inline Material Icon helper                                        */
/* ------------------------------------------------------------------ */

function MIcon({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

function MIconFilled({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  return (
    <span
      className={`material-symbols-outlined leading-none ${className}`}
      style={{ fontVariationSettings: "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}
    >
      {name}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Cursor SVG                                                         */
/* ------------------------------------------------------------------ */

function AnimatedCursor({ x, y, clicking }: CursorPos & { clicking: boolean }) {
  return (
    <div
      className="absolute z-50 pointer-events-none transition-all duration-700 ease-out"
      style={{ left: x, top: y }}
    >
      <svg
        width="16"
        height="20"
        viewBox="0 0 16 20"
        fill="none"
        className={`drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] transition-transform duration-150 ${
          clicking ? "scale-75" : "scale-100"
        }`}
      >
        <path
          d="M0 0L14 10.5L7.5 11.5L11 19.5L8 20L4.5 12.5L0 16V0Z"
          fill="white"
          stroke="#131313"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Browser Chrome Frame                                               */
/* ------------------------------------------------------------------ */

function BrowserFrame({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full rounded-xl overflow-hidden shadow-[0px_20px_40px_rgba(0,0,0,0.4)] border border-outline-variant/15">
      {/* Title bar */}
      <div className="bg-surface-container-highest flex items-center gap-2 px-3 py-1.5">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#ff5f57]" />
          <div className="w-2 h-2 rounded-full bg-[#febc2e]" />
          <div className="w-2 h-2 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex-1 mx-2">
          <div className="bg-surface-container-lowest rounded-md px-2 py-0.5 text-[8px] text-outline font-body text-center truncate">
            {url}
          </div>
        </div>
      </div>
      {/* Content area */}
      <div className="bg-surface relative overflow-hidden" style={{ height: 380 }}>
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Dots                                                         */
/* ------------------------------------------------------------------ */

function ScoreDots({ filled, total = 5 }: { filled: number; total?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full text-[6px] flex items-center justify-center font-bold ${
            i < filled
              ? "bg-secondary text-on-secondary"
              : "bg-surface-container-lowest text-outline/40"
          }`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen 0: Panel de Aprobaciones                                    */
/* ------------------------------------------------------------------ */

const approvals = [
  {
    name: "Maria Lopez",
    mission: "Analisis Competitivo",
    module: "Ventas & Leads",
    moduleColor: "bg-secondary/20 text-secondary",
    xp: 500,
    icon: "leaderboard",
  },
  {
    name: "Carlos Ruiz",
    mission: "Plan de Expansion",
    module: "Estrategia",
    moduleColor: "bg-outline/20 text-outline",
    xp: 800,
    icon: "rocket_launch",
  },
  {
    name: "Ana Garcia",
    mission: "Informe Trimestral",
    module: "Informes",
    moduleColor: "bg-on-tertiary-container/20 text-on-tertiary-container",
    xp: 300,
    icon: "summarize",
  },
];

function ScreenApprovals({ highlighted }: { highlighted: boolean }) {
  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[11px] font-bold font-headline text-on-surface">
          Aprobaciones Pendientes
        </h2>
        <span className="text-[8px] font-bold text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
          3 pendientes
        </span>
      </div>

      {approvals.map((a, i) => (
        <div
          key={i}
          className={`rounded-xl bg-surface-container-highest p-0.5 transition-all duration-300 ${
            highlighted && i === 0 ? "scale-[1.03] ring-1 ring-primary/40" : ""
          }`}
        >
          <div className="bg-surface-bright rounded-lg p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MIcon name={a.icon} className="text-[14px] text-outline" />
                <span className="text-[9px] font-semibold text-on-surface font-body">
                  {a.mission}
                </span>
              </div>
              <span className="text-[7px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-surface-container-lowest flex items-center justify-center text-[7px] font-bold text-on-surface">
                  {a.name.charAt(0)}
                </div>
                <span className="text-[8px] text-on-surface-variant font-body">
                  {a.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full ${a.moduleColor}`}
                >
                  {a.module}
                </span>
                <span className="text-[8px] font-bold text-primary font-headline">
                  +{a.xp} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen 1: Detalle de Aprobacion                                    */
/* ------------------------------------------------------------------ */

const attributes = [
  { name: "Logica", score: 4 },
  { name: "Creatividad", score: 3 },
  { name: "Liderazgo", score: 5 },
  { name: "Negociacion", score: 3 },
  { name: "Estrategia", score: 4 },
  { name: "Analisis", score: 5 },
  { name: "Comunicacion", score: 3 },
  { name: "Adaptabilidad", score: 4 },
];

function ScreenDetail({ highlighted }: { highlighted: boolean }) {
  return (
    <div className="p-3 space-y-2 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 rounded-md bg-secondary/20 flex items-center justify-center">
          <MIcon name="leaderboard" className="text-[12px] text-secondary" />
        </div>
        <div>
          <h2 className="text-[10px] font-bold font-headline text-on-surface">
            Analisis Competitivo
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-[7px] font-bold px-1 py-0.5 rounded-full bg-secondary/20 text-secondary">
              Ventas & Leads
            </span>
            <span className="text-[8px] font-bold text-primary font-headline">
              +500 XP
            </span>
          </div>
        </div>
      </div>

      {/* Employee info */}
      <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-lg px-2 py-1.5">
        <div className="w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-[7px] font-bold text-on-surface">
          M
        </div>
        <div>
          <span className="text-[8px] font-semibold text-on-surface font-body block leading-tight">
            Maria Lopez
          </span>
          <span className="text-[6px] text-outline font-body">Nivel 8</span>
        </div>
      </div>

      {/* Attribute selectors — 2 columns */}
      <div>
        <span className="text-[7px] font-bold uppercase tracking-widest text-outline mb-1 block">
          Puntuacion de atributos
        </span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1">
          {attributes.map((attr) => (
            <div key={attr.name} className="flex items-center justify-between">
              <span className="text-[7px] text-on-surface-variant font-body">
                {attr.name}
              </span>
              <ScoreDots filled={attr.score} />
            </div>
          ))}
        </div>
      </div>

      {/* Note field */}
      <div>
        <span className="text-[7px] font-bold uppercase tracking-widest text-outline mb-0.5 block">
          Nota
        </span>
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-2 py-1 text-[7px] text-on-surface-variant font-body">
          Excelente trabajo en el analisis...
        </div>
      </div>

      {/* Approve button */}
      <button
        className={`w-full py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-[8px] font-bold uppercase tracking-widest text-on-primary transition-all duration-200 ${
          highlighted ? "scale-[0.97] brightness-110 ring-1 ring-primary/60" : ""
        }`}
      >
        Aprobar
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen 2: Aprobacion Exitosa                                       */
/* ------------------------------------------------------------------ */

function ScreenSuccess({ visible }: { visible: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-3 px-6">
      {/* Big green check */}
      <div
        className={`transition-all duration-500 ${
          visible ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
          <MIconFilled name="check_circle" className="text-[40px] text-secondary" />
        </div>
      </div>

      <div
        className={`text-center space-y-1 transition-all duration-500 delay-200 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <h3 className="text-[11px] font-bold font-headline text-on-surface">
          Mision aprobada
        </h3>
        <p className="text-[8px] text-on-surface-variant font-body">
          +500 XP otorgados a Maria Lopez
        </p>
      </div>

      {/* Animated scores fading out */}
      <div
        className={`flex flex-wrap justify-center gap-1 transition-all duration-700 delay-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {attributes.slice(0, 4).map((attr) => (
          <span
            key={attr.name}
            className="text-[7px] font-bold px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary"
          >
            {attr.name} {attr.score}/5
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Screen 3: Crear Proyecto                                           */
/* ------------------------------------------------------------------ */

const projectIcons = ["campaign", "trending_up", "group", "analytics", "public", "star"];

function ScreenCreateProject({ highlighted }: { highlighted: boolean }) {
  return (
    <div className="p-3 space-y-1.5 overflow-hidden">
      <h2 className="text-[10px] font-bold font-headline text-on-surface mb-1">
        Crear Proyecto
      </h2>

      {/* Title field */}
      <div>
        <span className="text-[7px] font-bold uppercase tracking-widest text-outline block mb-0.5">
          Titulo
        </span>
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-2 py-1 text-[8px] text-on-surface font-body">
          Campana Q1 2026
        </div>
      </div>

      {/* Module + XP row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <span className="text-[7px] font-bold uppercase tracking-widest text-outline block mb-0.5">
            Modulo
          </span>
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-2 py-1 flex items-center gap-1">
            <span className="text-[7px] font-bold px-1 py-0.5 rounded-full bg-secondary/20 text-secondary">
              Ventas & Leads
            </span>
          </div>
        </div>
        <div className="w-16">
          <span className="text-[7px] font-bold uppercase tracking-widest text-outline block mb-0.5">
            XP
          </span>
          <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-2 py-1 text-[8px] text-primary font-bold font-headline">
            1000
          </div>
        </div>
      </div>

      {/* Icon grid */}
      <div>
        <span className="text-[7px] font-bold uppercase tracking-widest text-outline block mb-0.5">
          Icono
        </span>
        <div className="grid grid-cols-6 gap-1">
          {projectIcons.map((icon) => (
            <div
              key={icon}
              className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${
                icon === "campaign"
                  ? "bg-primary/20 border border-primary ring-1 ring-primary/40"
                  : "bg-surface-container-lowest border border-outline-variant/20"
              }`}
            >
              <MIcon
                name={icon}
                className={`text-[14px] ${
                  icon === "campaign" ? "text-primary" : "text-outline"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Missions */}
      <div>
        <span className="text-[7px] font-bold uppercase tracking-widest text-outline block mb-0.5">
          Misiones
        </span>
        <div className="space-y-1">
          {["Investigar mercado", "Disenar estrategia"].map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant/30 px-2 py-1"
            >
              <MIcon name="task_alt" className="text-[10px] text-secondary" />
              <span className="text-[7px] text-on-surface font-body">{m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create button */}
      <button
        className={`w-full py-1.5 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-[8px] font-bold uppercase tracking-widest text-on-primary transition-all duration-200 mt-1 ${
          highlighted ? "scale-[0.97] brightness-110 ring-1 ring-primary/60" : ""
        }`}
      >
        Crear Proyecto
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main DemoManager Component                                         */
/* ------------------------------------------------------------------ */

export default function DemoManager() {
  const [screen, setScreen] = useState<Screen>(0);
  const [clicking, setClicking] = useState(false);
  const [cursorPos, setCursorPos] = useState<CursorPos>({ x: 200, y: 200 });
  const [successVisible, setSuccessVisible] = useState(false);

  /* Advance screens in a loop */
  const advanceScreen = useCallback(() => {
    setScreen((prev) => ((prev + 1) % 4) as Screen);
  }, []);

  useEffect(() => {
    // Move cursor to target after a short delay on each screen
    const cursorTimer = setTimeout(() => {
      setCursorPos(CURSOR_TARGETS[screen]);
    }, 800);

    // Click effect near end of screen duration
    const clickDelay = SCREEN_DURATIONS[screen] - 1200;
    const clickTimer = setTimeout(() => {
      setClicking(true);
      setTimeout(() => setClicking(false), 200);
    }, clickDelay);

    // Show success animation on screen 2
    if (screen === 2) {
      const successTimer = setTimeout(() => setSuccessVisible(true), 300);
      return () => {
        clearTimeout(cursorTimer);
        clearTimeout(clickTimer);
        clearTimeout(successTimer);
      };
    } else {
      setSuccessVisible(false);
    }

    return () => {
      clearTimeout(cursorTimer);
      clearTimeout(clickTimer);
    };
  }, [screen]);

  useEffect(() => {
    const timer = setTimeout(advanceScreen, SCREEN_DURATIONS[screen]);
    return () => clearTimeout(timer);
  }, [screen, advanceScreen]);

  // Reset cursor on screen change
  useEffect(() => {
    setCursorPos({ x: 200, y: 200 });
  }, [screen]);

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <BrowserFrame url={URLS[screen]}>
        {/* Sidebar mini */}
        <div className="absolute left-0 top-0 bottom-0 w-10 bg-surface-container-highest flex flex-col items-center py-2 gap-2 z-10">
          <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center mb-2">
            <MIconFilled name="shield" className="text-[12px] text-primary" />
          </div>
          {[
            { icon: "approval", active: screen <= 2 },
            { icon: "folder", active: screen === 3 },
            { icon: "group", active: false },
            { icon: "bar_chart", active: false },
          ].map((item, i) => (
            <div
              key={i}
              className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
                item.active
                  ? "bg-primary/20"
                  : "hover:bg-surface-container-high"
              }`}
            >
              <MIcon
                name={item.icon}
                className={`text-[14px] ${
                  item.active ? "text-primary" : "text-outline"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div className="ml-10 h-full relative">
          {/* Screen 0 */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              screen === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ScreenApprovals highlighted={screen === 0 && clicking} />
          </div>

          {/* Screen 1 */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              screen === 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ScreenDetail highlighted={screen === 1 && clicking} />
          </div>

          {/* Screen 2 */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              screen === 2 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ScreenSuccess visible={successVisible} />
          </div>

          {/* Screen 3 */}
          <div
            className={`absolute inset-0 transition-opacity duration-500 ${
              screen === 3 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <ScreenCreateProject highlighted={screen === 3 && clicking} />
          </div>
        </div>

        {/* Animated cursor */}
        <AnimatedCursor x={cursorPos.x + 40} y={cursorPos.y} clicking={clicking} />
      </BrowserFrame>
    </div>
  );
}
