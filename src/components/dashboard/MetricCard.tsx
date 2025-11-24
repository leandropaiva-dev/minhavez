'use client'

import { Users, Clock, TrendingUp } from 'react-feather'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  iconName: 'users' | 'clock' | 'trending-up'
  trend?: {
    value: number
    isPositive: boolean
  }
  subtitle?: string
}

const iconMap = {
  'users': Users,
  'clock': Clock,
  'trending-up': TrendingUp,
}

export default function MetricCard({
  title,
  value,
  iconName,
  trend,
  subtitle,
}: MetricCardProps) {
  const Icon = iconMap[iconName]
  return (
    <div className="relative group">
      {/* Blur effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 sm:p-6 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/5">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <div className="p-2 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs sm:text-sm font-medium',
                trend.isPositive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.isPositive ? '↑' : '↓'}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>

        <div>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm mb-1">{title}</p>
          <p className="text-zinc-900 dark:text-white text-2xl sm:text-3xl font-bold mb-1 break-words">{value}</p>
          {subtitle && <p className="text-zinc-400 dark:text-zinc-500 text-xs truncate">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
