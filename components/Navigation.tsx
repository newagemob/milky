"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Code, Home, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#121212] bg-opacity-80 border-b border-amber-800/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-amber-500 hexagon flex items-center justify-center mr-2">
                <Code className="text-black" size={16} />
              </div>
              <span className="text-xl font-bold terminal-font amber-text">milky</span>
            </Link>
          </motion.div>

          <div className="hidden md:block">
            <motion.div
              className="ml-10 flex items-center space-x-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link
                href="/"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
              >
                <span className="flex items-center">
                  <Home size={16} className="mr-1" /> Home
                </span>
              </Link>
              <Link
                href="/components"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
              >
                <span className="flex items-center">
                  <Code size={16} className="mr-1" /> Components
                </span>
              </Link>
              <Link
                href="/about"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
              >
                <span className="flex items-center">
                  <Info size={16} className="mr-1" /> About
                </span>
              </Link>
            </motion.div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-amber-400 hover:text-amber-300 hover:bg-amber-900/20 focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#121212] bg-opacity-90 border-b border-amber-800/50">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center">
                  <Home size={16} className="mr-2" /> Home
                </span>
              </Link>
              <Link
                href="/components"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center">
                  <Code size={16} className="mr-2" /> Components
                </span>
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-amber-900/20 hover:text-amber-300 transition-colors terminal-font"
                onClick={() => setIsOpen(false)}
              >
                <span className="flex items-center">
                  <Info size={16} className="mr-2" /> About
                </span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
