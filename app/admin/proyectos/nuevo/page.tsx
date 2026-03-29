import ProyectoForm from "@/components/screens/admin/ProyectoForm"
import SidebarLayout from "@/components/layout/SidebarLayout"
import { requireCurrentUser } from "@/lib/auth-helpers"

export default async function NuevoProyectoPage() {
  const user = await requireCurrentUser()

  return (
    <SidebarLayout
      user={{ name: user.name, level: user.level, title: user.title ?? "Executive", avatarUrl: user.avatarUrl }}
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Proyectos", href: "/admin/proyectos" },
        { label: "Nueva Misión" },
      ]}
    >
      <div className="flex-1 flex flex-col w-full relative">
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
        <div className="flex-1 px-4 sm:px-8 py-8 max-w-4xl mx-auto w-full overflow-y-auto">
          <h1 className="text-2xl font-headline font-bold text-on-surface mb-2">Nueva Misión</h1>
          <p className="text-outline text-[10px] uppercase tracking-widest mb-8">Crear un nuevo proyecto con objetivos</p>
          <ProyectoForm orgId={user.organizationId} />
        </div>
        <div className="h-6 w-full bg-surface-variant wood-bezel-shadow relative z-50 flex-shrink-0" />
      </div>
    </SidebarLayout>
  )
}
