import { requireAdminAccess } from "@/lib/auth-helpers"
import { getTranslations } from "next-intl/server"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("admin")
  const result = await requireAdminAccess()

  // requireSuperAdmin returns a Response (403) or the User object
  if (result instanceof Response) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center font-body">
        <div className="rounded-xl bg-surface-container-highest p-1 shadow-card max-w-md w-full mx-4">
          <div className="rounded-lg bg-surface-bright p-8 text-center space-y-4">
            <span className="material-symbols-outlined text-4xl text-error block">
              lock
            </span>
            <h1 className="font-headline text-xl font-bold text-on-surface">
              {t("accessDenied")}
            </h1>
            <p className="text-[12px] text-outline">
              {t("accessDeniedDesc")}
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-primary to-primary-fixed-dim text-on-primary text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-transform"
            >
              <span className="material-symbols-outlined text-sm">home</span>
              {t("backToDashboard")}
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
