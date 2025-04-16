"use client"

import { useState } from "react"
import Link from "next/link"
import { Code, Eye, Copy, Check } from "lucide-react"
import { motion, Variants } from "framer-motion"
import HoverPreview from "@/components/HoverPreview"
import { ComponentData } from "@/lib/components-data"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { CodeBlock, CodeBlockCode } from "@/components/ui/code-block"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ComponentCardProps {
  component: ComponentData
  onPreviewClick: (id: string) => void
  variants?: Variants
}

export default function ComponentCard({ component, onPreviewClick, variants }: ComponentCardProps) {
  const [hoverPreviewId, setHoverPreviewId] = useState<string | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  const [copied, setCopied] = useState(false)

  // Handle mouse enter with delay to prevent accidental triggers
  const handleMouseEnter = () => {
    if (hoverTimeout) clearTimeout(hoverTimeout)

    const timeout = setTimeout(() => {
      setHoverPreviewId(component.id)
    }, 300) // 300ms delay before showing preview

    setHoverTimeout(timeout)
  }

  // Handle mouse leave
  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setHoverPreviewId(null)
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(component.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      variants={variants}
      className="component-card rounded-lg overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="h-48 relative bg-[#121212] overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 gradient-bg flex items-center justify-center">
          {hoverPreviewId === component.id ? (
            <HoverPreview componentId={component.id} />
          ) : (
            <span className="text-2xl font-bold terminal-font text-amber-100">{component.name}</span>
          )}
        </div>

        <button
          onClick={() => onPreviewClick(component.id)}
          className="absolute inset-0 hover-button w-full h-full flex items-center justify-center transition-all cursor-pointer"
        >
          <span className="opacity-0 hover:opacity-100 transition-opacity flex items-center gap-2 bg-amber-500 text-black px-4 py-2 rounded terminal-font">
            <Eye size={16} /> Preview
          </span>
        </button>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold mb-2 terminal-font">{component.name}</h3>
        <p className="text-amber-200/80 mb-4">{component.description}</p>

        <div className="flex flex-wrap gap-2 mb-4">
          {component.tags.map((tag) => (
            <span key={tag} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded terminal-font">
              {tag}
            </span>
          ))}
        </div>

        <div className="flex justify-between">
          <Link
            href={`/components/${component.id}`}
            className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 terminal-font"
          >
            <Code size={14} /> View Details
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1 text-sm text-amber-400 hover:text-amber-300 terminal-font cursor-pointer">
                <Copy size={14} /> Copy Code
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl bg-[#1e1e1e] border-amber-900/30 text-amber-200">
              <DialogHeader>
                <DialogTitle className="text-amber-400 terminal-font">{component.name} Code</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <CodeBlock>
                  <div className="px-4 py-2 flex justify-end border-b border-amber-900/30">
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded bg-[#2a2a2a] text-amber-400 hover:bg-[#333333] transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <ScrollArea className="h-[60vh] max-h-[500px]">
                    <CodeBlockCode
                      code={component.code}
                      language="tsx"
                      theme="github-dark"
                    />
                  </ScrollArea>
                </CodeBlock>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </motion.div>
  )
} 