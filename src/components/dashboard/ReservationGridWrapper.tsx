'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import ReservationDayGrid from './ReservationDayGrid'
import ReservationWeekGrid from './ReservationWeekGrid'
import ReservationMonthGrid from './ReservationMonthGrid'

interface Reservation {
  id: string
  customer_name: string
  customer_phone: string | null
  customer_email: string | null
  party_size: number
  reservation_date: string
  reservation_time: string
  status: string
  notes: string | null
}

interface ReservationGridWrapperProps {
  reservations: Reservation[]
  onReservationClick: (reservation: Reservation) => void
}

type ViewMode = 'day' | 'week' | 'month'

export default function ReservationGridWrapper({
  reservations,
  onReservationClick,
}: ReservationGridWrapperProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden">
      {/* View Mode Selector Header */}
      <div className="p-3 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center justify-center sm:justify-start">
          <div className="inline-flex gap-1 bg-white dark:bg-zinc-900 p-1 rounded-lg shadow-sm border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => setViewMode('day')}
              className={cn(
                "px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                viewMode === 'day'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              Dia
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                "px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                viewMode === 'week'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                "px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all",
                viewMode === 'month'
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
              )}
            >
              Mês
            </button>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div>
        {viewMode === 'day' && (
          <ReservationDayGrid
            reservations={reservations}
            onReservationClick={onReservationClick}
          />
        )}

        {viewMode === 'week' && (
          <ReservationWeekGrid
            reservations={reservations}
            onReservationClick={onReservationClick}
          />
        )}

        {viewMode === 'month' && (
          <ReservationMonthGrid
            reservations={reservations}
            onReservationClick={onReservationClick}
          />
        )}
      </div>
    </div>
  )
}
