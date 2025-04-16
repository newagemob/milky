import ClientComponentDetail from "@/components/ClientComponentDetail"

// This is a server component
export default function ComponentPage({ params }: { params: { id: string } }) {
  return <ClientComponentDetail componentId={params.id} />
}

// Generate static params for all available GLSL components
export function generateStaticParams() {
  // List of all component IDs - must match the IDs defined in lib/components-data.ts
  const componentIds = [
    'milky-orb', 
    'milky-stars',
    'milky-cosmic',
    'milky-wave',
    'milky-ring',
    'milky-shower'
  ]
  
  // Return as array of objects with id parameter
  return componentIds.map(id => ({
    id
  }))
}
