'use server'

import { createClient } from '@/lib/supabase/server'
import { requireSuperAdmin } from './permissions'

export interface UserActivityLog {
  id: string
  activity_type: string
  details: Record<string, unknown> | null
  created_at: string
  business_id: string | null
}

export interface BusinessMetrics {
  // Page views & traffic
  totalPageViews: number
  uniqueVisitors: number
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }

  // Conversion
  conversionRate: number
  formStarts: number
  formSubmissions: number

  // Queue
  total_queue_entries: number
  queue_completed: number
  queue_cancelled: number
  queue_no_show: number
  queue_waiting: number
  avg_wait_time: number
  completion_rate: number

  // Reservations
  total_reservations: number
  confirmed_reservations: number
  pending_reservations: number
  canceled_reservations: number
  no_show_reservations: number
  confirmation_rate: number

  // General
  avg_party_size: number
}

export interface DetailedUserData {
  userId: string
  email: string
  createdAt: string
  lastActivity: string | null
  totalLogins: number
  activityLogs: UserActivityLog[]
  businesses: {
    id: string
    name: string
    business_type: string
    subscription_status: string
    trial_ends_at: string | null
    created_at: string
    metrics: BusinessMetrics
  }[]
}

/**
 * Get detailed user information (super admin only)
 */
export async function getUserDetailedInfo(userId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  // Get user email
  const { data: email } = await supabase.rpc('get_user_email', {
    p_user_id: userId
  })

  // Get user's businesses
  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .eq('user_id', userId)

  // Get activity logs
  const { data: activityLogs } = await supabase
    .from('user_activity')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get last activity
  const { data: lastActivity } = await supabase.rpc('get_user_last_activity', {
    p_user_id: userId
  })

  // Count total logins
  const totalLogins = activityLogs?.filter(log => log.activity_type === 'login').length || 0

  // Get comprehensive metrics for each business
  const businessesWithMetrics = await Promise.all(
    (businesses || []).map(async (business) => {
      // Get analytics events
      const { data: analyticsEvents } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('business_id', business.id)

      const pageViews = analyticsEvents?.filter(e => e.event_type === 'page_view') || []
      const totalPageViews = pageViews.length
      const uniqueVisitors = new Set(pageViews.map(e => e.visitor_id)).size

      const deviceBreakdown = {
        mobile: analyticsEvents?.filter(e => e.device_type === 'mobile').length || 0,
        desktop: analyticsEvents?.filter(e => e.device_type === 'desktop').length || 0,
        tablet: analyticsEvents?.filter(e => e.device_type === 'tablet').length || 0,
      }

      // Get conversion funnel
      const { data: funnels } = await supabase
        .from('conversion_funnels')
        .select('*')
        .eq('business_id', business.id)

      const formStarts = funnels?.filter(f => f.started_form).length || 0
      const formSubmissions = funnels?.filter(f => f.submitted_form).length || 0
      const conversionRate = totalPageViews > 0 ? Math.round((formSubmissions / totalPageViews) * 1000) / 10 : 0

      // Get queue metrics
      const { data: queueEntries } = await supabase
        .from('queue_entries')
        .select('status, party_size, estimated_wait_time')
        .eq('business_id', business.id)

      const total_queue_entries = queueEntries?.length || 0
      const queue_completed = queueEntries?.filter(q => q.status === 'completed').length || 0
      const queue_cancelled = queueEntries?.filter(q => q.status === 'cancelled').length || 0
      const queue_no_show = queueEntries?.filter(q => q.status === 'no_show').length || 0
      const queue_waiting = queueEntries?.filter(q => q.status === 'waiting').length || 0

      const waitTimes = queueEntries?.filter(q => q.estimated_wait_time).map(q => q.estimated_wait_time) || []
      const avg_wait_time = waitTimes.length > 0
        ? Math.round(waitTimes.reduce((sum: number, time: number) => sum + time, 0) / waitTimes.length)
        : 0

      const completion_rate = total_queue_entries > 0
        ? Math.round((queue_completed / total_queue_entries) * 1000) / 10
        : 0

      // Get reservation metrics
      const { data: reservations } = await supabase
        .from('reservations')
        .select('status, party_size')
        .eq('business_id', business.id)

      const total_reservations = reservations?.length || 0
      const confirmed_reservations = reservations?.filter(r => r.status === 'confirmed').length || 0
      const pending_reservations = reservations?.filter(r => r.status === 'pending').length || 0
      const canceled_reservations = reservations?.filter(r => r.status === 'cancelled').length || 0
      const no_show_reservations = reservations?.filter(r => r.status === 'no_show').length || 0

      const confirmation_rate = total_reservations > 0
        ? Math.round((confirmed_reservations / total_reservations) * 1000) / 10
        : 0

      // Calculate average party size
      const allPartySizes = [
        ...(queueEntries?.map(q => q.party_size) || []),
        ...(reservations?.map(r => r.party_size) || [])
      ]
      const avg_party_size = allPartySizes.length > 0
        ? Math.round(allPartySizes.reduce((sum, size) => sum + size, 0) / allPartySizes.length * 10) / 10
        : 0

      return {
        ...business,
        metrics: {
          totalPageViews,
          uniqueVisitors,
          deviceBreakdown,
          conversionRate,
          formStarts,
          formSubmissions,
          total_queue_entries,
          queue_completed,
          queue_cancelled,
          queue_no_show,
          queue_waiting,
          avg_wait_time,
          completion_rate,
          total_reservations,
          confirmed_reservations,
          pending_reservations,
          canceled_reservations,
          no_show_reservations,
          confirmation_rate,
          avg_party_size
        }
      }
    })
  )

  const createdAt = businesses?.[0]?.created_at || new Date().toISOString()

  return {
    success: true,
    data: {
      userId,
      email: email || 'N/A',
      createdAt,
      lastActivity,
      totalLogins,
      activityLogs: activityLogs || [],
      businesses: businessesWithMetrics
    } as DetailedUserData
  }
}

/**
 * Get activity summary for a user
 */
export async function getUserActivitySummary(userId: string) {
  await requireSuperAdmin()

  const supabase = await createClient()

  const { data: activities } = await supabase
    .from('user_activity')
    .select('activity_type, created_at')
    .eq('user_id', userId)

  if (!activities || activities.length === 0) {
    return {
      success: true,
      data: {
        totalActivities: 0,
        activitiesLast7Days: 0,
        activitiesLast30Days: 0,
        activityByType: {}
      }
    }
  }

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const activitiesLast7Days = activities.filter(a => new Date(a.created_at) >= sevenDaysAgo).length
  const activitiesLast30Days = activities.filter(a => new Date(a.created_at) >= thirtyDaysAgo).length

  const activityByType = activities.reduce((acc, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    success: true,
    data: {
      totalActivities: activities.length,
      activitiesLast7Days,
      activitiesLast30Days,
      activityByType
    }
  }
}
