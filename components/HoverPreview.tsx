"use client"

import { Suspense } from "react"
import { Canvas } from "@react-three/fiber"
import { getComponentById } from "@/lib/components-data"

interface HoverPreviewProps {
  componentId: string
}

export default function HoverPreview({ componentId }: HoverPreviewProps) {
  const componentData = getComponentById(componentId)

  if (!componentData) {
    return <div className="w-full h-full flex items-center justify-center">Component not found</div>
  }

  const Component = componentData.component

  return (
    <div className="w-full h-full">
      <Canvas
        gl={{
          powerPreference: "low-power",
          antialias: false,
          precision: "lowp",
          depth: false,
        }}
        dpr={[0.5, 1]} // Lower resolution for better performance
        frameloop="demand" // Only render when needed
      >
        <Suspense fallback={null}>
          <Component />
        </Suspense>
      </Canvas>
    </div>
  )
}
