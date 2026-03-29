import SidebarLayout from "@/components/layout/SidebarLayout"
import EmpresaForm from "@/components/screens/admin/EmpresaForm"
import { requireSuperAdmin } from "@/lib/auth-helpers"

export default async function NuevaEmpresaPage() {
  const result = await requireSuperAdmin()
  if (result instanceof Response) return null

  const user = result

  return (
    <SidebarLayout user={{ name: user.name, level: user.level, title: user.title ?? "Super Admin", avatarUrl: user.avatarUrl }}>
      <EmpresaForm mode="create" />
    </SidebarLayout>
  )
}
