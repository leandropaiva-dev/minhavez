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

interface ReservationWeekGridProps {
  reservations: Reservation[]
  onReservationClick: (reservation: Reservation) => void
}

export default function ReservationWeekGrid({
  reservations,
  onReservationClick,
}: ReservationWeekGridProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Start on Monday
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  // Generate week days (7 days starting from currentWeekStart)
  const weekDays = useMemo(() => {
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart)
      date.setDate(currentWeekStart.getDate() + i)
      days.push(date)
    }
    return days
  }, [currentWeekStart])

  // Time slots from 8:00 to 22:00 (14 hours)
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  // Navigate week
  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeekStart(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeekStart(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  // Get reservations for a specific day and time slot
  const getReservationsForSlot = (date: Date, timeSlot: string) => {
    // Use local date string format (YYYY-MM-DD)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const [hour] = timeSlot.split(':').map(Number)

    return reservations.filter(res => {
      if (res.reservation_date !== dateStr) return false
      const [resHour] = res.reservation_time.split(':').map(Number)
      return resHour === hour
    })
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-300',
    confirmed: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-300',
    arrived: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300',
    seated: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300',
    completed: 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400',
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div>
      {/* Header with navigation */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goToPreviousWeek}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="flex-1 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">
              {weekDays[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} - {weekDays[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
            </h3>
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>
        </div>

        <button
          onClick={goToToday}
          className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Hoje
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            {/* Days header */}
            <div className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800" style={{ minWidth: '600px' }}>
              <div className="p-1.5 sm:p-2 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 w-12 sm:w-16 flex-shrink-0">
                <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Hora</span>
              </div>
              {weekDays.map((day, idx) => {
                const isToday = day.toDateString() === today.toDateString()
                return (
                  <div
                    key={idx}
                    className={cn(
                      "p-1.5 sm:p-2 text-center border-r border-zinc-200 dark:border-zinc-800 min-w-[70px] sm:min-w-[90px]",
                      isToday ? "bg-blue-50 dark:bg-blue-950" : "bg-zinc-50 dark:bg-zinc-950"
                    )}
                  >
                    <div className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">
                      {day.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className={cn(
                      "text-xs sm:text-sm font-semibold mt-0.5 sm:mt-1",
                      isToday ? "text-blue-600 dark:text-blue-400" : "text-zinc-900 dark:text-white"
                    )}>
                      {day.getDate()}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Time slots and reservations */}
            {timeSlots.map((timeSlot) => (
              <div
                key={timeSlot}
                className="grid grid-cols-8 border-b border-zinc-200 dark:border-zinc-800"
                style={{ minHeight: '60px', minWidth: '600px' }}
              >
                {/* Time label */}
                <div className="p-1.5 sm:p-2 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex items-start w-12 sm:w-16 flex-shrink-0">
                  <span className="text-[10px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">
                    {timeSlot}
                  </span>
                </div>

                {/* Day columns */}
                {weekDays.map((day, dayIdx) => {
                  const slotReservations = getReservationsForSlot(day, timeSlot)
                  const isToday = day.toDateString() === today.toDateString()

                  return (
                    <div
                      key={dayIdx}
                      className={cn(
                        "p-0.5 sm:p-1 border-r border-zinc-200 dark:border-zinc-800 space-y-0.5 sm:space-y-1 min-w-[70px] sm:min-w-[90px]",
                        isToday && "bg-blue-50/30 dark:bg-blue-950/10"
                      )}
                    >
                      {slotReservations.map((reservation) => (
                        <button
                          key={reservation.id}
                          onClick={() => onReservationClick(reservation)}
                          className={cn(
                            "w-full text-left p-1 sm:p-1.5 rounded border transition-all hover:shadow-md",
                            statusColors[reservation.status] || statusColors.pending
                          )}
                        >
                          <div className="font-semibold truncate text-[10px] sm:text-xs">
                            {reservation.customer_name}
                          </div>
                          <div className="text-[9px] sm:text-[10px] opacity-75 truncate">
                            {reservation.party_size}p
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
