import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type TimeFilter = '24h' | '7d' | '15d' | '30d' | '90d' | 'custom'
type MetricType = 'attendances' | 'avg_time' | 'reservations' | 'queue_count'

interface DataPoint {
  date: string
  value: number
}

export interface DateRange {
  from: Date
  to: Date
}

export function useAnalyticsData(
  businessId: string,
  metricType: MetricType,
  timeFilter: TimeFilter,
  customDateRange?: DateRange
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
      let endDate = new Date()
      let startDate = new Date()

      if (timeFilter === 'custom' && customDateRange) {
        startDate = new Date(customDateRange.from)
        endDate = new Date(customDateRange.to)
      } else {
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
      }

      try {
        if (metricType === 'attendances') {
          // Fetch queue entries that were completed
          const { data: queueEntries } = await supabase
            .from('queue_entries')
            .select('created_at, status')
            .eq('business_id', businessId)
            .in('status', ['completed', 'cancelled', 'no_show'])
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at')

          // Fetch reservations
          const { data: reservationEntries } = await supabase
            .from('reservations')
            .select('reservation_date, status')
            .eq('business_id', businessId)
            .gte('reservation_date', startDate.toISOString().split('T')[0])
            .lte('reservation_date', endDate.toISOString().split('T')[0])
            .order('reservation_date')

          // Combine both queue and reservations
          const combinedEntries: Record<string, string>[] = []

          if (queueEntries) {
            queueEntries.forEach(entry => {
              combinedEntries.push({ created_at: entry.created_at, status: entry.status })
            })
          }

          if (reservationEntries) {
            reservationEntries.forEach(entry => {
              combinedEntries.push({ created_at: entry.reservation_date, status: entry.status })
            })
          }

          if (combinedEntries.length > 0) {
            const aggregated = aggregateByDate(combinedEntries, 'created_at', timeFilter)
            setData(fillDateRange(aggregated, timeFilter))
          } else {
            setData(fillDateRange([], timeFilter))
          }
        } else if (metricType === 'avg_time') {
          // Fetch queue entries with wait times
          const { data: queueEntries } = await supabase
            .from('queue_entries')
            .select('created_at, called_at, completed_at')
            .eq('business_id', businessId)
            .eq('status', 'completed')
            .gte('created_at', startDate.toISOString())
            .lte('created_at', endDate.toISOString())
            .order('created_at')

          // Fetch reservations with processing times
          const { data: reservationEntries } = await supabase
            .from('reservations')
            .select('reservation_date, created_at, updated_at')
            .eq('business_id', businessId)
            .eq('status', 'completed')
            .gte('reservation_date', startDate.toISOString().split('T')[0])
            .lte('reservation_date', endDate.toISOString().split('T')[0])
            .order('reservation_date')

          // Combine both sources for avg time calculation
          const combinedTimes: { created_at: string; completed_at: string | null }[] = []

          if (queueEntries) {
            queueEntries.forEach(entry => {
              combinedTimes.push({
                created_at: entry.created_at,
                completed_at: entry.completed_at
              })
            })
          }

          if (reservationEntries) {
            reservationEntries.forEach(entry => {
              combinedTimes.push({
                created_at: entry.created_at,
                completed_at: entry.updated_at
              })
            })
          }

          if (combinedTimes.length > 0) {
            const aggregated = aggregateAvgTimeByDate(combinedTimes, timeFilter)
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
            const aggregated = aggregateByDate(reservations, 'reservation_date', timeFilter)
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
            const aggregated = aggregateByDate(entries, 'created_at', timeFilter)
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
  }, [businessId, metricType, timeFilter, customDateRange])

  return { data, loading }
}

// Helper function to aggregate data by date or hour
function aggregateByDate(
  items: Record<string, string>[],
  dateField: string,
  timeFilter?: TimeFilter
): DataPoint[] {
  const grouped = items.reduce((acc, item) => {
    const date = new Date(item[dateField])

    // For 24h, group by hour
    const key = timeFilter === '24h'
      ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).slice(0, 2) + 'h'
      : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    if (!acc[key]) {
      acc[key] = 0
    }
    acc[key]++

    return acc
  }, {} as Record<string, number>)

  return Object.entries(grouped).map(([date, value]) => ({
    date,
    value,
  }))
}

// Helper function to calculate average time by date or hour
function aggregateAvgTimeByDate(items: { created_at: string; completed_at: string | null }[], timeFilter?: TimeFilter): DataPoint[] {
  const grouped = items.reduce((acc, item) => {
    if (!item.created_at || !item.completed_at) return acc

    const date = new Date(item.created_at)

    // For 24h, group by hour
    const key = timeFilter === '24h'
      ? date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }).slice(0, 2) + 'h'
      : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })

    const waitTime = new Date(item.completed_at).getTime() - new Date(item.created_at).getTime()
    const waitMinutes = Math.round(waitTime / 1000 / 60)

    if (!acc[key]) {
      acc[key] = { total: 0, count: 0 }
    }
    acc[key].total += waitMinutes
    acc[key].count++

    return acc
  }, {} as Record<string, { total: number; count: number }>)

  return Object.entries(grouped).map(([date, { total, count }]) => ({
    date,
    value: Math.round(total / count),
  }))
}

// Helper function to fill date range with empty values
function fillDateRange(
  data: DataPoint[],
  timeFilter: TimeFilter
): DataPoint[] {
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
  const dataMap = new Map(data.map(d => [d.date, d.value]))

  // For 24h, fill by hour
  if (timeFilter === '24h') {
    const hours: DataPoint[] = []
    while (currentDate <= endDate) {
      const key = currentDate.getHours().toString().padStart(2, '0') + 'h'
      if (!hours.find(d => d.date === key)) {
        hours.push({
          date: key,
          value: dataMap.get(key) || 0,
        })
      }
      currentDate.setHours(currentDate.getHours() + 1)
    }

    // Reorder so current hour is last
    const currentHour = endDate.getHours()
    const currentHourIndex = hours.findIndex(h => parseInt(h.date) === currentHour)
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
      const key = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      allDates.push({
        date: key,
        value: dataMap.get(key) || 0,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }
  }

  return allDates
}
