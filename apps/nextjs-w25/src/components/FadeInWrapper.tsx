'use client'

import { motion } from 'framer-motion'
import React from 'react'

export function FadeInWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 2.0, ease: "easeOut" }}
        className="fixed inset-0 z-[100] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, #ff0000, #ff8c00, #ffff00, #00ff00, #0066ff, #9400d3)',
          filter: 'blur(100px)',
          transform: 'scale(1.5)'
        }}
      />
    </>
  )
}
