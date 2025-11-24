'use client'

import { useState } from 'react'
import { X, Target } from 'react-feather'
import { createClient } from '@/lib/supabase/client'
import type { GoalType, PeriodType } from '@/types/database.types'

interface CreateGoalModalProps {
  businessId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function CreateGoalModal({
  businessId,
  isOpen,
  onClose,
  onSuccess,
}: CreateGoalModalProps) {
  const [goalType, setGoalType] = useState<GoalType>('attendance')
  const [periodType, setPeriodType] = useState<PeriodType>('daily')
  const [targetValue, setTargetValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const goalTypes: { value: GoalType; label: string }[] = [
    { value: 'attendance', label: 'Atendimentos Totais' },
    { value: 'avg_time', label: 'Tempo Médio de Atendimento' },
    { value: 'reservations_served', label: 'Reservas Atendidas' },
    { value: 'reservations_pending', label: 'Reservas Pendentes' },
    { value: 'queue_served', label: 'Fila Atendida' },
    { value: 'queue_pending', label: 'Fila Pendente' },
  ]

  const periodTypes: { value: PeriodType; label: string }[] = [
    { value: 'daily', label: 'Diária' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'biannual', label: 'Semestral' },
    { value: 'annual', label: 'Anual' },
  ]

  const calculateDates = (period: PeriodType) => {
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0)
    const endDate = new Date(startDate)

    switch (period) {
      case 'daily':
        break
      case 'weekly':
        endDate.setDate(endDate.getDate() + 6)
        break
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1)
        break
      case 'quarterly':
        endDate.setMonth(endDate.getMonth() + 3)
        endDate.setDate(endDate.getDate() - 1)
        break
      case 'biannual':
        endDate.setMonth(endDate.getMonth() + 6)
        endDate.setDate(endDate.getDate() - 1)
        break
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1)
        endDate.setDate(endDate.getDate() - 1)
        break
    }

    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!targetValue || parseFloat(targetValue) <= 0) {
      setError('Insira um valor válido maior que 0')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const dates = calculateDates(periodType)

      // Check if goal already exists
      const { data: existing } = await supabase
        .from('business_goals')
        .select('id')
        .eq('business_id', businessId)
        .eq('goal_type', goalType)
        .eq('period_type', periodType)
        .eq('start_date', dates.start_date)
        .single()

      if (existing) {
        setError('Já existe uma meta deste tipo para este período')
        setLoading(false)
        return
      }

      const { error: insertError } = await supabase
        .from('business_goals')
        .insert({
          business_id: businessId,
          goal_type: goalType,
          period_type: periodType,
          target_value: parseFloat(targetValue),
          start_date: dates.start_date,
          end_date: dates.end_date,
          is_active: true,
        })

      if (insertError) throw insertError

      setTargetValue('')
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error creating goal:', err)
      setError('Erro ao criar meta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl max-w-md w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Target className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">Nova Meta</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              Tipo de Meta
            </label>
            <select
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              {goalTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              Período
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as PeriodType)}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
            >
              {periodTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Target Value */}
          <div>
            <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-2">
              Valor Alvo
            </label>
            <input
              type="number"
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Ex: 50"
              min="1"
              step="1"
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-600"
              required
            />
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {goalType === 'avg_time'
                ? 'Tempo em minutos'
                : 'Número de ocorrências'}
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
