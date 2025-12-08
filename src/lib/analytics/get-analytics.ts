'use server'

import { createClient } from '@/lib/supabase/server'

export interface ComprehensiveAnalytics {
  // Page views
  totalPageViews: number
  uniqueVisitors: number
  pageViewsByPath: Record<string, number>

  // Device breakdown
  deviceBreakdown: {
    mobile: number
    desktop: number
    tablet: number
  }

  // Conversion funnel
  conversionFunnel: {
    totalViews: number
    formStarts: number
    formSubmissions: number
    conversionRate: number
    abandonmentRate: number
  }

  // Queue metrics
  queueMetrics: {
    total: number
    completed: number
    cancelled: number
    noShow: number
    waiting: number
    avgWaitTime: number
    completionRate: number
  }

  // Reservation metrics
  reservationMetrics: {
    total: number
    confirmed: number
    pending: number
    cancelled: number
    noShow: number
    confirmationRate: number
  }

  // Link page metrics
  linkMetrics: {
    totalViews: number
    totalClicks: number
    clickThroughRate: number
    topLinks: Array<{
      url: string
      clicks: number
    }>
  }

  // Time-based trends
  dailyTrend: Array<{
    date: string
    views: number
    visitors: number
    conversions: number
  }>

  // Popular times
  popularHours: Record<number, number> // hour -> count
  popularDays: Record<string, number> // day name -> count
}

/**
 * Get comprehensive analytics for a business
 */
