'use client'

import * as Icons from 'react-feather'
import type { DashboardMetric } from '@/types/config.types'

interface SegmentMetricsProps {
  metrics: DashboardMetric[]
  realData: Record<string, number | string>
}

export default function SegmentMetrics({ metrics, realData }: SegmentMetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        // @ts-expect-error - Dynamic icon loading
        const Icon = Icons[metric.icon] || Icons.Activity
        const value = realData[metric.id] ?? 0

        // Format value based on type
        let displayValue: string | number = value
        if (metric.type === 'time' && typeof value === 'number') {
          displayValue = `${value}min`
        } else if (metric.type === 'currency' && typeof value === 'number') {
          displayValue = `€${value.toLocaleString()}`
        } else if (metric.type === 'percentage' && typeof value === 'number') {
          displayValue = `${value}%`
        }

        return (
          <div
            key={metric.id}
            className="relative group bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/5"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-start justify-between mb-3 sm:mb-4">
                <div className="p-2 bg-zinc-950 border border-zinc-800 rounded-lg">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                </div>
              </div>

              <div>
                <p className="text-zinc-400 text-xs sm:text-sm mb-1">
                  {metric.label}
                </p>
                <p className="text-white text-2xl sm:text-3xl font-bold break-words">
                  {displayValue}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
