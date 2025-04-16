"use client"
import { Canvas } from "@react-three/fiber"
import { useInView } from "react-intersection-observer"
import { MilkyOrbR3F } from "@/components/glsl/MilkyOrbR3F"
import { motion } from "framer-motion"
import Link from "next/link"

export default function HeroSection() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  })

  return (
    <section ref={ref} className="relative h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        {inView && (
          <Canvas>
            <MilkyOrbR3F />
          </Canvas>
        )}
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6 amber-text terminal-font"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          milky
        </motion.h1>
        <motion.p
          className="text-xl md:text-2xl mb-8 text-amber-300 terminal-font"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <span className="terminal-cursor">Fluid WebGL shader components</span>
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <Link
            href="#gallery"
            className="px-8 py-3 bg-transparent border border-amber-500 text-amber-400 rounded hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
          >
            Explore Gallery
          </Link>
          <Link
            href="/components"
            className="px-8 py-3 bg-amber-500 text-black rounded hover:bg-amber-400 transition-colors terminal-font"
          >
            View All Components
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-10 left-0 right-0 flex justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.6 }}
      >
        <motion.svg
          className="w-6 h-6 text-amber-400"
          fill="none"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
        >
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </motion.svg>
      </motion.div>
    </section>
  )
}