export async function getBusinessAnalytics(
  businessId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<{ success: boolean; data?: ComprehensiveAnalytics; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if user owns this business or is super admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: business } = await supabase
      .from('businesses')
      .select('user_id')
      .eq('id', businessId)
      .single()

    const { data: isSuperAdmin } = await supabase.rpc('is_super_admin')

    if (!business || (business.user_id !== user.id && !isSuperAdmin)) {
      return { success: false, error: 'Access denied' }
    }

    // Build date filter
    let dateFilter = supabase
      .from('analytics_events')
      .select('*')
      .eq('business_id', businessId)

    if (dateFrom) {
      dateFilter = dateFilter.gte('created_at', dateFrom)
    }
    if (dateTo) {
      dateFilter = dateFilter.lte('created_at', dateTo)
    }

    const { data: analyticsEvents } = await dateFilter

    // Get queue entries
    let queueFilter = supabase
      .from('queue_entries')
      .select('*')
      .eq('business_id', businessId)

    if (dateFrom) queueFilter = queueFilter.gte('created_at', dateFrom)
    if (dateTo) queueFilter = queueFilter.lte('created_at', dateTo)

    const { data: queueEntries } = await queueFilter

    // Get reservations
    let reservationFilter = supabase
      .from('reservations')
      .select('*')
      .eq('business_id', businessId)

    if (dateFrom) reservationFilter = reservationFilter.gte('created_at', dateFrom)
    if (dateTo) reservationFilter = reservationFilter.lte('created_at', dateTo)

    const { data: reservations } = await reservationFilter

    // Get conversion funnels
    let funnelFilter = supabase
      .from('conversion_funnels')
      .select('*')
      .eq('business_id', businessId)

    if (dateFrom) funnelFilter = funnelFilter.gte('created_at', dateFrom)
    if (dateTo) funnelFilter = funnelFilter.lte('created_at', dateTo)

    const { data: funnels } = await funnelFilter

    // Process analytics
    const pageViews = analyticsEvents?.filter(e => e.event_type === 'page_view') || []
    const linkClicks = analyticsEvents?.filter(e => e.event_type === 'link_click') || []

    const totalPageViews = pageViews.length
    const uniqueVisitors = new Set(pageViews.map(e => e.visitor_id)).size

    // Page views by path
    const pageViewsByPath: Record<string, number> = {}
    pageViews.forEach(event => {
      const path = event.page_path || 'unknown'
      pageViewsByPath[path] = (pageViewsByPath[path] || 0) + 1
    })

    // Device breakdown
    const deviceBreakdown = {
      mobile: analyticsEvents?.filter(e => e.device_type === 'mobile').length || 0,
      desktop: analyticsEvents?.filter(e => e.device_type === 'desktop').length || 0,
      tablet: analyticsEvents?.filter(e => e.device_type === 'tablet').length || 0,
    }

    // Conversion funnel
    const totalViews = funnels?.filter(f => f.viewed_page).length || 0
    const formStarts = funnels?.filter(f => f.started_form).length || 0
    const formSubmissions = funnels?.filter(f => f.submitted_form).length || 0
    const conversionRate = totalViews > 0 ? (formSubmissions / totalViews) * 100 : 0
    const abandonmentRate = formStarts > 0 ? ((formStarts - formSubmissions) / formStarts) * 100 : 0

    // Queue metrics
    const queueTotal = queueEntries?.length || 0
    const queueCompleted = queueEntries?.filter(q => q.status === 'completed').length || 0
    const queueCancelled = queueEntries?.filter(q => q.status === 'cancelled').length || 0
    const queueNoShow = queueEntries?.filter(q => q.status === 'no_show').length || 0
    const queueWaiting = queueEntries?.filter(q => q.status === 'waiting').length || 0

    const waitTimes = queueEntries?.filter(q => q.estimated_wait_time).map(q => q.estimated_wait_time) || []
    const avgWaitTime = waitTimes.length > 0
      ? waitTimes.reduce((sum, time) => sum + time, 0) / waitTimes.length
      : 0

    const completionRate = queueTotal > 0 ? (queueCompleted / queueTotal) * 100 : 0

    // Reservation metrics
    const reservationTotal = reservations?.length || 0
    const reservationConfirmed = reservations?.filter(r => r.status === 'confirmed').length || 0
    const reservationPending = reservations?.filter(r => r.status === 'pending').length || 0
    const reservationCancelled = reservations?.filter(r => r.status === 'cancelled').length || 0
    const reservationNoShow = reservations?.filter(r => r.status === 'no_show').length || 0
    const confirmationRate = reservationTotal > 0 ? (reservationConfirmed / reservationTotal) * 100 : 0

    // Link metrics
    const linkViews = pageViews.filter(e => e.page_path?.includes('/links')).length
    const totalLinkClicks = linkClicks.length
    const clickThroughRate = linkViews > 0 ? (totalLinkClicks / linkViews) * 100 : 0

    // Top links
    const linkClickCounts: Record<string, number> = {}
    linkClicks.forEach(click => {
      const url = click.metadata?.linkUrl || 'unknown'
      linkClickCounts[url] = (linkClickCounts[url] || 0) + 1
    })
    const topLinks = Object.entries(linkClickCounts)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10)

    // Daily trend
    const dailyData: Record<string, { views: number; visitors: Set<string>; conversions: number }> = {}
    pageViews.forEach(event => {
      const date = new Date(event.created_at).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { views: 0, visitors: new Set(), conversions: 0 }
      }
      dailyData[date].views++
      dailyData[date].visitors.add(event.visitor_id)
    })

    funnels?.filter(f => f.submitted_form).forEach(funnel => {
      const date = new Date(funnel.submitted_form_at!).toISOString().split('T')[0]
      if (dailyData[date]) {
        dailyData[date].conversions++
      }
    })

    const dailyTrend = Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        views: data.views,
        visitors: data.visitors.size,
        conversions: data.conversions
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Popular hours and days
    const popularHours: Record<number, number> = {}
    const popularDays: Record<string, number> = {}

    pageViews.forEach(event => {
      const date = new Date(event.created_at)
      const hour = date.getHours()
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'long' })

      popularHours[hour] = (popularHours[hour] || 0) + 1
      popularDays[dayName] = (popularDays[dayName] || 0) + 1
    })

    return {
      success: true,
      data: {
        totalPageViews,
        uniqueVisitors,
        pageViewsByPath,
        deviceBreakdown,
        conversionFunnel: {
          totalViews,
          formStarts,
          formSubmissions,
          conversionRate: Math.round(conversionRate * 10) / 10,
          abandonmentRate: Math.round(abandonmentRate * 10) / 10,
        },
        queueMetrics: {
          total: queueTotal,
          completed: queueCompleted,
          cancelled: queueCancelled,
          noShow: queueNoShow,
          waiting: queueWaiting,
          avgWaitTime: Math.round(avgWaitTime),
          completionRate: Math.round(completionRate * 10) / 10,
        },
        reservationMetrics: {
          total: reservationTotal,
          confirmed: reservationConfirmed,
          pending: reservationPending,
          cancelled: reservationCancelled,
          noShow: reservationNoShow,
          confirmationRate: Math.round(confirmationRate * 10) / 10,
        },
        linkMetrics: {
          totalViews: linkViews,
          totalClicks: totalLinkClicks,
          clickThroughRate: Math.round(clickThroughRate * 10) / 10,
          topLinks,
        },
        dailyTrend,
        popularHours,
        popularDays,
      }
    }
  } catch (error: unknown) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
