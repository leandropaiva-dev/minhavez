'use client'

import { useEffect } from 'react'
import { trackPageView, trackFormInteraction } from '@/lib/analytics/track'

interface PageTrackerProps {
  businessId: string
  pageType: 'queue' | 'reservation' | 'links'
  pagePath?: string
}

export default function PageTracker({ businessId, pageType, pagePath }: PageTrackerProps) {
  useEffect(() => {
    // Track page view
    trackPageView(businessId, pagePath)

    // Track form view for conversion funnel
    const formType = pageType === 'links' ? 'link' : pageType
    trackFormInteraction(businessId, formType, 'view')
  }, [businessId, pageType, pagePath])

  return null // This component doesn't render anything
}
