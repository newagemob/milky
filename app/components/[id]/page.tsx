import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

// Server component for dynamic route /components/[id]
export default function ComponentPage({ params }: { params: { id: string } }) {
  return <ClientComponentDetail componentId={params.id} />
}

// Static params for SSG (Static Site Generation)
export function generateStaticParams() {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// Metadata for each dynamic page
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const componentData = componentsData.find(c => c.id === params.id)

  return {
    title: componentData?.name || "Component Details",
    description: componentData?.description || "GLSL component details",
  }
}
