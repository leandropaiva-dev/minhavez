'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Loader, Calendar as CalendarIcon } from 'react-feather'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { useAnalyticsData, type DateRange } from '@/lib/hooks/useAnalyticsData'

type TimeFilter = '24h' | '7d' | '15d' | '30d' | '90d' | 'custom'
type MetricType = 'attendances' | 'avg_time' | 'reservations' | 'queue_count'

interface AnalyticsChartProps {
  businessId: string
}

const timeFilters: { value: TimeFilter; label: string }[] = [
  { value: '24h', label: '24 horas' },
  { value: '7d', label: '7 dias' },
  { value: '15d', label: '15 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: 'custom', label: 'Personalizado' },
]

const metricTypes: { value: MetricType; label: string }[] = [
  { value: 'attendances', label: 'Atendimentos' },
  { value: 'avg_time', label: 'Tempo Médio' },
  { value: 'reservations', label: 'Reservas' },
  { value: 'queue_count', label: 'Pessoas na Fila' },
]

export default function AnalyticsChart({ businessId }: AnalyticsChartProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7d')
  const [metricType, setMetricType] = useState<MetricType>('attendances')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const { data, loading } = useAnalyticsData(businessId, metricType, timeFilter, dateRange)

  return (
    <div className="relative group h-80">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-700/10 to-zinc-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-zinc-700/5 h-full flex flex-col overflow-hidden">
        {/* Header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex-shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-500 dark:text-zinc-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-white truncate">Analytics</h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate">Acompanhe suas métricas</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 flex-shrink-0">
            {/* Metric Type Dropdown */}
            <Select value={metricType} onValueChange={(value) => setMetricType(value as MetricType)}>
              <SelectTrigger className="w-[140px] sm:w-[160px] h-9 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {metricTypes.map((metric) => (
                  <SelectItem key={metric.value} value={metric.value} className="text-zinc-900 dark:text-white text-xs">
                    {metric.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Time Filter Dropdown */}
            <Select
              value={timeFilter}
              onValueChange={(value) => {
                const newFilter = value as TimeFilter
                setTimeFilter(newFilter)
                if (newFilter === 'custom') {
                  setShowDatePicker(true)
                } else {
                  setDateRange(undefined)
                }
              }}
            >
              <SelectTrigger className="w-[100px] sm:w-[120px] h-9 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
                {timeFilters.map((filter) => (
                  <SelectItem key={filter.value} value={filter.value} className="text-zinc-900 dark:text-white text-xs">
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom Date Range Picker */}
            {timeFilter === 'custom' && (
              <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-9 text-xs bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM', { locale: ptBR })} -{' '}
                          {format(dateRange.to, 'dd/MM', { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })
                      )
                    ) : (
                      'Selecionar datas'
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800" align="end">
                  <Calendar
                    mode="range"
                    selected={{ from: dateRange?.from, to: dateRange?.to }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to })
                        setShowDatePicker(false)
                      }
                    }}
                    locale={ptBR}
                    className="rounded-md"
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader className="w-8 h-8 text-zinc-500 dark:text-zinc-400 animate-spin" />
            </div>
          ) : data.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">Sem dados para exibir</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#71717a' }}
                />
                <YAxis
                  stroke="#71717a"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#71717a' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
