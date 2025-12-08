'use client'

import { useEffect } from 'react'
import { trackPageView } from './track'

/**
 * Hook to automatically track page views
 */
export function usePageTracking(businessId: string, pagePath?: string) {
  useEffect(() => {
    if (businessId) {
      trackPageView(businessId, pagePath)
    }
  }, [businessId, pagePath])
}
