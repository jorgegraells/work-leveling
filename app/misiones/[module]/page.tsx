import DetallesMision from "@/components/screens/DetallesMision"

interface Props {
  params: Promise<{ module: string }>
}

export default async function DetallesMisionPage({ params }: Props) {
  const { module: moduleSlug } = await params
  return <DetallesMision moduleSlug={moduleSlug} />
}
