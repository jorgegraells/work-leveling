import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { PROTECTED_ROUTES } from "@/lib/route-guards"

const isProtectedRoute = createRouteMatcher(PROTECTED_ROUTES)

export default clerkMiddleware(async (auth, req) => {
  const hostname = req.headers.get("host") ?? ""

  // workleveling.com → serve landing page
  if (hostname.includes("workleveling.com")) {
    const url = req.nextUrl
    // Root → rewrite to /presentacion (landing page)
    if (url.pathname === "/") {
      return NextResponse.rewrite(new URL("/presentacion", req.url))
    }
    // Allow /sign-in, /sign-up for .com visitors who want to register
    // Block access to app routes from .com
    if (url.pathname.startsWith("/dashboard") ||
        url.pathname.startsWith("/perfil") ||
        url.pathname.startsWith("/admin") ||
        url.pathname.startsWith("/misiones") ||
        url.pathname.startsWith("/settings") ||
        url.pathname.startsWith("/estadisticas") ||
        url.pathname.startsWith("/empresas") ||
        url.pathname.startsWith("/notificaciones")) {
      return NextResponse.redirect(new URL("/", req.url))
    }
  }

  // workleveling.app → normal app behavior
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
