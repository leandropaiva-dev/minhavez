'use client'

import { useEffect, useState } from 'react'
import RealtimeMetrics from './RealtimeMetrics'
import AnalyticsChart from './AnalyticsChart'
import GoalsPanel from './GoalsPanel'
import QRCodeCard from './QRCodeCard'
import ReservationLinkCard from './ReservationLinkCard'
import { createClient } from '@/lib/supabase/client'

interface DynamicDashboardProps {
  businessId?: string
  businessName?: string
  queueStats: {
    currentQueue: number
    todayAttended: number
    avgWaitTime: number
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  queueEntries?: any[]
}

export default function DynamicDashboard({
  businessId,
  businessName,
  queueStats,
}: DynamicDashboardProps) {
  const [todayReservations, setTodayReservations] = useState(0)

  useEffect(() => {
    const fetchTodayReservations = async () => {
      if (!businessId) return

      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('reservations')
        .select('id', { count: 'exact' })
        .eq('business_id', businessId)
        .eq('reservation_date', today)

      if (!error && data) {
        setTodayReservations(data.length)
      }
    }

    fetchTodayReservations()
  }, [businessId])

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Row 1: Metrics with Real-time Updates */}
      <div data-tutorial="metrics">
        <RealtimeMetrics
          businessId={businessId || ''}
          initialStats={queueStats}
          todayReservations={todayReservations}
        />
      </div>

      {/* Row 2: Analytics (full width) */}
      <div data-tutorial="analytics">
        <AnalyticsChart businessId={businessId || ''} />
      </div>

      {/* Row 3: QR Codes + Goals in desktop (3 columns), stacked in mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div data-tutorial="qr-code">
          <QRCodeCard
            businessId={businessId || 'default'}
            businessName={businessName || 'Organizy'}
          />
        </div>
        <div data-tutorial="reservation-link">
          <ReservationLinkCard
            businessId={businessId || 'default'}
            businessName={businessName || 'Organizy'}
          />
        </div>
        <div>
          <GoalsPanel businessId={businessId || ''} />
        </div>
      </div>
    </div>
  )
}
