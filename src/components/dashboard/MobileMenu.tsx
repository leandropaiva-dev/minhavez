'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu,
  Layout,
  Clock,
  Clock as History,
  BarChart2,
  Calendar,
  Settings,
  Link2,
  Edit3,
  LogOut,
} from 'react-feather'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  userName?: string
  userEmail?: string
  profilePictureUrl?: string | null
}

const menuItems = [
  {
    icon: Layout,
    label: 'Visão Geral',
    href: '/dashboard',
  },
  {
    icon: Clock,
    label: 'Fila',
    href: '/dashboard/fila',
  },
  {
    icon: Calendar,
    label: 'Reservas',
    href: '/dashboard/reservas',
  },
  {
    icon: History,
    label: 'Histórico',
    href: '/dashboard/historico',
  },
  {
    icon: BarChart2,
    label: 'Relatórios',
    href: '/dashboard/relatorios',
  },
  {
    icon: Link2,
    label: 'Página de Links',
    href: '/dashboard/links',
  },
  {
    icon: Edit3,
    label: 'Formulários Públicos',
    href: '/dashboard/formularios',
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/dashboard/configuracoes',
  },
]

export default function MobileMenu({ userName, userEmail }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Disable body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button
          className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-80 p-0 flex flex-col top-16 h-[calc(100vh-4rem)]">
        {/* User Section */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-lg">{getInitials(userName)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                  {userName || 'Usuário'}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{userEmail}</p>
              </div>
            </div>
            <AnimatedThemeToggler
              className="p-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex-shrink-0"
              aria-label="Alternar tema"
            />
          </div>
        </div>

        {/* Menu Items - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
