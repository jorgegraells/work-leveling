// Centralized protected routes list.
// Each agent adds its routes here — do NOT edit middleware.ts directly.
// Imported by middleware.ts via createRouteMatcher.

export const PROTECTED_ROUTES = [
  "/perfil(.*)",
  "/misiones(.*)",
  "/objetivos(.*)",
  "/dashboard(.*)",
  "/admin(.*)",
  "/notificaciones(.*)",
  "/settings(.*)",
  "/empresas(.*)",
  "/estadisticas(.*)",
  "/archivados(.*)",
  "/onboarding(.*)",
]
