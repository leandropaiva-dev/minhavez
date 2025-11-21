'use client'

import { useEffect, useState } from 'react'
import RealtimeMetrics from './RealtimeMetrics'
import AnalyticsChart from './AnalyticsChart'
import GoalsPanel from './GoalsPanel'
import QuickActions from './QuickActions'
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
      <RealtimeMetrics
        businessId={businessId || ''}
        initialStats={queueStats}
        todayReservations={todayReservations}
      />

      {/* Row 2: Analytics (2/3) + Goals (1/3) in desktop, stacked in mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div className="lg:col-span-2">
          <AnalyticsChart businessId={businessId || ''} />
        </div>
        <div>
          <GoalsPanel businessId={businessId || ''} />
        </div>
      </div>

      {/* Row 3: QR Codes (2/3) + Quick Actions (1/3) in desktop, stacked in mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        <div>
          <QRCodeCard
            businessId={businessId || 'default'}
            businessName={businessName || 'MinhaVez'}
          />
        </div>
        <div>
          <ReservationLinkCard
            businessId={businessId || 'default'}
            businessName={businessName || 'MinhaVez'}
          />
        </div>
        <div>
          <QuickActions businessId={businessId || ''} />
        </div>
      </div>
    </div>
  )
}
