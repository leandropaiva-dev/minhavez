'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import MetricCard from './MetricCard'

interface RealtimeMetricsProps {
  businessId: string
  initialStats: {
    currentQueue: number
    todayAttended: number
    avgWaitTime: number
  }
  todayReservations: number
}

export default function RealtimeMetrics({
  businessId,
  initialStats,
  todayReservations: initialReservations,
}: RealtimeMetricsProps) {
  const [stats, setStats] = useState(initialStats)
  const [todayReservations, setTodayReservations] = useState(initialReservations)

  useEffect(() => {
    const supabase = createClient()

    const fetchMetrics = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      // Fila atual
      const { count: currentQueue } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('status', 'waiting')

      // Atendidos hoje da FILA
      const { count: queueAttended } = await supabase
        .from('queue_entries')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .in('status', ['completed', 'attending'])
        .gte('joined_at', today.toISOString())

      // Atendidos hoje das RESERVAS (completed, seated, arrived)
      const { count: reservationsCompleted } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .in('status', ['completed', 'seated', 'arrived'])
        .eq('reservation_date', todayStr)

      // Total de atendidos = fila + reservas
      const totalAttended = (queueAttended || 0) + (reservationsCompleted || 0)

      console.log('[RealtimeMetrics] Queue attended:', queueAttended, 'Reservations completed:', reservationsCompleted, 'Total:', totalAttended)

      // Reservas de hoje (todas exceto cancelled)
      const { count: reservationsToday } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('business_id', businessId)
        .eq('reservation_date', todayStr)
        .neq('status', 'cancelled')

      // Tempo médio: considerar FILA + RESERVAS
      const { data: completedQueue } = await supabase
        .from('queue_entries')
        .select('joined_at, attended_at, completed_at')
        .eq('business_id', businessId)
        .in('status', ['completed', 'attending'])
        .gte('joined_at', today.toISOString())

      let avgWaitTime = 0
      let totalMinutes = 0
      let totalEntries = 0

      // Calcular tempo da fila
      if (completedQueue && completedQueue.length > 0) {
        const validQueue = completedQueue.filter(entry => entry.attended_at || entry.completed_at)
        validQueue.forEach(entry => {
          const joined = new Date(entry.joined_at).getTime()
          const endTime = entry.completed_at || entry.attended_at
          const ended = new Date(endTime!).getTime()
          totalMinutes += (ended - joined) / 60000
          totalEntries++
        })
      }

      // Calcular tempo das reservas - usar reservation_time até updated_at
      const { data: completedReservationsTime } = await supabase
        .from('reservations')
        .select('reservation_time, updated_at, created_at')
        .eq('business_id', businessId)
        .in('status', ['completed', 'seated', 'arrived'])
        .eq('reservation_date', todayStr)

      if (completedReservationsTime && completedReservationsTime.length > 0) {
        completedReservationsTime.forEach(reservation => {
          // Usar horário da reserva como base, não created_at
          const reservationDateTime = new Date(`${todayStr}T${reservation.reservation_time}`).getTime()
          const updated = new Date(reservation.updated_at).getTime()
          const minutes = (updated - reservationDateTime) / 60000
          if (minutes > 0 && minutes < 480) { // Apenas se for razoável (menos de 8h)
            totalMinutes += minutes
            totalEntries++
          }
        })
      }

      if (totalEntries > 0) {
        avgWaitTime = Math.round(totalMinutes / totalEntries)
      }

      setStats({
        currentQueue: currentQueue || 0,
        todayAttended: totalAttended,
        avgWaitTime,
      })
      setTodayReservations(reservationsToday || 0)
    }

    // Initial fetch
    fetchMetrics()

    // Subscribe to queue_entries changes
    const queueChannel = supabase
      .channel('queue-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `business_id=eq.${businessId}`,
        },
        fetchMetrics
      )
      .subscribe()

    // Subscribe to reservations changes
    const reservationsChannel = supabase
      .channel('reservations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservations',
          filter: `business_id=eq.${businessId}`,
        },
        fetchMetrics
      )
      .subscribe()

    return () => {
      supabase.removeChannel(queueChannel)
      supabase.removeChannel(reservationsChannel)
    }
  }, [businessId])

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <MetricCard
        title="Fila Atual"
        value={stats.currentQueue}
        iconName="users"
        subtitle="pessoas aguardando"
      />
      <MetricCard
        title="Reservas de Hoje"
        value={todayReservations}
        iconName="users"
        subtitle="reservas confirmadas"
      />
      <MetricCard
        title="Atendidos Hoje"
        value={stats.todayAttended}
        iconName="trending-up"
        subtitle="clientes atendidos"
      />
      <MetricCard
        title="Tempo Médio"
        value={`${stats.avgWaitTime}min`}
        iconName="clock"
        subtitle="tempo de atendimento"
      />
    </div>
  )
}
