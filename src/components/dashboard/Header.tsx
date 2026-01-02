'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/logos/LogoEscritoLight.png"
            alt="Organizy"
            width={240}
            height={64}
            className="h-8 sm:h-10 md:h-12 w-auto dark:hidden"
            priority
          />
          <Image
            src="/logos/LogoEscritoDark.png"
            alt="Organizy"
            width={240}
            height={64}
            className="h-8 sm:h-10 md:h-12 w-auto hidden dark:block"
            priority
          />
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
                className="w-64 pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
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
