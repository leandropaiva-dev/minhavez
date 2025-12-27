'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'
import { cn } from '@/lib/utils'

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

interface ReservationMonthGridProps {
  reservations: Reservation[]
  onReservationClick: (reservation: Reservation) => void
}

export default function ReservationMonthGrid({
  reservations,
  onReservationClick,
}: ReservationMonthGridProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })

  // Get all days in month
  const monthDays = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    // Start from Monday of the week containing the 1st
    const startDate = new Date(firstDay)
    const dayOfWeek = startDate.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + diff)

    // End on Sunday of the week containing the last day
    const endDate = new Date(lastDay)
    const endDayOfWeek = endDate.getDay()
    const endDiff = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek
    endDate.setDate(endDate.getDate() + endDiff)

    const days = []
    const current = new Date(startDate)
    while (current <= endDate) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentMonth])

  // Group days into weeks
  const weeks = useMemo(() => {
    const result = []
    for (let i = 0; i < monthDays.length; i += 7) {
      result.push(monthDays.slice(i, i + 7))
    }
    return result
  }, [monthDays])

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }

  // Get reservations for a specific day
  const getReservationsForDay = (date: Date) => {
    // Use local date string format (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    return reservations.filter(res => res.reservation_date === dateStr)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500',
    confirmed: 'bg-blue-500',
    arrived: 'bg-purple-500',
    seated: 'bg-green-500',
    completed: 'bg-zinc-400',
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      {/* Header with navigation */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goToPreviousMonth}
            className="p-1.5 sm:p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="flex-1 text-center">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-zinc-900 dark:text-white capitalize leading-tight">
              <span className="sm:hidden">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
              </span>
              <span className="hidden sm:inline">
                {currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </h3>
          </div>

          <button
            onClick={goToNextMonth}
            className="p-1.5 sm:p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="mt-2 sm:mt-3 w-full py-1.5 sm:py-2 px-3 sm:px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-medium rounded-lg transition-all active:scale-98"
        >
          Mês Atual
        </button>
      </div>

      {/* Calendar grid */}
      <div className="p-1 sm:p-2 lg:p-3">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
          {['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map((day, idx) => (
            <div key={idx} className="text-center py-0.5 sm:py-1 lg:py-2">
              <span className="text-[9px] sm:text-[10px] lg:text-xs font-medium text-zinc-500 dark:text-zinc-400 sm:hidden">
                {day}
              </span>
              <span className="hidden sm:inline text-[10px] lg:text-xs font-medium text-zinc-500 dark:text-zinc-400">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx]}
              </span>
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-0.5 sm:mb-1">
            {week.map((date, dayIdx) => {
              const isToday = date.toDateString() === today.toDateString()
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
              const dayReservations = getReservationsForDay(date)

              return (
                <div
                  key={dayIdx}
                  className={cn(
                    "min-h-[50px] sm:min-h-[80px] lg:min-h-[100px] p-0.5 sm:p-1.5 lg:p-2 rounded border transition-all",
                    isCurrentMonth
                      ? "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900 opacity-40",
                    isToday && "ring-1 ring-blue-500"
                  )}
                >
                  <div className={cn(
                    "text-[9px] sm:text-[10px] lg:text-sm font-semibold mb-0.5",
                    isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-white"
                  )}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-0.5">
                    {dayReservations.slice(0, 2).map((reservation) => (
                      <button
                        key={reservation.id}
                        onClick={() => onReservationClick(reservation)}
                        className={cn(
                          "w-full text-left px-0.5 sm:px-1 lg:px-1.5 py-0.5 rounded text-[7px] sm:text-[8px] lg:text-xs truncate transition-all hover:shadow-sm active:scale-95",
                          statusColors[reservation.status]
                            ? `${statusColors[reservation.status]} text-white`
                            : "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-white"
                        )}
                      >
                        <span className="hidden lg:inline">{reservation.reservation_time.slice(0, 5)} </span>
                        {reservation.customer_name}
                      </button>
                    ))}

                    {dayReservations.length > 2 && (
                      <div className="text-[7px] sm:text-[8px] lg:text-[10px] text-zinc-500 dark:text-zinc-400 px-0.5 sm:px-1">
                        +{dayReservations.length - 2}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
