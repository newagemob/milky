"use client"

import { getComponentById } from "@/lib/components-data"
import { notFound } from "next/navigation"
import ComponentDetail from "@/components/ComponentDetail"

interface ClientComponentDetailProps {
  componentId: string
}

export default function ClientComponentDetail({ componentId }: ClientComponentDetailProps) {
  const component = getComponentById(componentId)

  if (!component) {
    notFound()
  }

  return <ComponentDetail componentId={componentId} />
} 