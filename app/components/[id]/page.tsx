import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

// Use the pattern mentioned in the proposed solution
type Params = Promise<{ id: string }>;

// This is a server component
export default async function ComponentPage({ params }: { params: Params }) {
  const { id } = await params;
  return <ClientComponentDetail componentId={id} />
}

// Generate static params for all available GLSL components
export function generateStaticParams() {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// Optionally generate metadata for the page - fix the typing here too
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const componentData = componentsData.find(c => c.id === id)
  
  return {
    title: componentData?.name || 'Component Details',
    description: componentData?.description || 'GLSL component details'
  }
}