import SidebarLayout from "@/components/layout/SidebarLayout"
import Settings from "@/components/screens/Settings"
import { requireCurrentUser } from "@/lib/auth-helpers"
import { cookies } from "next/headers"

export default async function SettingsPage() {
  const user = await requireCurrentUser()
  const cookieStore = await cookies()
  const locale = cookieStore.get("locale")?.value ?? "es"

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[{ label: "Configuracion" }]}
    >
      <Settings
        user={{
          id: user.id,
          name: user.name,
          email: user.email,
          title: user.title,
          avatarUrl: user.avatarUrl,
        }}
        currentLocale={locale}
      />
    </SidebarLayout>
  )
}
