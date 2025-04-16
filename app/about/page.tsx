"use client"

import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <main className="pt-20 pb-16 px-4 max-w-4xl mx-auto">
      <motion.h1
        className="text-4xl font-bold mb-6 amber-text terminal-font"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        About milky
      </motion.h1>

      <motion.div
        className="bg-[#1e1e1e] rounded-lg border border-amber-900/30 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
      >
        <p className="text-lg text-amber-300 mb-4 terminal-font">
          milky is a collection of high-performance WebGL shaders implemented as React Three Fiber components.
        </p>

        <p className="text-amber-200/80 mb-4">
          This gallery showcases various GLSL shader effects that can be easily integrated into your React and Next.js
          projects. Each component is optimized for performance and designed to be easily customizable.
        </p>

        <p className="text-amber-200/80">
          All components are built using React Three Fiber, making them compatible with modern React applications. The
          shaders are written in GLSL and can be modified to suit your specific needs.
        </p>
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-4 text-amber-400 terminal-font"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        How to Use
      </motion.h2>

      <motion.div
        className="bg-[#1e1e1e] rounded-lg border border-amber-900/30 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <ol className="list-decimal list-inside space-y-4 text-amber-200/80">
          <li>
            <span className="text-amber-300 font-semibold terminal-font">Browse the gallery</span> to find a component
            you like.
          </li>
          <li>
            <span className="text-amber-300 font-semibold terminal-font">Preview the component</span> to see it in
            action.
          </li>
          <li>
            <span className="text-amber-300 font-semibold terminal-font">View the source code</span> to understand how
            it works.
          </li>
          <li>
            <span className="text-amber-300 font-semibold terminal-font">Download the component</span> to use it in your
            project.
          </li>
          <li>
            <span className="text-amber-300 font-semibold terminal-font">Import the component</span> into your React
            Three Fiber canvas.
          </li>
        </ol>
      </motion.div>

      <motion.h2
        className="text-2xl font-bold mb-4 text-amber-400 terminal-font"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4 }}
      >
        Requirements
      </motion.h2>

      <motion.div
        className="bg-[#1e1e1e] rounded-lg border border-amber-900/30 p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
      >
        <p className="text-amber-200/80 mb-4">To use these components in your project, you'll need:</p>

        <ul className="list-disc list-inside space-y-2 text-amber-200/80">
          <li>React (16.8 or higher)</li>
          <li>Three.js</li>
          <li>React Three Fiber</li>
          <li>React Three Drei (for some components)</li>
        </ul>

        <div className="mt-6 p-4 bg-black bg-opacity-50 rounded terminal-window">
          <p className="terminal-text text-sm mb-2">
            <span className="text-green-400">npm install</span> three @react-three/fiber @react-three/drei
          </p>
          <p className="terminal-text text-sm">
            <span className="text-green-400">yarn add</span> three @react-three/fiber @react-three/drei
          </p>
        </div>
      </motion.div>
    </main>
  )
}
