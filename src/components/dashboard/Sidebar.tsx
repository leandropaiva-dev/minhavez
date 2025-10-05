'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Clock,
  Settings,
  BarChart3,
  LogOut,
  X,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent } from '@/components/ui/sheet'

interface SidebarProps {
  businessName?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    icon: Clock,
    label: 'Fila Atual',
    href: '/dashboard/fila',
  },
  {
    icon: Users,
    label: 'Clientes',
    href: '/dashboard/clientes',
  },
  {
    icon: BarChart3,
    label: 'Relatórios',
    href: '/dashboard/relatorios',
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/dashboard/configuracoes',
  },
]

function SidebarContent({ businessName, onClose, showCloseButton }: { businessName?: string, onClose: () => void, showCloseButton?: boolean }) {
  const pathname = usePathname()

  return (
    <div className="w-64 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-lg">MinhaVez</h1>
              <p className="text-zinc-500 text-xs truncate">{businessName}</p>
            </div>
          </div>
          {/* Close button - Mobile only */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search - Mobile Only */}
      <div className="lg:hidden p-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm"
          />
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-3 px-3">
          Menu
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-zinc-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  )
}

export default function Sidebar({ businessName = 'MinhaVez', open, onOpenChange }: SidebarProps) {
  return (
    <>
      {/* Desktop Sidebar - Always Visible */}
      <aside className="hidden lg:block fixed top-0 left-0 h-screen bg-zinc-950 border-r border-zinc-800 z-40">
        <SidebarContent businessName={businessName} onClose={() => {}} showCloseButton={false} />
      </aside>

      {/* Mobile Sidebar - Sheet */}
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="left" className="p-0">
          <SidebarContent businessName={businessName} onClose={() => onOpenChange(false)} showCloseButton={true} />
        </SheetContent>
      </Sheet>
    </>
  )
}
