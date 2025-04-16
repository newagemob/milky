import ClientComponentDetail from "@/components/ClientComponentDetail"

// This is a server component
export default function ComponentPage({ params }: { params: { id: string } }) {
  return <ClientComponentDetail componentId={params.id} />
}

// This can be added back later once you have a server-compatible way to get this data
// For now, we'll just avoid calling generateStaticParams
/*
export async function generateStaticParams() {
  // This would need to be replaced with a server-compatible data source
  return []
}
*/
