'use client'

import { useEffect, useState } from 'react'
import SegmentMetrics from './SegmentMetrics'
import QuickActionsPanel from './QuickActionsPanel'
import RecentQueue from './RecentQueue'
import MonthlyChart from './MonthlyChart'
import MonthlyTarget from './MonthlyTarget'
import QRCodeCard from './QRCodeCard'
import { getCurrentBusinessSegment } from '@/lib/config/storage'
import { DASHBOARD_CONFIGS } from '@/lib/config/dashboard-configs'

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
  queueEntries = [],
}: DynamicDashboardProps) {
  const [config, setConfig] = useState(DASHBOARD_CONFIGS.outro)

  useEffect(() => {
    const segment = getCurrentBusinessSegment()
    setConfig(DASHBOARD_CONFIGS[segment])
    console.log('DynamicDashboard - businessId:', businessId, 'businessName:', businessName, 'entries:', queueEntries.length)
  }, [businessId, businessName, queueEntries])

  // Map real data to metrics
  const metricsData: Record<string, number | string> = {
    queue_count: queueStats.currentQueue,
    patients_waiting: queueStats.currentQueue,
    clients_waiting: queueStats.currentQueue,
    served_today: queueStats.todayAttended,
    appointments_today: queueStats.todayAttended,
    reservations_today: queueStats.todayAttended,
    sessions_today: queueStats.todayAttended,
    avg_wait_time: queueStats.avgWaitTime,
    avg_service_time: queueStats.avgWaitTime,
    tables_occupied: 0, // Mock - can be calculated later
    doctors_available: 1, // Mock
    chairs_occupied: 0, // Mock
    stations_occupied: 0, // Mock
    active_services: 0, // Mock
    completed_sessions: queueStats.todayAttended,
  }

  return (
    <div className="space-y-6">
      {/* Segment-specific Metrics */}
      <SegmentMetrics metrics={config.metrics} realData={metricsData} />

      {/* Charts and Actions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <MonthlyChart />
          <QuickActionsPanel actions={config.quickActions} />
        </div>
        <div className="space-y-4 lg:space-y-6">
          <MonthlyTarget
            percentage={75.55}
            target={20000}
            revenue={20000}
            today={3287}
          />
          <QRCodeCard
            businessId={businessId || 'default'}
            businessName={businessName || 'MinhaVez'}
          />
        </div>
      </div>

      {/* Recent Queue with Real-time Updates */}
      <RecentQueue entries={queueEntries} businessId={businessId || ''} />
    </div>
  )
}
