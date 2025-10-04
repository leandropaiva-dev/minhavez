'use client'

import { motion } from 'framer-motion'
import { useState, MouseEvent } from 'react'
import { Button } from './button'

interface GlareButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'outline'
  onClick?: () => void
}

export function GlareButton({ children, className, variant = 'default', onClick }: GlareButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  return (
    <Button
      variant={variant}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      onClick={onClick}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(255,255,255,.15), transparent 40%)`,
          opacity,
        }}
        animate={{ opacity }}
        transition={{ duration: 0.3 }}
      />
      <span className="relative z-10">{children}</span>
    </Button>
  )
}
