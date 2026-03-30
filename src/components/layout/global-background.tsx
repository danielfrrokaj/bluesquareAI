"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function GlobalBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
      {/* Subtle Blue/Purple Gradient Mesh Backdrop */}
      <div 
        className="absolute inset-0 bg-white" 
        aria-hidden="true"
      />
      
      {/* Animated Glowing Orbs/Blobs for a premium AI feel */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -50, 50, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px]"
      />
      
      <motion.div
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 100, -50, 0],
          scale: [1, 0.8, 1.2, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-100/20 blur-[150px]"
      />

      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05)_0%,transparent_50%)]"
      />

      {/* Subtle dynamic grid pattern if desired, but let's keep it clean as requested for a premium feel */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay" />
    </div>
  )
}
