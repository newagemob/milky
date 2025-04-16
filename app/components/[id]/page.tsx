import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

type PageProps = {
  params: { id: string }
}

// Server Component
export default function ComponentPage({ params }: PageProps) {
  return <ClientComponentDetail componentId={params.id} />
}

// For static generation of dynamic routes
export function generateStaticParams() {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// Proper type for generateMetadata function
export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const componentData = componentsData.find(c => c.id === params.id)
  
  return {
    title: componentData?.name || 'Component Details',
    description: componentData?.description || 'GLSL component details',
  }
}