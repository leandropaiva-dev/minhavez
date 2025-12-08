'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'react-feather'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import UserDropdown from './UserDropdown'
import MobileMenu from './MobileMenu'

interface HeaderProps {
  userName?: string
  userEmail?: string
  profilePictureUrl?: string | null
}

export default function Header({ userName, userEmail, profilePictureUrl }: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen(true)
        document.getElementById('navbar-search')?.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold text-zinc-900 dark:text-white">
            MinhaVez
          </span>
        </Link>

        {/* Right: Desktop actions or Mobile menu */}
        <div className="flex items-center gap-2">
          {/* Desktop: Search, Theme Toggle, Profile */}
          <div className="hidden lg:flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                id="navbar-search"
                type="text"
                placeholder="Buscar..."
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="w-64 pl-9 pr-16 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                ⌘K
              </kbd>
            </div>

            {/* Search Dropdown (Future - placeholder) */}
            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                <div className="p-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
                  Digite para buscar páginas, clientes, configurações...
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <AnimatedThemeToggler
            className="p-2.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Alternar tema"
          />

          {/* Divider */}
          <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* User Dropdown */}
          <UserDropdown userName={userName} userEmail={userEmail} profilePictureUrl={profilePictureUrl} />
          </div>

          {/* Mobile: Hamburger Menu */}
          <MobileMenu userName={userName} userEmail={userEmail} profilePictureUrl={profilePictureUrl} />
        </div>
      </div>
    </header>
  )
}
