'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

interface RotatingTextProps {
  texts: string[]
  interval?: number
  className?: string
}

export function RotatingText({ texts, interval = 3000, className }: RotatingTextProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <div className="inline-block relative">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20, rotateX: -90 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -20, rotateX: 90 }}
          transition={{
            duration: 0.5,
            ease: "easeInOut"
          }}
          className={className}
        >
          {texts[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  )
}
