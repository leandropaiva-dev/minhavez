'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  History,
  Clock,
  BarChart3,
  Calendar,
  Settings,
  Link2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  {
    icon: LayoutDashboard,
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
    icon: BarChart3,
    label: 'Relatórios',
    href: '/dashboard/relatorios',
  },
  {
    icon: Link2,
    label: 'Minha Página',
    href: '/dashboard/minha-pagina',
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/dashboard/configuracoes',
  },
]

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        'fixed top-16 left-0 h-[calc(100vh-4rem)] bg-zinc-100 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-40 transition-all duration-200 ease-in-out hidden lg:flex flex-col',
        isExpanded ? 'w-64' : 'w-16'
      )}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden pt-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-white',
                !isExpanded && 'justify-center'
              )}
              title={!isExpanded ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />

              {isExpanded && (
                <span className="font-normal text-sm whitespace-nowrap">
                  {item.label}
                </span>
              )}

              {/* Tooltip when collapsed */}
              {!isExpanded && (
                <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-zinc-800 dark:bg-zinc-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 whitespace-nowrap z-50 pointer-events-none border border-zinc-700 dark:border-zinc-800">
                  {item.label}
                  <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-900" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
