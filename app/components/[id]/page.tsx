// app/components/[id]/page.tsx
import type { Metadata } from "next"
import ClientComponentDetail from "@/components/ClientComponentDetail"
import { ComponentData, componentsData } from "@/lib/components-data"

// ✅ Main page component
export default function ComponentPage({
  params,
}: {
  params: { id: string }
}) {
  return <ClientComponentDetail componentId={params.id} />
}

// ✅ Static params function (must return a list of `params`)
export function generateStaticParams(): Array<{ id: string }> {
  return componentsData.map((component: ComponentData) => ({
    id: component.id,
  }))
}

// ✅ Metadata generation
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const componentData = componentsData.find((c) => c.id === params.id)

  return {
    title: componentData?.name || "Component Details",
    description: componentData?.description || "GLSL component details",
  }
}