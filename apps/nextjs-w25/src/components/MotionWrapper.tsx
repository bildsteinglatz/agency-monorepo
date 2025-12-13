'use client'
import { motion } from 'framer-motion'
import React from 'react'

interface MotionWrapperProps {
  children: React.ReactNode
  delay?: number
  className?: string
  yOffset?: number
}

export function MotionWrapper({ children, delay = 0, className = '', yOffset = 20 }: MotionWrapperProps) {
  return (
    <motion.div
      initial={{ y: yOffset, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 80,
        damping: 20,
        delay
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
