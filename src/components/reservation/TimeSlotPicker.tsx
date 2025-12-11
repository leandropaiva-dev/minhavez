'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Label } from '@/components/ui/label'

interface TimeSlotPickerProps {
  businessId: string
  selectedDate: string
  selectedTime: string
  onTimeChange: (time: string) => void
  error?: string
  disabled?: boolean
}

interface TimeSlot {
  time: string
  available: boolean
}

export default function TimeSlotPicker({
  businessId,
  selectedDate,
  selectedTime,
  onTimeChange,
  error,
  disabled = false,
}: TimeSlotPickerProps) {
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!selectedDate) {
      setSlots([])
      return
    }

    loadAvailableSlots()
  }, [selectedDate, businessId])

  const loadAvailableSlots = async () => {
    setLoading(true)
    try {
      const supabase = createClient()

      // Get the day of week (0 = Sunday, 1 = Monday, etc.)
      const date = new Date(selectedDate + 'T00:00:00')
      const dayOfWeek = date.getDay()

      // Fetch schedule for this day
      const { data: schedules, error: scheduleError } = await supabase
        .from('reservation_schedule')
        .select('*')
        .eq('business_id', businessId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_active', true)

      if (scheduleError) {
        console.error('Error fetching schedule:', scheduleError)
        setSlots([])
        return
      }

      if (!schedules || schedules.length === 0) {
        // No schedule configured = no slots available
        setSlots([])
        return
      }

      // Generate 30-minute slots for each schedule period
      const allSlots: TimeSlot[] = []

      schedules.forEach((schedule) => {
        const [startHour, startMinute] = schedule.start_time.split(':').map(Number)
        const [endHour, endMinute] = schedule.end_time.split(':').map(Number)

        const startMinutes = startHour * 60 + startMinute
        const endMinutes = endHour * 60 + endMinute

        // Generate 30-minute intervals
        for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
          const hour = Math.floor(minutes / 60)
          const minute = minutes % 60
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`

          // Avoid duplicates
          if (!allSlots.find(s => s.time === timeStr)) {
            allSlots.push({
              time: timeStr,
              available: true,
            })
          }
        }
      })

      // Sort slots by time
      allSlots.sort((a, b) => a.time.localeCompare(b.time))

      setSlots(allSlots)
    } catch (err) {
      console.error('Error loading time slots:', err)
      setSlots([])
    } finally {
      setLoading(false)
    }
  }

  if (!selectedDate) {
    return (
      <div>
        <Label className="text-zinc-300">
          Horário <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
          <p className="text-sm text-zinc-400 text-center">
            Selecione uma data primeiro
          </p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div>
        <Label className="text-zinc-300">
          Horário <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <p className="text-sm text-zinc-400">Carregando horários...</p>
          </div>
        </div>
      </div>
    )
  }

  if (slots.length === 0) {
    return (
      <div>
        <Label className="text-zinc-300">
          Horário <span className="text-red-500">*</span>
        </Label>
        <div className="mt-2 p-4 border border-zinc-700 rounded-lg bg-zinc-900/50">
          <p className="text-sm text-zinc-400 text-center">
            Não há horários disponíveis para esta data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Label className="text-zinc-300">
        Horário <span className="text-red-500">*</span>
      </Label>
      <div className={`mt-2 grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto p-3 border rounded-lg ${
        error ? 'border-red-500' : 'border-zinc-700'
      } bg-zinc-900/50`}>
        {slots.map((slot) => (
          <button
            key={slot.time}
            type="button"
            onClick={() => !disabled && slot.available && onTimeChange(slot.time)}
            disabled={disabled || !slot.available}
            className={`
              py-2.5 px-2 rounded-lg text-sm font-medium transition-all
              ${selectedTime === slot.time
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : slot.available
                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700'
                : 'bg-zinc-900 text-zinc-600 cursor-not-allowed border border-zinc-800'
              }
            `}
          >
            {slot.time}
          </button>
        ))}
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
      {slots.length > 0 && (
        <p className="text-xs text-zinc-500 mt-2">
          {slots.length} {slots.length === 1 ? 'horário disponível' : 'horários disponíveis'}
        </p>
      )}
    </div>
  )
}
