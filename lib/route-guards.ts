// Centralized protected routes list.
// Each agent adds its routes here — do NOT edit middleware.ts directly.
// Imported by middleware.ts via createRouteMatcher.

export const PROTECTED_ROUTES = [
  // Existing
  "/perfil(.*)",
  "/misiones(.*)",
  "/dashboard(.*)",
  // Agent 1 — Company & Roles Admin
  "/admin(.*)",
  // Agent 4 — Approvals & Notifications
  "/notificaciones(.*)",
  // Agent 5 — Missing Screens
  "/settings(.*)",
  "/empresas(.*)",
  "/estadisticas(.*)",
]
