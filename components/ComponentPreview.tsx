"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import { Canvas } from "@react-three/fiber"
import { motion, AnimatePresence } from "framer-motion"
import { getComponentById } from "@/lib/components-data"

interface ComponentPreviewProps {
  componentId: string
  onClose: () => void
}

export default function ComponentPreview({ componentId, onClose }: ComponentPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const componentData = getComponentById(componentId)

  useEffect(() => {
    setIsOpen(true)

    // Prevent scrolling when modal is open
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(onClose, 300) // Wait for animation to complete
  }

  // Render the appropriate component based on ID
  const renderComponent = () => {
    if (!componentData) return <div>Component not found</div>

    const Component = componentData.component
    return <Component />
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 z-0">
            <Canvas>{renderComponent()}</Canvas>
          </div>

          <motion.div
            className="absolute top-4 right-4 z-10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-black bg-opacity-50 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
            >
              <X size={24} />
            </button>
          </motion.div>

          <motion.div
            className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 p-3 rounded"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold mb-1 amber-text terminal-font">{componentData?.name || "Component"}</h3>
            <p className="text-sm text-amber-300">{componentData?.description || "Component description"}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
