"use client"

import { useState } from "react"
import Link from "next/link"
import { Canvas } from "@react-three/fiber"
import { Download, Copy, Check, CodeIcon, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { getComponentById } from "@/lib/components-data"

interface ComponentDetailProps {
  componentId: string
}

export default function ComponentDetail({ componentId }: ComponentDetailProps) {
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview")

  const component = getComponentById(componentId)

  if (!component) {
    return (
      <div className="pt-20 pb-16 px-4 max-w-7xl mx-auto">
        <p className="text-amber-400">Component not found</p>
      </div>
    )
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(component.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderComponentPreview = () => {
    const Component = component.component
    return <Component />
  }

  return (
    <div className="pt-20 pb-16 px-4 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <Link
          href="/components"
          className="inline-flex items-center text-amber-400 hover:text-amber-300 mb-6 terminal-font"
        >
          <ArrowLeft size={16} className="mr-2" /> Back to all components
        </Link>
      </motion.div>

      <div className="flex flex-col lg:flex-row gap-8">
        <motion.div
          className="lg:w-2/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-amber-900/30 mb-6">
            <div className="flex border-b border-amber-900/30">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 flex-1 text-center terminal-font cursor-pointer ${
                  activeTab === "preview" ? "bg-amber-900/20 text-amber-400" : "text-amber-300 hover:bg-[#2a2a2a]"
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`px-4 py-2 flex-1 text-center terminal-font cursor-pointer ${
                  activeTab === "code" ? "bg-amber-900/20 text-amber-400" : "text-amber-300 hover:bg-[#2a2a2a]"
                }`}
              >
                Code
              </button>
            </div>

            <div className="h-[500px]">
              {activeTab === "preview" ? (
                <div className="w-full h-full">
                  <Canvas>{renderComponentPreview()}</Canvas>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute top-2 right-2 z-10">
                    <button
                      onClick={handleCopyCode}
                      className="p-2 rounded bg-[#2a2a2a] text-amber-400 hover:bg-[#333333] transition-colors"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <pre className="p-4 overflow-auto h-[500px] text-sm font-mono text-amber-300">
                    <code>{component.code}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="lg:w-1/3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-[#1e1e1e] rounded-lg overflow-hidden border border-amber-900/30 p-6">
            <h1 className="text-3xl font-bold mb-4 amber-text terminal-font">{component.name}</h1>
            <p className="text-amber-200/80 mb-6">{component.description}</p>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-amber-400 terminal-font">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {component.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-amber-900/30 text-amber-300 px-2 py-1 rounded terminal-font">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2 text-amber-400 terminal-font">Usage</h3>
              <div className="terminal-window mb-4">
                <p className="terminal-text text-sm">
                  <span className="text-amber-500">import</span> {"{"} {component.name.replace(/\s+/g, "")}R3F {"}"}{" "}
                  <span className="text-amber-500">from</span>{" "}
                  <span className="text-green-400">'@/components/glsl/{component.id}-r3f'</span>
                </p>
              </div>
              <p className="text-sm text-amber-200/80">Add the component to your React Three Fiber canvas:</p>
              <div className="terminal-window mt-2">
                <p className="terminal-text text-sm">
                  &lt;<span className="text-amber-500">Canvas</span>&gt;
                  <br />
                  &nbsp;&nbsp;&lt;<span className="text-amber-500">{component.name.replace(/\s+/g, "")}R3F</span> /&gt;
                  <br />
                  &lt;/<span className="text-amber-500">Canvas</span>&gt;
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.a
                href={`/api/download/${component.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors terminal-font"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={18} /> Download Component
              </motion.a>
              <motion.button
                onClick={() => setActiveTab("code")}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-transparent border border-amber-500 text-amber-400 rounded hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CodeIcon size={18} /> View Source Code
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
