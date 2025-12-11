'use client'

import { useState } from 'react'
import { X, Edit3, Eye, CheckCircle } from 'react-feather'
import { cn } from '@/lib/utils'
import ConfigurationsTabs from './ConfigurationsTabs'
import PageCustomizationEditor from './PageCustomizationEditor'

interface ReservationAppearanceModalProps {
  businessId: string
  isOpen: boolean
  onClose: () => void
}

type ReservationScreen = 'form' | 'appearance' | 'confirmation'

export default function ReservationAppearanceModal({
  businessId,
  isOpen,
  onClose,
}: ReservationAppearanceModalProps) {
  const [activeScreen, setActiveScreen] = useState<ReservationScreen>('form')

  if (!isOpen) return null

  const screens = [
    {
      value: 'form' as ReservationScreen,
      icon: Edit3,
      label: 'Formulário',
      title: 'Formulário de Reserva',
      description: 'Configure os campos do formulário de reservas',
    },
    {
      value: 'appearance' as ReservationScreen,
      icon: Eye,
      label: 'Aparência',
      title: 'Aparência da Página',
      description: 'Personalize cores, logotipo e estilo da página de reservas',
    },
    {
      value: 'confirmation' as ReservationScreen,
      icon: CheckCircle,
      label: 'Confirmação',
      title: 'Tela de Confirmação',
      description: 'Personalize a tela exibida após a reserva ser confirmada',
    },
  ]

  const currentScreen = screens.find(s => s.value === activeScreen)!

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-zinc-900 w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-4xl sm:rounded-xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
              Aparência e Configurações - Reservas
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {currentScreen.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Screen Tabs */}
        <div className="flex gap-1 p-2 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto">
          {screens.map((screen) => {
            const Icon = screen.icon
            return (
              <button
                key={screen.value}
                onClick={() => setActiveScreen(screen.value)}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-xs sm:text-sm font-medium whitespace-nowrap flex-1 sm:flex-none",
                  activeScreen === screen.value
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{screen.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white mb-2">
                {currentScreen.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                {currentScreen.description}
              </p>
            </div>

            {activeScreen === 'form' ? (
              <ConfigurationsTabs formType="reservation" businessId={businessId} />
            ) : activeScreen === 'appearance' ? (
              <PageCustomizationEditor
                businessId={businessId}
                pageType="reservation_form"
                title="Formulário de Reserva"
                description="Página onde clientes fazem reservas"
              />
            ) : (
              <PageCustomizationEditor
                businessId={businessId}
                pageType="reservation_confirm"
                title="Confirmação de Reserva"
                description="Página de confirmação após reservar"
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors font-medium"
          >
            Fechar
          </button>
          <button
            onClick={onClose}
            className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}
