import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Mono } from "next/font/google"
import "./globals.css"
import Navigation from "@/components/Navigation"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const spaceMono = Space_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-space-mono" })

export const metadata: Metadata = {
  title: "milky | WebGL Component Library",
  description: "A collection of fluid WebGL shader components",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${spaceMono.variable} bg-[#121212] text-amber-400 font-sans`}>
        <div className="grid-background">
          <Navigation />
          {children}
        </div>
      </body>
    </html>
  )
}
