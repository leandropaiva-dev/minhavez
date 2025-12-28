'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[200] backdrop-blur-lg transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 border-b border-gray-200 shadow-sm'
          : 'bg-white/90 border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-xl text-gray-900">Organizy</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Como Funciona
            </Link>
            <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Recursos
            </Link>
            <Link href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Preços
            </Link>
            <Link href="#faq" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex gap-3 items-center">
            <Link
              href="/auth?mode=login"
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors text-gray-700 hover:text-gray-900 border border-blue-600 h-10 px-4"
            >
              Entrar
            </Link>
            <Link
              href="/auth?mode=signup"
              className="inline-flex items-center justify-center rounded-lg text-sm font-bold transition-all bg-blue-600 hover:bg-blue-700 text-white h-10 px-5 shadow-sm hover:shadow-md uppercase tracking-wide"
            >
              COMEÇAR AGORA
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Menu"
            aria-expanded={mobileMenuOpen}
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-600 hover:text-gray-900 py-2 font-medium"
            >
              Como Funciona
            </Link>
            <Link
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-600 hover:text-gray-900 py-2 font-medium"
            >
              Recursos
            </Link>
            <Link
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-600 hover:text-gray-900 py-2 font-medium"
            >
              Preços
            </Link>
            <Link
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-gray-600 hover:text-gray-900 py-2 font-medium"
            >
              FAQ
            </Link>
            <div className="pt-3 space-y-2 border-t border-gray-200">
              <Link
                href="/auth?mode=login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 border border-blue-600 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/auth?mode=signup"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 uppercase tracking-wide shadow-sm transition-colors"
              >
                COMEÇAR AGORA
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
