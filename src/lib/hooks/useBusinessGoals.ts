import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { GoalType, PeriodType } from '@/types/database.types'

interface Goal {
  id: string
  goal_type: GoalType
  period_type: PeriodType
  target_value: number
  current_value: number
  start_date: string
  end_date: string
}

export function useBusinessGoals(
  businessId: string,
  goalType: GoalType,
  periodType: PeriodType,
  refreshKey?: number
) {
  const [goal, setGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!businessId) {
      setGoal(null)
      setLoading(false)
      return
    }

    const fetchGoal = async () => {
      setLoading(true)
      const supabase = createClient()

      // Fetch goal from database - get the most recent one for this period
      const today = new Date()
      const { data: goals, error } = await supabase
        .from('business_goals')
        .select('*')
        .eq('business_id', businessId)
        .eq('goal_type', goalType)
        .eq('period_type', periodType)
        .eq('is_active', true)
        .lte('start_date', today.toISOString().split('T')[0])
        .gte('end_date', today.toISOString().split('T')[0])
        .order('created_at', { ascending: false })

      if (error || !goals || goals.length === 0) {
        setGoal(null)
        setLoading(false)
        return
      }

      const goalData = goals[0]

      // Calculate current_value based on goal_type
      let currentValue = 0
      const startDate = new Date(goalData.start_date)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(goalData.end_date)
      endDate.setHours(23, 59, 59, 999)

      try {
        switch (goalType) {
          case 'attendance': {
            // Total completed from BOTH queue AND reservations
            // Filter by completion date, not entry date
            const { count: queueCount } = await supabase
              .from('queue_entries')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .eq('status', 'completed')
              .gte('completed_at', startDate.toISOString())
              .lte('completed_at', endDate.toISOString())

            const { count: reservationCount } = await supabase
              .from('reservations')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .in('status', ['completed', 'seated', 'arrived'])
              .gte('reservation_date', startDate.toISOString().split('T')[0])
              .lte('reservation_date', endDate.toISOString().split('T')[0])

            currentValue = (queueCount || 0) + (reservationCount || 0)
            break
          }

          case 'avg_time': {
            // Average wait time from BOTH queue AND reservations
            const { data: queueEntries } = await supabase
              .from('queue_entries')
              .select('joined_at, attended_at, completed_at')
              .eq('business_id', businessId)
              .in('status', ['completed', 'attending'])
              .gte('joined_at', startDate.toISOString())
              .lte('joined_at', endDate.toISOString())

            const { data: reservationEntries } = await supabase
              .from('reservations')
              .select('created_at, updated_at')
              .eq('business_id', businessId)
              .eq('status', 'completed')
              .gte('reservation_date', startDate.toISOString().split('T')[0])
              .lte('reservation_date', endDate.toISOString().split('T')[0])

            let totalMinutes = 0
            let totalCount = 0

            // Calculate queue wait times
            if (queueEntries && queueEntries.length > 0) {
              const validQueue = queueEntries.filter(entry => entry.attended_at || entry.completed_at)
              validQueue.forEach(entry => {
                const joined = new Date(entry.joined_at).getTime()
                const endTime = entry.completed_at || entry.attended_at
                const ended = new Date(endTime!).getTime()
                totalMinutes += (ended - joined) / 60000
                totalCount++
              })
            }

            // Calculate reservation processing times
            if (reservationEntries && reservationEntries.length > 0) {
              reservationEntries.forEach(entry => {
                const created = new Date(entry.created_at).getTime()
                const updated = new Date(entry.updated_at).getTime()
                totalMinutes += (updated - created) / 60000
                totalCount++
              })
            }

            if (totalCount > 0) {
              currentValue = Math.round(totalMinutes / totalCount)
            }
            break
          }

          case 'reservations_served': {
            // Completed reservations in period
            const { count } = await supabase
              .from('reservations')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .eq('status', 'completed')
              .gte('reservation_date', startDate.toISOString().split('T')[0])
              .lte('reservation_date', endDate.toISOString().split('T')[0])
            currentValue = count || 0
            break
          }

          case 'reservations_pending': {
            // Pending reservations in period
            const { count } = await supabase
              .from('reservations')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .in('status', ['pending', 'confirmed'])
              .gte('reservation_date', today.toISOString().split('T')[0])
              .lte('reservation_date', endDate.toISOString().split('T')[0])
            currentValue = count || 0
            break
          }

          case 'queue_served': {
            // Completed queue entries in period (filter by completion date)
            const { count } = await supabase
              .from('queue_entries')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .eq('status', 'completed')
              .gte('completed_at', startDate.toISOString())
              .lte('completed_at', endDate.toISOString())
            currentValue = count || 0
            break
          }

          case 'queue_pending': {
            // Waiting queue entries
            const { count } = await supabase
              .from('queue_entries')
              .select('*', { count: 'exact', head: true })
              .eq('business_id', businessId)
              .eq('status', 'waiting')
            currentValue = count || 0
            break
          }
        }

        setGoal({
          ...goalData,
          current_value: currentValue,
        })
      } catch (error) {
        console.error('Error calculating goal current value:', error)
        setGoal(goalData)
      }

      setLoading(false)
    }

    fetchGoal()
  }, [businessId, goalType, periodType, refreshKey])

  return { goal, loading }
}
