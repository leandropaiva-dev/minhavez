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

interface ReservationDayGridProps {
  reservations: Reservation[]
  onReservationClick: (reservation: Reservation) => void
}

export default function ReservationDayGrid({
  reservations,
  onReservationClick,
}: ReservationDayGridProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // Time slots from 8:00 to 22:00 every 30 minutes
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 8; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      if (hour < 22) slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }, [])

  // Navigate days
  const goToPreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const goToNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    setCurrentDate(today)
  }

  // Get reservations for current day and time slot
  const getReservationsForSlot = (timeSlot: string) => {
    // Use local date string format (YYYY-MM-DD)
    const year = currentDate.getFullYear()
    const month = String(currentDate.getMonth() + 1).padStart(2, '0')
    const day = String(currentDate.getDate()).padStart(2, '0')
    const dateStr = `${year}-${month}-${day}`

    const [slotHour, slotMinute] = timeSlot.split(':').map(Number)

    const filtered = reservations.filter(res => {
      if (res.reservation_date !== dateStr) return false
      const [resHour, resMinute] = res.reservation_time.split(':').map(Number)

      // Convert to minutes since midnight for comparison
      const slotMinutes = slotHour * 60 + slotMinute
      const resMinutes = resHour * 60 + resMinute

      // Reservation fits in 30-minute slot window
      return resMinutes >= slotMinutes && resMinutes < slotMinutes + 30
    })

    // Debug logging
    if (typeof window !== 'undefined' && filtered.length > 0) {
      console.log('Day Grid - Found reservations for', dateStr, timeSlot, filtered)
    }

    return filtered
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
  const isToday = currentDate.toDateString() === today.toDateString()

  return (
    <div>
      {/* Header with navigation */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goToPreviousDay}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </button>

          <div className="flex-1 text-center">
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white">
              {currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </h3>
          </div>

          <button
            onClick={goToNextDay}
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

      {/* Time slots */}
      <div className="overflow-auto max-h-[600px]">
        {timeSlots.map((timeSlot) => {
          const slotReservations = getReservationsForSlot(timeSlot)

          return (
            <div
              key={timeSlot}
              className="flex border-b border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors"
              style={{ minHeight: '80px' }}
            >
              {/* Time label */}
              <div className="w-20 sm:w-24 p-3 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  {timeSlot}
                </span>
              </div>

              {/* Reservations */}
              <div className="flex-1 p-2 space-y-2">
                {slotReservations.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-zinc-400 dark:text-zinc-500">
                    Sem reservas
                  </div>
                ) : (
                  slotReservations.map((reservation) => (
                    <button
                      key={reservation.id}
                      onClick={() => onReservationClick(reservation)}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border transition-all hover:shadow-md",
                        statusColors[reservation.status] || statusColors.pending
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate text-sm">
                            {reservation.customer_name}
                          </div>
                          <div className="text-xs opacity-75 mt-1">
                            {reservation.party_size} {reservation.party_size === 1 ? 'pessoa' : 'pessoas'}
                            {reservation.customer_phone && ` • ${reservation.customer_phone}`}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
