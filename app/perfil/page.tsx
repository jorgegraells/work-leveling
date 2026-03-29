import PanelPerfilSteveSmith from "@/components/screens/PanelPerfilSteveSmith"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PerfilPage() {
  const { userId } = await auth()

  if (!userId) return redirect("/sign-in")

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      attributes: { include: { attribute: true } },
    },
  })

  if (!user) return redirect("/sign-in")

  return <PanelPerfilSteveSmith user={JSON.parse(JSON.stringify(user))} />
}
