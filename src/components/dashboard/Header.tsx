'use client'

import { useState, useEffect } from 'react'
import { Search, Bell, Moon, Sun, User, Menu } from 'lucide-react'

interface HeaderProps {
  userName?: string
  userEmail?: string
  onMenuClick: () => void
}

export default function Header({ userName, userEmail, onMenuClick }: HeaderProps) {
  const [isDark, setIsDark] = useState(true)

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark'
    setIsDark(!isDark)
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark'
    setIsDark(savedTheme === 'dark')
    document.documentElement.classList.add(savedTheme)
  }, [])

  return (
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-lg border-b border-zinc-800 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Menu Button (Mobile) + Search Bar (Desktop) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search Bar - Desktop Only */}
          <div className="hidden lg:block flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar ou digite comando..."
                className="w-full pl-10 pr-12 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button className="relative p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* User Menu */}
          <button className="flex items-center gap-2 px-2 sm:px-3 py-2 hover:bg-zinc-900 rounded-lg transition-colors ml-1 sm:ml-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left min-w-0">
              <p className="text-sm font-medium text-white truncate">{userName || 'Usuário'}</p>
              <p className="text-xs text-zinc-500 truncate">{userEmail}</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
