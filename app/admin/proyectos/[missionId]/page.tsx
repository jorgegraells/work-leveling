import { redirect } from "next/navigation"
import type { NextPage } from "next"

interface Props {
  params: Promise<{ missionId: string }>
}

const Page: NextPage<Props> = async ({ params }) => {
  const { missionId } = await params
  redirect(`/admin/objetivos/${missionId}`)
}

export default Page
