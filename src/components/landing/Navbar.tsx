'use client'

import { GlareButton } from '@/components/ui/glare-button'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 border-b border-zinc-800 shadow-lg shadow-black/50'
          : 'bg-black/80 border-b border-zinc-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-bold text-lg md:text-xl bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent"
          >
            MinhaVez
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex gap-3 md:gap-8 items-center"
          >
            <motion.a
              href="#recursos"
              className="text-zinc-400 hover:text-white transition-colors relative group text-sm md:text-base"
              whileHover={{ y: -2 }}
            >
              <span className="hidden sm:inline">Recursos</span>
              <span className="sm:hidden">Info</span>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.a
              href="#precos"
              className="text-zinc-400 hover:text-white transition-colors relative group text-sm md:text-base"
              whileHover={{ y: -2 }}
            >
              Preços
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300" />
            </motion.a>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlareButton className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 px-3 py-1.5 md:px-4 md:py-2 text-sm md:text-base">
                <span className="hidden sm:inline">Começar Grátis</span>
                <span className="sm:hidden">Começar</span>
              </GlareButton>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  )
}
