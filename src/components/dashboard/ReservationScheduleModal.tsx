'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Clock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ScheduleEntry {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface ReservationScheduleModalProps {
  businessId: string
  isOpen: boolean
  onClose: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
]

export default function ReservationScheduleModal({
  businessId,
  isOpen,
  onClose,
}: ReservationScheduleModalProps) {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('reservation_schedule')
      .select('*')
      .eq('business_id', businessId)
      .eq('is_active', true)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true })

    if (data) {
      setSchedules(data)
    }
    setLoading(false)
  }, [businessId])

  useEffect(() => {
    if (isOpen) {
      fetchSchedules()
    }
  }, [isOpen, businessId, fetchSchedules])

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '18:00',
        is_active: true,
      },
    ])
  }

  const removeSchedule = async (index: number) => {
    const schedule = schedules[index]

    // If it has an id, delete from database
    if (schedule.id) {
      const supabase = createClient()
      await supabase
        .from('reservation_schedule')
        .delete()
        .eq('id', schedule.id)
    }

    // Remove from state
    setSchedules(schedules.filter((_, i) => i !== index))
  }

  const updateSchedule = (index: number, field: keyof ScheduleEntry, value: string | number) => {
    const updated = [...schedules]
    updated[index] = { ...updated[index], [field]: value }
    setSchedules(updated)
  }

  const saveSchedules = async () => {
    setSaving(true)
    const supabase = createClient()

    try {
      // Delete existing schedules for this business
      await supabase
        .from('reservation_schedule')
        .delete()
        .eq('business_id', businessId)

      // Insert new schedules
      if (schedules.length > 0) {
        const { error } = await supabase
          .from('reservation_schedule')
          .insert(
            schedules.map((schedule) => ({
              business_id: businessId,
              day_of_week: schedule.day_of_week,
              start_time: schedule.start_time,
              end_time: schedule.end_time,
              is_active: true,
            }))
          )

        if (error) {
          console.error('Error saving schedules:', error)
          alert('Erro ao salvar horários')
          setSaving(false)
          return
        }
      }

      onClose()
    } catch (error) {
      console.error('Error saving schedules:', error)
      alert('Erro ao salvar horários')
    }

    setSaving(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-zinc-900 dark:text-white">
                Horários de Reserva
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                Configure quando aceitar reservas automaticamente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {schedules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500 dark:text-zinc-400 mb-2">
                    Nenhum horário configurado
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500">
                    Adicione horários para aceitar reservas automaticamente
                  </p>
                </div>
              ) : (
                schedules.map((schedule, index) => (
                  <div
                    key={index}
                    className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Day of Week */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Dia da Semana
                        </label>
                        <select
                          value={schedule.day_of_week}
                          onChange={(e) =>
                            updateSchedule(index, 'day_of_week', parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {DAYS_OF_WEEK.map((day) => (
                            <option key={day.value} value={day.value}>
                              {day.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Horário Inicial
                        </label>
                        <input
                          type="time"
                          value={schedule.start_time}
                          onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                          Horário Final
                        </label>
                        <input
                          type="time"
                          value={schedule.end_time}
                          onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeSchedule(index)}
                      className="mt-3 flex items-center gap-2 text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Remover
                    </button>
                  </div>
                ))
              )}

              {/* Add Button */}
              <button
                onClick={addSchedule}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                Adicionar Horário
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 sm:p-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={saveSchedules}
            disabled={saving}
            className={cn(
              "flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium",
              saving && "opacity-50 cursor-not-allowed"
            )}
          >
            {saving ? 'Salvando...' : 'Salvar Horários'}
          </button>
        </div>
      </div>
    </div>
  )
}
