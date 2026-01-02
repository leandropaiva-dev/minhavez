'use client'

import { Clock, DollarSign } from 'react-feather'

interface ServiceCardProps {
  id: string
  name: string
  description?: string | null
  photoUrl: string
  price?: number | null // em centavos
  duration?: number | null // em minutos
  selected?: boolean
  onClick?: () => void
}

export default function ServiceCard({
  name,
  description,
  photoUrl,
  price,
  duration,
  selected = false,
  onClick,
}: ServiceCardProps) {
  const formatPrice = (cents: number) => {
    const reais = cents / 100
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(reais)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
        selected
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md'
      }`}
    >
      {/* Foto Redonda */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700">
          <img
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-zinc-900 dark:text-white text-sm sm:text-base md:text-lg mb-0.5 sm:mb-1 line-clamp-1">
          {name}
        </h3>

        {description && (
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-1.5 sm:mb-2 line-clamp-2">
            {description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          {price !== null && price !== undefined && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-green-600 dark:text-green-400 font-medium">
              <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formatPrice(price)}</span>
            </div>
          )}

          {duration !== null && duration !== undefined && (
            <div className="flex items-center gap-1 sm:gap-1.5 text-zinc-600 dark:text-zinc-400">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{formatDuration(duration)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Indicator de seleção */}
      {selected && (
        <div className="flex-shrink-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  )
}
