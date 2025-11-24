'use client'

import { useState } from 'react'
import { Target, Plus, TrendingUp, TrendingDown, Loader } from 'react-feather'
import type { PeriodType, GoalType } from '@/types/database.types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBusinessGoals } from '@/lib/hooks/useBusinessGoals'
import CreateGoalModal from './CreateGoalModal'

interface GoalsPanelProps {
  businessId: string
}

const periodTypes: { value: PeriodType; label: string }[] = [
  { value: 'daily', label: 'Diária' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
]

const goalTypes: { value: GoalType; label: string; unit: string }[] = [
  { value: 'attendance', label: 'Atendimentos Geral', unit: 'atendimentos' },
  { value: 'avg_time', label: 'Tempo Médio', unit: 'min' },
  { value: 'reservations_served', label: 'Reservas Atendidas', unit: 'reservas' },
  { value: 'reservations_pending', label: 'Reservas Pendentes', unit: 'reservas' },
  { value: 'queue_served', label: 'Fila Atendida', unit: 'pessoas' },
  { value: 'queue_pending', label: 'Fila Pendente', unit: 'pessoas' },
]

export default function GoalsPanel({ businessId }: GoalsPanelProps) {
  const [periodFilter, setPeriodFilter] = useState<PeriodType>('monthly')
  const [goalTypeFilter, setGoalTypeFilter] = useState<GoalType>('attendance')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch real goal data
  const { goal: currentGoal, loading } = useBusinessGoals(businessId, goalTypeFilter, periodFilter, refreshKey)

  const getGoalUnit = (type: GoalType) => {
    return goalTypes.find((g) => g.value === type)?.unit || ''
  }

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100)
  }

  const isGoalMet = (current: number, target: number, type: GoalType) => {
    // For avg_time, lower is better
    if (type === 'avg_time') {
      return current <= target
    }
    return current >= target
  }

  return (
    <div className="relative group h-80">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-700/5 h-full flex flex-col overflow-hidden">
        {/* Header with filters */}
        <div className="flex flex-col gap-3 mb-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">Metas</h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">Acompanhe seu progresso</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="p-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-300 dark:border-zinc-700 rounded-lg transition-colors flex-shrink-0"
              title="Adicionar meta"
            >
              <Plus className="w-4 h-4 text-zinc-900 dark:text-white" />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Goal Type Dropdown */}
            <Select value={goalTypeFilter} onValueChange={(value) => setGoalTypeFilter(value as GoalType)}>
              <SelectTrigger className="w-[130px] sm:w-[140px] h-9 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {goalTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-zinc-900 dark:text-white text-xs">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Period Filter Dropdown */}
            <Select value={periodFilter} onValueChange={(value) => setPeriodFilter(value as PeriodType)}>
              <SelectTrigger className="w-[100px] sm:w-[110px] h-9 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {periodTypes.map((period) => (
                  <SelectItem key={period.value} value={period.value} className="text-zinc-900 dark:text-white text-xs">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Goal Display */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center">
              <Loader className="w-8 h-8 text-zinc-500 dark:text-zinc-400 animate-spin" />
            </div>
          ) : !currentGoal ? (
            <div className="flex flex-col items-center justify-center text-center">
              <Target className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">Nenhuma meta definida</p>
              <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-1">Clique em + para adicionar</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-zinc-500 dark:text-zinc-400 text-xs mb-1">Meta {periodTypes.find(p => p.value === periodFilter)?.label}</p>
                  <p className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
                    {currentGoal.current_value} / {currentGoal.target_value}
                  </p>
                  <p className="text-zinc-400 dark:text-zinc-500 text-sm mt-1">{getGoalUnit(currentGoal.goal_type)}</p>
                </div>
                {isGoalMet(currentGoal.current_value, currentGoal.target_value, currentGoal.goal_type) ? (
                  <TrendingUp className="w-8 h-8 text-green-500 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden mb-2">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-blue-600"
                  style={{ width: `${calculateProgress(currentGoal.current_value, currentGoal.target_value)}%` }}
                />
              </div>

              <p className="text-zinc-500 dark:text-zinc-400 text-sm text-center">
                {calculateProgress(currentGoal.current_value, currentGoal.target_value).toFixed(0)}% concluído
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Create Goal Modal */}
      <CreateGoalModal
        businessId={businessId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setRefreshKey(prev => prev + 1)
        }}
      />
    </div>
  )
}
