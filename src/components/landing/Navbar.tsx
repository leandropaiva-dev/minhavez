'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
    <nav
      className={`sticky top-0 z-50 backdrop-blur-lg transition-all duration-300 ${
        scrolled
          ? 'bg-black/90 border-b border-zinc-800 shadow-lg shadow-black/50'
          : 'bg-black/80 border-b border-zinc-800/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 md:h-16">
          <Link href="/" className="font-bold text-lg md:text-xl bg-gradient-to-r from-white to-blue-400 bg-clip-text text-transparent">
            MinhaVez
          </Link>

          <div className="flex gap-2 md:gap-3 items-center mr-2">
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center rounded-md text-sm md:text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border border-zinc-700 text-white hover:bg-transparent hover:border-zinc-600 h-9 md:h-10 px-3 py-1.5 md:px-4 md:py-2"
            >
              Entrar
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center rounded-md text-sm md:text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 text-white h-9 md:h-10 px-3 py-1.5 md:px-4 md:py-2"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
