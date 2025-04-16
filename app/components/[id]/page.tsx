import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

type Props = {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}

// This is a server component
export default async function ComponentPage({ params }: Props) {
  return <ClientComponentDetail componentId={params.id} />
}

// Generate static params for all available GLSL components
export function generateStaticParams() {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// Fix the metadata generation function to match the correct Props type
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const componentData = componentsData.find(c => c.id === params.id)
  
  return {
    title: componentData?.name || 'Component Details',
    description: componentData?.description || 'GLSL component details'
  }
}