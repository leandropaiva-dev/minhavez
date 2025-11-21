'use client'

import { useState } from 'react'
import { XCircle, Phone, UserPlus, Eye, Calendar, History, Settings, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toggleQueueStatus } from '@/lib/queue/actions'

interface QuickActionsProps {
  businessId: string
}

export default function QuickActions({ businessId }: QuickActionsProps) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCloseQueue = async () => {
    setIsProcessing(true)
    const result = await toggleQueueStatus(businessId)
    setIsProcessing(false)

    if (result.success) {
      alert(result.message)
      router.refresh()
    } else {
      alert('Erro ao alterar status da fila')
    }
  }

  const handleCloseReservations = () => {
    // TODO: Implement reservations toggle
    alert('No momento não estamos aceitando reservas')
  }

  const handleCallNext = async () => {
    setIsProcessing(true)
    // TODO: Implement call next in queue
    setTimeout(() => setIsProcessing(false), 1000)
  }

  const handleAddToQueue = () => {
    router.push('/dashboard/fila/adicionar')
  }

  const handleViewQueue = () => {
    router.push('/dashboard/fila')
  }

  const handleViewReservations = () => {
    router.push('/dashboard/reservas')
  }

  const handleViewHistory = () => {
    router.push('/dashboard/fila?filter=completed')
  }

  const handleViewSettings = () => {
    router.push('/dashboard/configuracoes')
  }

  const handleViewReports = () => {
    router.push('/dashboard/relatorios')
  }

  const actions = [
    {
      id: 'close-queue',
      label: 'Encerrar Fila',
      icon: XCircle,
      onClick: handleCloseQueue,
      variant: 'danger' as const,
    },
    {
      id: 'close-reservations',
      label: 'Encerrar Reservas',
      icon: Calendar,
      onClick: handleCloseReservations,
      variant: 'danger' as const,
    },
    {
      id: 'call-next',
      label: 'Chamar Próximo',
      icon: Phone,
      onClick: handleCallNext,
      variant: 'primary' as const,
      disabled: isProcessing,
    },
    {
      id: 'add-queue',
      label: 'Inserir na Fila',
      icon: UserPlus,
      onClick: handleAddToQueue,
      variant: 'secondary' as const,
    },
    {
      id: 'view-queue',
      label: 'Ver Filas',
      icon: Eye,
      onClick: handleViewQueue,
      variant: 'secondary' as const,
    },
    {
      id: 'view-reservations',
      label: 'Ver Reservas',
      icon: Calendar,
      onClick: handleViewReservations,
      variant: 'secondary' as const,
    },
    {
      id: 'view-history',
      label: 'Histórico',
      icon: History,
      onClick: handleViewHistory,
      variant: 'secondary' as const,
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      onClick: handleViewSettings,
      variant: 'secondary' as const,
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: FileText,
      onClick: handleViewReports,
      variant: 'secondary' as const,
    },
  ]

  const getVariantClasses = () => {
    // Todos os botões iguais
    return 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700'
  }

  return (
    <div className="relative group h-80">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-700/5 h-full flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3 flex-shrink-0">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0">
            <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
          </div>
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">Ações Rápidas</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">Gerencie sua fila e reservas</p>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={action.onClick}
                disabled={action.disabled}
                className={`flex flex-col items-center justify-center gap-1 p-2 rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantClasses()}`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="text-[10px] sm:text-xs font-medium text-center leading-tight">
                  {action.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
