import PanelPerfilSteveSmith from "@/components/screens/PanelPerfilSteveSmith"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function PerfilPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return redirect("/sign-in")
  }

  // Find user by real Clerk ID
  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: {
      attributes: {
        include: { attribute: true }
      }
    }
  })

  // If this is the very first time logging in via Clerk, 
  // hijack the seeded Steve Smith record for the purpose of the demo
  if (!user) {
    user = await prisma.user.update({
      where: { email: "steve.smith@example.com" },
      data: { clerkUserId: userId },
      include: {
        attributes: {
          include: { attribute: true }
        }
      }
    }).catch(() => null)
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface text-on-surface">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-error">Database not seeded</h1>
          <p>Please run the Prisma seed script to generate the Steve Smith mock data.</p>
        </div>
      </div>
    )
  }

  // Safe serialization for Client Component
  const serializedUser = JSON.parse(JSON.stringify(user))

  return <PanelPerfilSteveSmith user={serializedUser} />
}
