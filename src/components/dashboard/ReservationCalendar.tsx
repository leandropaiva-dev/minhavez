'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'react-feather'
import { cn } from '@/lib/utils'

interface ReservationCalendarProps {
  reservations: Record<string, number> // date -> count
  selectedDate: Date
  onDateSelect: (date: Date) => void
}

export default function ReservationCalendar({
  reservations,
  selectedDate,
  onDateSelect,
}: ReservationCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date | null) => {
    if (!date) return false
    return date.toDateString() === selectedDate.toDateString()
  }

  const isPast = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return date < today
  }

  const getReservationCount = (date: Date | null) => {
    if (!date) return 0
    const dateStr = date.toISOString().split('T')[0]
    return reservations[dateStr] || 0
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={previousMonth}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-zinc-900 dark:text-white" />
          </button>
          <button
            onClick={nextMonth}
            className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-zinc-900 dark:text-white" />
          </button>
        </div>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-medium text-zinc-500 dark:text-zinc-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date, index) => {
          const count = getReservationCount(date)
          const hasReservations = count > 0

          return (
            <button
              key={index}
              onClick={() => date && onDateSelect(date)}
              disabled={!date || isPast(date)}
              className={cn(
                "aspect-square p-1 sm:p-2 rounded-lg transition-all relative",
                "flex flex-col items-center justify-center",
                !date && "invisible",
                date && !isPast(date) && "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                isToday(date) && "ring-2 ring-blue-500",
                isSelected(date) && "bg-blue-600 text-white hover:bg-blue-700",
                isPast(date) && "opacity-40 cursor-not-allowed",
                !isSelected(date) && !isPast(date) && "text-zinc-900 dark:text-white"
              )}
            >
              {date && (
                <>
                  <span className="text-xs sm:text-sm font-medium">
                    {date.getDate()}
                  </span>
                  {hasReservations && (
                    <span
                      className={cn(
                        "text-[10px] font-medium mt-0.5",
                        isSelected(date) ? "text-white" : "text-blue-600 dark:text-blue-400"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
