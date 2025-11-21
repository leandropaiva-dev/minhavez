'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar, Users, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'

type PeriodFilter = '7d' | '30d' | '90d'
type TypeFilter = 'all' | 'queue' | 'reservation'

interface ReportsManagerProps {
  businessId: string
}

interface DailyData {
  date: string
  clientes: number
  tempo: number
}

interface HourlyData {
  hora: string
  clientes: number
}

interface StatusData {
  name: string
  value: number
  color: string
}

interface Stats {
  totalClientes: number
  totalCompletados: number
  totalCancelados: number
  tempoMedioEspera: number
  mediaDiaria: number
  taxaConversao: number
  comparacaoClientes: number
  comparacaoTempo: number
  comparacaoConversao: number
  comparacaoMedia: number
}

export default function ReportsManager({ businessId }: ReportsManagerProps) {
  const [period, setPeriod] = useState<PeriodFilter>('30d')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [loading, setLoading] = useState(true)

  const [stats, setStats] = useState<Stats>({
    totalClientes: 0,
    totalCompletados: 0,
    totalCancelados: 0,
    tempoMedioEspera: 0,
    mediaDiaria: 0,
    taxaConversao: 0,
    comparacaoClientes: 0,
    comparacaoTempo: 0,
    comparacaoConversao: 0,
    comparacaoMedia: 0,
  })

  const [dailyData, setDailyData] = useState<DailyData[]>([])
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([])
  const [statusData, setStatusData] = useState<StatusData[]>([])

  const fetchReportData = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()

    const endDate = new Date()
    const startDate = new Date()
    const prevStartDate = new Date()

    // Set date ranges based on period
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
    startDate.setDate(startDate.getDate() - days)
    prevStartDate.setDate(prevStartDate.getDate() - (days * 2))

    const startStr = startDate.toISOString()
    const endStr = endDate.toISOString()
    const prevStartStr = prevStartDate.toISOString()

    // Fetch queue entries for current period
    const queueQuery = supabase
      .from('queue_entries')
      .select('id, status, joined_at, called_at, attended_at, completed_at')
      .eq('business_id', businessId)
      .gte('joined_at', startStr)
      .lte('joined_at', endStr)

    // Fetch queue entries for previous period (comparison)
    const prevQueueQuery = supabase
      .from('queue_entries')
      .select('id, status, joined_at, called_at, attended_at, completed_at')
      .eq('business_id', businessId)
      .gte('joined_at', prevStartStr)
      .lt('joined_at', startStr)

    // Fetch reservations for current period
    const reservationsQuery = supabase
      .from('reservations')
      .select('id, status, reservation_date, reservation_time, created_at, updated_at')
      .eq('business_id', businessId)
      .gte('reservation_date', startDate.toISOString().split('T')[0])
      .lte('reservation_date', endDate.toISOString().split('T')[0])

    // Fetch reservations for previous period
    const prevReservationsQuery = supabase
      .from('reservations')
      .select('id, status, reservation_date, reservation_time, created_at, updated_at')
      .eq('business_id', businessId)
      .gte('reservation_date', prevStartDate.toISOString().split('T')[0])
      .lt('reservation_date', startDate.toISOString().split('T')[0])

    const [
      { data: queueData },
      { data: prevQueueData },
      { data: reservationsData },
      { data: prevReservationsData },
    ] = await Promise.all([
      queueQuery,
      prevQueueQuery,
      reservationsQuery,
      prevReservationsQuery,
    ])

    // Process current period data
    const currentEntries: { date: string; status: string; waitTime: number; type: 'queue' | 'reservation' }[] = []

    if (typeFilter === 'all' || typeFilter === 'queue') {
      queueData?.forEach(entry => {
        const waitTime = entry.called_at && entry.joined_at
          ? (new Date(entry.called_at).getTime() - new Date(entry.joined_at).getTime()) / 60000
          : 0
        currentEntries.push({
          date: new Date(entry.joined_at).toISOString().split('T')[0],
          status: entry.status,
          waitTime,
          type: 'queue',
        })
      })
    }

    if (typeFilter === 'all' || typeFilter === 'reservation') {
      reservationsData?.forEach(entry => {
        currentEntries.push({
          date: entry.reservation_date,
          status: entry.status,
          waitTime: 0,
          type: 'reservation',
        })
      })
    }

    // Process previous period data for comparison
    const prevEntries: { status: string; waitTime: number }[] = []

    if (typeFilter === 'all' || typeFilter === 'queue') {
      prevQueueData?.forEach(entry => {
        const waitTime = entry.called_at && entry.joined_at
          ? (new Date(entry.called_at).getTime() - new Date(entry.joined_at).getTime()) / 60000
          : 0
        prevEntries.push({ status: entry.status, waitTime })
      })
    }

    if (typeFilter === 'all' || typeFilter === 'reservation') {
      prevReservationsData?.forEach(entry => {
        prevEntries.push({ status: entry.status, waitTime: 0 })
      })
    }

    // Calculate stats
    const totalClientes = currentEntries.length
    const totalCompletados = currentEntries.filter(e => e.status === 'completed').length
    const totalCancelados = currentEntries.filter(e => e.status === 'cancelled').length
    const waitTimes = currentEntries.filter(e => e.waitTime > 0).map(e => e.waitTime)
    const tempoMedioEspera = waitTimes.length > 0
      ? Math.round(waitTimes.reduce((a, b) => a + b, 0) / waitTimes.length)
      : 0
    const taxaConversao = totalClientes > 0
      ? Math.round((totalCompletados / totalClientes) * 1000) / 10
      : 0
    const mediaDiaria = Math.round(totalClientes / days)

    // Calculate previous period stats for comparison
    const prevTotalClientes = prevEntries.length
    const prevTotalCompletados = prevEntries.filter(e => e.status === 'completed').length
    const prevWaitTimes = prevEntries.filter(e => e.waitTime > 0).map(e => e.waitTime)
    const prevTempoMedio = prevWaitTimes.length > 0
      ? prevWaitTimes.reduce((a, b) => a + b, 0) / prevWaitTimes.length
      : 0
    const prevTaxaConversao = prevTotalClientes > 0
      ? (prevTotalCompletados / prevTotalClientes) * 100
      : 0
    const prevMediaDiaria = prevTotalClientes / days

    // Calculate comparison percentages
    const comparacaoClientes = prevTotalClientes > 0
      ? Math.round(((totalClientes - prevTotalClientes) / prevTotalClientes) * 100)
      : 0
    const comparacaoTempo = prevTempoMedio > 0
      ? Math.round(((tempoMedioEspera - prevTempoMedio) / prevTempoMedio) * 100)
      : 0
    const comparacaoConversao = prevTaxaConversao > 0
      ? Math.round((taxaConversao - prevTaxaConversao) * 10) / 10
      : 0
    const comparacaoMedia = prevMediaDiaria > 0
      ? Math.round(((mediaDiaria - prevMediaDiaria) / prevMediaDiaria) * 100)
      : 0

    setStats({
      totalClientes,
      totalCompletados,
      totalCancelados,
      tempoMedioEspera,
      mediaDiaria,
      taxaConversao,
      comparacaoClientes,
      comparacaoTempo,
      comparacaoConversao,
      comparacaoMedia,
    })

    // Generate daily data for chart
    const dailyMap = new Map<string, { clientes: number; waitTimes: number[] }>()

    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      dailyMap.set(dateStr, { clientes: 0, waitTimes: [] })
    }

    currentEntries.forEach(entry => {
      const existing = dailyMap.get(entry.date)
      if (existing) {
        existing.clientes++
        if (entry.waitTime > 0) {
          existing.waitTimes.push(entry.waitTime)
        }
      }
    })

    const dailyChartData: DailyData[] = []
    dailyMap.forEach((value, key) => {
      const avgWait = value.waitTimes.length > 0
        ? Math.round(value.waitTimes.reduce((a, b) => a + b, 0) / value.waitTimes.length)
        : 0
      dailyChartData.push({
        date: new Date(key).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        clientes: value.clientes,
        tempo: avgWait,
      })
    })

    dailyChartData.reverse()
    // Limit to last 14 days for readability
    setDailyData(dailyChartData.slice(-14))

    // Generate hourly data (only for queue entries)
    const hourlyMap = new Map<number, number>()
    for (let i = 8; i <= 22; i++) {
      hourlyMap.set(i, 0)
    }

    queueData?.forEach(entry => {
      const hour = new Date(entry.joined_at).getHours()
      if (hourlyMap.has(hour)) {
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      }
    })

    reservationsData?.forEach(entry => {
      const hour = parseInt(entry.reservation_time.split(':')[0])
      if (hourlyMap.has(hour)) {
        hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + 1)
      }
    })

    const hourlyChartData: HourlyData[] = []
    hourlyMap.forEach((value, key) => {
      hourlyChartData.push({
        hora: `${key}h`,
        clientes: value,
      })
    })

    setHourlyData(hourlyChartData)

    // Status distribution
    setStatusData([
      { name: 'Concluídos', value: totalCompletados, color: '#3b82f6' },
      { name: 'Cancelados', value: totalCancelados, color: '#ef4444' },
    ])

    setLoading(false)
  }, [businessId, period, typeFilter])

  useEffect(() => {
    fetchReportData()
  }, [fetchReportData])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-zinc-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodFilter)}>
            <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="7d" className="text-zinc-900 dark:text-white text-xs sm:text-sm">7 dias</SelectItem>
              <SelectItem value="30d" className="text-zinc-900 dark:text-white text-xs sm:text-sm">30 dias</SelectItem>
              <SelectItem value="90d" className="text-zinc-900 dark:text-white text-xs sm:text-sm">90 dias</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as TypeFilter)}>
            <SelectTrigger className="h-9 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm w-full sm:w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <SelectItem value="all" className="text-zinc-900 dark:text-white text-xs sm:text-sm">Fila + Reservas</SelectItem>
              <SelectItem value="queue" className="text-zinc-900 dark:text-white text-xs sm:text-sm">Apenas Fila</SelectItem>
              <SelectItem value="reservation" className="text-zinc-900 dark:text-white text-xs sm:text-sm">Apenas Reservas</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            {stats.comparacaoClientes !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${stats.comparacaoClientes >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.comparacaoClientes >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(stats.comparacaoClientes)}%</span>
              </div>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs mb-0.5">Total de Clientes</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalClientes.toLocaleString('pt-BR')}</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            {stats.comparacaoConversao !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${stats.comparacaoConversao >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.comparacaoConversao >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(stats.comparacaoConversao)}%</span>
              </div>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs mb-0.5">Taxa de Conclusão</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stats.taxaConversao}%</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            {stats.comparacaoTempo !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${stats.comparacaoTempo <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.comparacaoTempo <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                <span>{Math.abs(stats.comparacaoTempo)}%</span>
              </div>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs mb-0.5">Tempo Médio Espera</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stats.tempoMedioEspera}min</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="p-1.5 sm:p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
            </div>
            {stats.comparacaoMedia !== 0 && (
              <div className={`flex items-center gap-1 text-[10px] sm:text-xs ${stats.comparacaoMedia >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stats.comparacaoMedia >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{Math.abs(stats.comparacaoMedia)}%</span>
              </div>
            )}
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs mb-0.5">Média Diária</p>
          <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white">{stats.mediaDiaria}</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Daily Customers Chart */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Clientes por Dia
          </h3>
          {dailyData.length > 0 ? (
            <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px] px-2 sm:px-0">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={dailyData}>
                    <defs>
                      <linearGradient id="colorClientes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #18181b)',
                        border: '1px solid var(--tooltip-border, #27272a)',
                        borderRadius: '8px',
                        color: 'var(--tooltip-color, #fff)',
                      }}
                      labelStyle={{ color: 'var(--tooltip-color, #fff)' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="clientes"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorClientes)"
                      name="Clientes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-zinc-500 dark:text-zinc-400 text-sm">
              Sem dados para o período selecionado
            </div>
          )}
        </div>

        {/* Hourly Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Distribuição por Horário
          </h3>
          {hourlyData.some(d => d.clientes > 0) ? (
            <div className="w-full overflow-x-auto -mx-2 sm:mx-0">
              <div className="min-w-[300px] px-2 sm:px-0">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                    <XAxis dataKey="hora" stroke="#71717a" fontSize={10} />
                    <YAxis stroke="#71717a" fontSize={10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #18181b)',
                        border: '1px solid var(--tooltip-border, #27272a)',
                        borderRadius: '8px',
                        color: 'var(--tooltip-color, #fff)',
                      }}
                      labelStyle={{ color: 'var(--tooltip-color, #fff)' }}
                    />
                    <Bar dataKey="clientes" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Clientes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-zinc-500 dark:text-zinc-400 text-sm">
              Sem dados para o período selecionado
            </div>
          )}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Status dos Atendimentos
          </h3>
          {statusData.some(d => d.value > 0) ? (
            <>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--tooltip-bg, #18181b)',
                        border: '1px solid var(--tooltip-border, #27272a)',
                        borderRadius: '8px',
                        color: 'var(--tooltip-color, #fff)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">{item.name}</span>
                    <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white">
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-zinc-500 dark:text-zinc-400 text-sm">
              Sem dados para o período selecionado
            </div>
          )}
        </div>

        {/* Summary Stats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6">
          <h3 className="text-zinc-900 dark:text-white font-semibold text-sm sm:text-base mb-3 sm:mb-4">
            Resumo do Período
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Atendimentos Concluídos</span>
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.totalCompletados}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Atendimentos Cancelados</span>
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">{stats.totalCancelados}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-zinc-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Tempo Total de Espera</span>
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {stats.tempoMedioEspera * stats.totalClientes > 60
                  ? `${Math.round(stats.tempoMedioEspera * stats.totalClientes / 60)}h`
                  : `${stats.tempoMedioEspera * stats.totalClientes}min`
                }
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-zinc-500" />
                <span className="text-sm text-zinc-700 dark:text-zinc-300">Pico de Clientes (dia)</span>
              </div>
              <span className="text-lg font-bold text-zinc-900 dark:text-white">
                {dailyData.length > 0 ? Math.max(...dailyData.map(d => d.clientes)) : 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
