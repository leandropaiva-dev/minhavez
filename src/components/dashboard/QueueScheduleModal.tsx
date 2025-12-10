'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus, Trash2, Clock } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ScheduleEntry {
  id?: string
  day_of_week: number
  start_time: string
  end_time: string
  is_active: boolean
}

interface QueueScheduleModalProps {
  businessId: string
  isOpen: boolean
  onClose: () => void
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', fullLabel: 'Domingo' },
  { value: 1, label: 'Seg', fullLabel: 'Segunda' },
  { value: 2, label: 'Ter', fullLabel: 'Terça' },
  { value: 3, label: 'Qua', fullLabel: 'Quarta' },
  { value: 4, label: 'Qui', fullLabel: 'Quinta' },
  { value: 5, label: 'Sex', fullLabel: 'Sexta' },
  { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
]

const QUICK_ACTIONS = [
  {
    label: 'Seg a Sex (9h-18h)',
    schedules: [
      { day_of_week: 1, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 2, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 3, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 4, start_time: '09:00', end_time: '18:00' },
      { day_of_week: 5, start_time: '09:00', end_time: '18:00' },
    ],
  },
  {
    label: 'Todos os dias (10h-22h)',
    schedules: [
      { day_of_week: 0, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 1, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 2, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 3, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 4, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 5, start_time: '10:00', end_time: '22:00' },
      { day_of_week: 6, start_time: '10:00', end_time: '22:00' },
    ],
  },
  {
    label: 'Sábado e Domingo (8h-13h)',
    schedules: [
      { day_of_week: 0, start_time: '08:00', end_time: '13:00' },
      { day_of_week: 6, start_time: '08:00', end_time: '13:00' },
    ],
  },
]

export default function QueueScheduleModal({
  businessId,
  isOpen,
  onClose,
}: QueueScheduleModalProps) {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('queue_schedule')
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

  const applyQuickAction = (action: typeof QUICK_ACTIONS[0]) => {
    setSchedules(action.schedules.map(s => ({ ...s, is_active: true })))
  }

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
        .from('queue_schedule')
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
        .from('queue_schedule')
        .delete()
        .eq('business_id', businessId)

      // Insert new schedules
      if (schedules.length > 0) {
        const { error } = await supabase
          .from('queue_schedule')
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-2xl max-h-[90vh] flex flex-col border-t sm:border border-zinc-200 dark:border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Clock className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                Horários da Fila
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure quando a fila estará aberta
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
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-zinc-500 dark:text-zinc-400">Carregando...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Ações Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => applyQuickAction(action)}
                      className="p-3 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Schedules */}
              <div>
                <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Horários Configurados
                </h3>
                {schedules.length === 0 ? (
                  <div className="text-center py-6 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <Clock className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                      Nenhum horário configurado
                    </p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Use as ações rápidas ou adicione manualmente
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {schedules.map((schedule, index) => (
                      <div
                        key={index}
                        className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          {/* Day of Week */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                              Dia
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
                                  {day.fullLabel}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Time Range */}
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                              Início
                            </label>
                            <input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) => updateSchedule(index, 'start_time', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div className="flex-1">
                            <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                              Fim
                            </label>
                            <input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) => updateSchedule(index, 'end_time', e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeSchedule(index)}
                            className="sm:self-end p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Button */}
                <button
                  onClick={addSchedule}
                  className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm font-medium text-zinc-900 dark:text-white transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Horário
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={saveSchedules}
            disabled={saving}
            className={cn(
              "flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium",
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
