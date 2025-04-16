"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import ComponentPreview from "@/components/ComponentPreview"
import { motion } from "framer-motion"
import { componentsData } from "@/lib/components-data"
import ComponentCard from "@/components/ComponentCard"

// This would typically come from an API or database
export default function ComponentList() {
  const [activePreview, setActivePreview] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  // Get all unique tags
  const allTags = Array.from(new Set(componentsData.flatMap((comp) => comp.tags)))

  // Filter components based on search and tags
  const filteredComponents = componentsData.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.description.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => component.tags.includes(tag))

    return matchesSearch && matchesTags
  })

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const handlePreviewClick = (id: string) => {
    setActivePreview(id)
  }

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

  return (
    <div>
      <motion.div
        className="mb-8 p-4 bg-[#1e1e1e] rounded-lg border border-amber-900/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-amber-500" />
            </div>
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#121212] border border-amber-900/30 rounded text-amber-100 focus:outline-none focus:border-amber-500 terminal-font"
            />
          </div>

          <div className="flex-shrink-0">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-amber-500" />
              <span className="text-amber-300 terminal-font">Filter:</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-3 py-1 rounded-full transition-colors terminal-font ${
                selectedTags.includes(tag)
                  ? "bg-amber-600 text-black"
                  : "bg-[#2a2a2a] text-amber-300 hover:bg-[#333333]"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {filteredComponents.length === 0 ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-xl text-amber-300 terminal-font">No components found matching your criteria</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {filteredComponents.map((component) => (
            <ComponentCard 
              key={component.id}
              component={component}
              onPreviewClick={handlePreviewClick}
              variants={item}
            />
          ))}
        </motion.div>
      )}

      {activePreview && <ComponentPreview componentId={activePreview} onClose={() => setActivePreview(null)} />}
    </div>
  )
}
