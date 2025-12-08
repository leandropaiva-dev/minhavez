'use client'

import { createClient } from '@/lib/supabase/client'

// Generate or get visitor ID (stored in localStorage)
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  let visitorId = localStorage.getItem('visitor_id')
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`
    localStorage.setItem('visitor_id', visitorId)
  }
  return visitorId
}

// Generate or get session ID (stored in sessionStorage)
function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = sessionStorage.getItem('session_id')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    sessionStorage.setItem('session_id', sessionId)
  }
  return sessionId
}

// Detect device type
function getDeviceType(): string {
  if (typeof window === 'undefined') return 'unknown'

  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile'
  }
  return 'desktop'
}

export interface TrackEventParams {
  businessId: string
  eventType: string
  eventCategory: string
  pagePath?: string
  metadata?: Record<string, unknown>
}

/**
 * Track analytics event
 */
export async function trackEvent({
  businessId,
  eventType,
  eventCategory,
  pagePath,
  metadata
}: TrackEventParams) {
  if (typeof window === 'undefined') return

  const supabase = createClient()

  const visitorId = getVisitorId()
  const sessionId = getSessionId()
  const deviceType = getDeviceType()
  const userAgent = navigator.userAgent
  const referrer = document.referrer || null

  try {
    await supabase.rpc('track_analytics_event', {
      p_business_id: businessId,
      p_event_type: eventType,
      p_event_category: eventCategory,
      p_page_path: pagePath || window.location.pathname,
      p_session_id: sessionId,
      p_visitor_id: visitorId,
      p_user_agent: userAgent,
      p_referrer: referrer,
      p_device_type: deviceType,
      p_metadata: metadata ? JSON.stringify(metadata) : null
    })
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Analytics tracking error:', error)
  }
}

/**
 * Track page view
 */
export async function trackPageView(businessId: string, pagePath?: string) {
  await trackEvent({
    businessId,
    eventType: 'page_view',
    eventCategory: 'navigation',
    pagePath: pagePath || window.location.pathname
  })
}

/**
 * Track form interaction
 */
export async function trackFormInteraction(
  businessId: string,
  formType: 'queue' | 'reservation' | 'link',
  action: 'view' | 'start' | 'submit',
  metadata?: Record<string, unknown>
) {
  await trackEvent({
    businessId,
    eventType: `form_${action}`,
    eventCategory: 'conversion',
    pagePath: window.location.pathname,
    metadata: {
      formType,
      ...metadata
    }
  })

  // Update conversion funnel
  const supabase = createClient()
  const visitorId = getVisitorId()
  const sessionId = getSessionId()

  try {
    const updateData: Record<string, boolean | string> = {}

    if (action === 'view') {
      updateData.viewed_page = true
      updateData.viewed_page_at = new Date().toISOString()
    } else if (action === 'start') {
      updateData.started_form = true
      updateData.started_form_at = new Date().toISOString()
    } else if (action === 'submit') {
      updateData.submitted_form = true
      updateData.submitted_form_at = new Date().toISOString()
    }

    await supabase
      .from('conversion_funnels')
      .upsert({
        business_id: businessId,
        visitor_id: visitorId,
        session_id: sessionId,
        form_type: formType,
        ...updateData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'business_id,visitor_id,session_id,form_type'
      })
  } catch (error) {
    console.error('Funnel tracking error:', error)
  }
}

/**
 * Track link click
 */
export async function trackLinkClick(businessId: string, linkUrl: string, linkTitle?: string) {
  await trackEvent({
    businessId,
    eventType: 'link_click',
    eventCategory: 'engagement',
    metadata: {
      linkUrl,
      linkTitle
    }
  })
}
