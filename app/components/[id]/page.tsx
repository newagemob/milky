import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { componentsData, type ComponentData } from "@/lib/components-data"

type PageProps = {
  params: {
    id: string
  }
}

// Server component
export default function ComponentPage({ params }: PageProps) {
  return <ClientComponentDetail componentId={params.id} />
}

// Static generation of all dynamic routes
export async function generateStaticParams(): Promise<PageProps["params"][]> {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// Metadata generator
export async function generateMetadata(
  { params }: PageProps
): Promise<Metadata> {
  const componentData = componentsData.find(c => c.id === params.id)

  return {
    title: componentData?.name || 'Component Details',
    description: componentData?.description || 'GLSL component details',
  }
}