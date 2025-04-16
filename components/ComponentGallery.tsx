"use client"

import { useState } from "react"
import ComponentPreview from "@/components/ComponentPreview"
import { motion } from "framer-motion"
import { componentsData } from "@/lib/components-data"
import ComponentCard from "@/components/ComponentCard"

export default function ComponentGallery() {
  const [activePreview, setActivePreview] = useState<string | null>(null)

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const handlePreviewClick = (id: string) => {
    setActivePreview(id)
  }

  return (
    <section id="gallery" className="py-20 px-4 max-w-7xl mx-auto">
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-4xl font-bold mb-4 amber-text terminal-font">Component Gallery</h2>
        <p className="text-xl text-amber-300 max-w-2xl mx-auto">
          Browse our collection of high-performance WebGL components
        </p>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >
        {componentsData?.map((component) => (
          <ComponentCard 
            key={component.id}
            component={component}
            onPreviewClick={handlePreviewClick}
            variants={item}
          />
        ))}
      </motion.div>

      {activePreview && <ComponentPreview componentId={activePreview} onClose={() => setActivePreview(null)} />}
    </section>
  )
}
