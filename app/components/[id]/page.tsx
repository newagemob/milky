import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

// This is a server component
export default function ComponentPage({ params }: { params: { id: string } }) {
  return <ClientComponentDetail componentId={params.id} />
}

// Generate static params for all available GLSL components
export function generateStaticParams() {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}
