import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TimeFilter = '24h' | '7d' | '15d' | '30d' | '90d'
type MetricType = 'attendances' | 'avg_time' | 'reservations' | 'queue_count'

interface DataPoint {
  date: string
  value: number
}

// Tipos auxiliares para as agregações
type DateLike = string | Date

interface QueueEntryWithStatus {
  created_at: string
  status?: string | null
}

interface ReservationWithStatus {
  reservation_date: string
  status?: string | null
}

interface QueueEntryWithTimes {
  created_at: string
  completed_at: string | null
  // `called_at` existe mas não é usado no cálculo,
  // então marcamos como opcional para não atrapalhar
  called_at?: string | null
}

export function useAnalyticsData(
  businessId: string,
  metricType: MetricType,
  timeFilter: TimeFilter
) {
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) {
      setData([])
      setLoading(false)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      const supabase = createClient()

      // Calculate date range
      const endDate = new Date()
      const startDate = new Date()

      switch (timeFilter) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24)
          break
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '15d':
          startDate.setDate(startDate.getDate() - 15)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
      }

      try {
        if (metricType === 'attendances') {
          // Fetch queue entries that were completed / cancelled / no_show
          const { data: entries } = await supabase
            .from('queue_entries')
            .select('created_at, status')
            .eq('business_id', businessId)
            .in('status', ['completed', 'cancelled', 'no_show'])
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at')

          if (entries) {
            const aggregated = aggregateByDate<QueueEntryWithStatus>(
              entries,
              'created_at',
              timeFilter
            )
            setData(fillDateRange(aggregated, timeFilter))
          } else {
            setData(fillDateRange([], timeFilter))
          }
        } else if (metricType === 'avg_time') {
          // Fetch queue entries with wait times
          const { data: entries } = await supabase
            .from('queue_entries')
            .select('created_at, called_at, completed_at')
            .eq('business_id', businessId)
            .eq('status', 'completed')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at')

          if (entries) {
            const aggregated = aggregateAvgTimeByDate(
              entries as QueueEntryWithTimes[],
              timeFilter
            )
            setData(fillDateRange(aggregated, timeFilter))
          } else {
            setData(fillDateRange([], timeFilter))
          }
        } else if (metricType === 'reservations') {
          // Fetch reservations
          const { data: reservations } = await supabase
            .from('reservations')
            .select('reservation_date, status')
            .eq('business_id', businessId)
            .gte('reservation_date', startDate.toISOString().split('T')[0])
            .lte('reservation_date', endDate.toISOString().split('T')[0])
            .order('reservation_date')

          if (reservations) {
            const aggregated = aggregateByDate<ReservationWithStatus>(
              reservations,
              'reservation_date',
              timeFilter
            )
            setData(fillDateRange(aggregated, timeFilter))
          } else {
            setData(fillDateRange([], timeFilter))
          }
        } else if (metricType === 'queue_count') {
          // Fetch current queue count over time
          const { data: entries } = await supabase
            .from('queue_entries')
            .select('created_at, status')
            .eq('business_id', businessId)
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at')

          if (entries) {
            const aggregated = aggregateByDate<QueueEntryWithStatus>(
              entries,
              'created_at',
              timeFilter
            )
            setData(fillDateRange(aggregated, timeFilter))
          } else {
            setData(fillDateRange([], timeFilter))
          }
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [businessId, metricType, timeFilter])

  return { data, loading }
}

// Helper function to aggregate data by date or hour
function aggregateByDate<T extends Record<string, unknown>>(
  items: T[],
  dateField: keyof T & string,
  timeFilter?: TimeFilter
): DataPoint[] {
  const grouped = items.reduce<Record<string, number>>((acc, item) => {
    const rawDate = item[dateField] as DateLike

    // Garante que temos algo que dê pra criar uma Date
    const date = new Date(rawDate)

    // For 24h, group by hour
    const key =
      timeFilter === '24h'
        ? date
            .toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            .slice(0, 2) + 'h'
        : date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })

    acc[key] = (acc[key] ?? 0) + 1

    return acc
  }, {})

  return Object.entries(grouped).map(([date, value]) => ({
    date,
    value,
  }))
}

// Helper function to calculate average time by date or hour
function aggregateAvgTimeByDate(
  items: QueueEntryWithTimes[],
  timeFilter?: TimeFilter
): DataPoint[] {
  const grouped = items.reduce<
    Record<string, { total: number; count: number }>
  >((acc, item) => {
    if (!item.created_at || !item.completed_at) return acc

    const date = new Date(item.created_at)

    // For 24h, group by hour
    const key =
      timeFilter === '24h'
        ? date
            .toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
            .slice(0, 2) + 'h'
        : date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
          })

    const waitTime =
      new Date(item.completed_at).getTime() -
      new Date(item.created_at).getTime()
    const waitMinutes = Math.round(waitTime / 1000 / 60)

    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 }
    }
    acc[key].total += waitMinutes
    acc[key].count++

    return acc
  }, {})

  return Object.entries(grouped).map(([date, { total, count }]) => ({
    date,
    value: Math.round(total / count),
  }))
}

// Helper function to fill date range with empty values
function fillDateRange(data: DataPoint[], timeFilter: TimeFilter): DataPoint[] {
  const endDate = new Date()
  const startDate = new Date()

  switch (timeFilter) {
    case '24h':
      startDate.setHours(startDate.getHours() - 24)
      break
    case '7d':
      startDate.setDate(startDate.getDate() - 7)
      break
    case '15d':
      startDate.setDate(startDate.getDate() - 15)
      break
    case '30d':
      startDate.setDate(startDate.getDate() - 30)
      break
    case '90d':
      startDate.setDate(startDate.getDate() - 90)
      break
  }

  const allDates: DataPoint[] = []
  const currentDate = new Date(startDate)

  // Create map of existing data
  const dataMap = new Map<string, number>(data.map(d => [d.date, d.value]))

  // For 24h, fill by hour
  if (timeFilter === '24h') {
    const hours: DataPoint[] = []
    while (currentDate <= endDate) {
      const key = `${currentDate.getHours().toString().padStart(2, '0')}h`
      if (!hours.find(d => d.date === key)) {
        hours.push({
          date: key,
          value: dataMap.get(key) ?? 0,
        })
      }
      currentDate.setHours(currentDate.getHours() + 1)
    }

    // Reorder so current hour is last
    const currentHour = endDate.getHours()
    const currentHourIndex = hours.findIndex(
      h => parseInt(h.date, 10) === currentHour
    )
    if (currentHourIndex !== -1) {
      const beforeCurrent = hours.slice(currentHourIndex + 1)
      const afterCurrent = hours.slice(0, currentHourIndex + 1)
      allDates.push(...beforeCurrent, ...afterCurrent)
    } else {
      allDates.push(...hours)
    }
  } else {
    // For other periods, fill by date
    while (currentDate <= endDate) {
      const key = currentDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      })
      allDates.push({
        date: key,
        value: dataMap.get(key) ?? 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return allDates
}
