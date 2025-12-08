'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, TrendingUp, TrendingDown, Calendar, Users, Activity } from 'lucide-react'
import Link from 'next/link'
import { getUserDetailedInfo, getUserActivitySummary, type DetailedUserData } from '@/lib/admin/user-details'
import { getBusinessAnalytics, type ComprehensiveAnalytics } from '@/lib/analytics/get-analytics'
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts'

interface UserDetailPageProps {
  userId: string
}

const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

export default function UserDetailPage({ userId }: UserDetailPageProps) {
  const [userDetails, setUserDetails] = useState<DetailedUserData | null>(null)
  const [businessAnalytics, setBusinessAnalytics] = useState<Record<string, ComprehensiveAnalytics>>({})
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, selectedPeriod])

  async function loadAllData() {
    setLoading(true)

    const [detailsResult] = await Promise.all([
      getUserDetailedInfo(userId),
      getUserActivitySummary(userId)
    ])

    if (detailsResult.success && detailsResult.data) {
      setUserDetails(detailsResult.data as DetailedUserData)

      // Select first business by default
      if (!selectedBusiness && detailsResult.data.businesses.length > 0) {
        setSelectedBusiness(detailsResult.data.businesses[0].id)
      }

      // Load analytics for each business
      const analytics: Record<string, ComprehensiveAnalytics> = {}

      const dateFrom = getDateFrom(selectedPeriod)

      for (const business of detailsResult.data.businesses) {
        const analyticsResult = await getBusinessAnalytics(business.id, dateFrom)
        if (analyticsResult.success && analyticsResult.data) {
          analytics[business.id] = analyticsResult.data
        }
      }

      setBusinessAnalytics(analytics)
    }

    setLoading(false)
  }

  function getDateFrom(period: string): string {
    const now = new Date()
    switch (period) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(0).toISOString()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!userDetails) {
    return <div className="text-center py-12">Usuário não encontrado</div>
  }

  const currentBusiness = userDetails.businesses.find(b => b.id === selectedBusiness)
  const currentAnalytics = selectedBusiness ? businessAnalytics[selectedBusiness] : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/usuarios"
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
              {userDetails.email}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">
              Cadastrado em {new Date(userDetails.createdAt).toLocaleDateString('pt-BR')}
              {userDetails.lastActivity && (
                <> • Última atividade: {new Date(userDetails.lastActivity).toLocaleString('pt-BR')}</>
              )}
            </p>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {period === '7d' ? '7 dias' : period === '30d' ? '30 dias' : period === '90d' ? '90 dias' : 'Tudo'}
            </button>
          ))}
        </div>
      </div>

      {/* Business Selector */}
      {userDetails.businesses.length > 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Selecionar Estabelecimento
          </label>
          <select
            value={selectedBusiness || ''}
            onChange={(e) => setSelectedBusiness(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
          >
            {userDetails.businesses.map(business => (
              <option key={business.id} value={business.id}>
                {business.name} ({business.business_type})
              </option>
            ))}
          </select>
        </div>
      )}

      {currentBusiness && currentAnalytics && (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Visitas"
              value={currentAnalytics.totalPageViews}
              icon={<Activity className="w-5 h-5" />}
              color="purple"
              change={calculateChange(currentAnalytics.dailyTrend, 'views')}
            />
            <StatCard
              title="Visitantes Únicos"
              value={currentAnalytics.uniqueVisitors}
              icon={<Users className="w-5 h-5" />}
              color="blue"
              change={calculateChange(currentAnalytics.dailyTrend, 'visitors')}
            />
            <StatCard
              title="Taxa de Conversão"
              value={`${currentAnalytics.conversionFunnel.conversionRate}%`}
              icon={<TrendingUp className="w-5 h-5" />}
              color="green"
            />
            <StatCard
              title="Total de Conversões"
              value={currentAnalytics.conversionFunnel.formSubmissions}
              icon={<Calendar className="w-5 h-5" />}
              color="pink"
              change={calculateChange(currentAnalytics.dailyTrend, 'conversions')}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Visits Trend */}
            <ChartCard title="Tendência de Visitas" subtitle={`Últimos ${selectedPeriod === '7d' ? '7' : selectedPeriod === '30d' ? '30' : '90'} dias`}>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentAnalytics.dailyTrend}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="date"
                    stroke="#9ca3af"
                    tick={{ fill: '#9ca3af' }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                  />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#f3f4f6' }}
                  />
                  <Area type="monotone" dataKey="views" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Device Breakdown */}
            <ChartCard title="Dispositivos" subtitle="Distribuição por tipo">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Mobile', value: currentAnalytics.deviceBreakdown.mobile },
                      { name: 'Desktop', value: currentAnalytics.deviceBreakdown.desktop },
                      { name: 'Tablet', value: currentAnalytics.deviceBreakdown.tablet },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Conversion Funnel */}
            <ChartCard title="Funil de Conversão" subtitle="Do acesso até a conversão">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { step: 'Visitas', value: currentAnalytics.totalPageViews, fill: '#8b5cf6' },
                  { step: 'Formulários Iniciados', value: currentAnalytics.conversionFunnel.formStarts, fill: '#ec4899' },
                  { step: 'Conversões', value: currentAnalytics.conversionFunnel.formSubmissions, fill: '#10b981' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="step" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Popular Hours */}
            <ChartCard title="Horários Populares" subtitle="Acesso por hora do dia">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(currentAnalytics.popularHours).map(([hour, count]) => ({
                  hour: `${hour}h`,
                  acessos: count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                  <Bar dataKey="acessos" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Detailed Metrics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Queue Metrics */}
            {currentAnalytics.queueMetrics.total > 0 && (
              <MetricsCard
                title="Métricas de Fila"
                icon="🎫"
                metrics={[
                  { label: 'Total de Entradas', value: currentAnalytics.queueMetrics.total },
                  { label: 'Atendidos', value: currentAnalytics.queueMetrics.completed, color: 'text-green-600' },
                  { label: 'Aguardando', value: currentAnalytics.queueMetrics.waiting, color: 'text-yellow-600' },
                  { label: 'Cancelados', value: currentAnalytics.queueMetrics.cancelled, color: 'text-orange-600' },
                  { label: 'No-show', value: currentAnalytics.queueMetrics.noShow, color: 'text-red-600' },
                  { label: 'Tempo Médio de Espera', value: `${currentAnalytics.queueMetrics.avgWaitTime} min`, color: 'text-blue-600' },
                  { label: 'Taxa de Conclusão', value: `${currentAnalytics.queueMetrics.completionRate}%`, color: 'text-purple-600' },
                ]}
              />
            )}

            {/* Reservation Metrics */}
            {currentAnalytics.reservationMetrics.total > 0 && (
              <MetricsCard
                title="Métricas de Reservas"
                icon="📅"
                metrics={[
                  { label: 'Total de Reservas', value: currentAnalytics.reservationMetrics.total },
                  { label: 'Confirmadas', value: currentAnalytics.reservationMetrics.confirmed, color: 'text-green-600' },
                  { label: 'Pendentes', value: currentAnalytics.reservationMetrics.pending, color: 'text-yellow-600' },
                  { label: 'Canceladas', value: currentAnalytics.reservationMetrics.cancelled, color: 'text-orange-600' },
                  { label: 'No-show', value: currentAnalytics.reservationMetrics.noShow, color: 'text-red-600' },
                  { label: 'Taxa de Confirmação', value: `${currentAnalytics.reservationMetrics.confirmationRate}%`, color: 'text-purple-600' },
                ]}
              />
            )}

            {/* Link Metrics */}
            {currentAnalytics.linkMetrics.totalViews > 0 && (
              <MetricsCard
                title="Métricas de Links"
                icon="🔗"
                metrics={[
                  { label: 'Visualizações', value: currentAnalytics.linkMetrics.totalViews },
                  { label: 'Total de Cliques', value: currentAnalytics.linkMetrics.totalClicks },
                  { label: 'CTR', value: `${currentAnalytics.linkMetrics.clickThroughRate}%`, color: 'text-purple-600' },
                ]}
              />
            )}
          </div>

          {/* Top Links */}
          {currentAnalytics.linkMetrics.topLinks.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                Links Mais Clicados
              </h3>
              <div className="space-y-2">
                {currentAnalytics.linkMetrics.topLinks.slice(0, 10).map((link, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">
                      {link.url}
                    </span>
                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 ml-4">
                      {link.clicks} cliques
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Days */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Dias da Semana Mais Populares
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {Object.entries(currentAnalytics.popularDays).map(([day, count]) => (
                <div key={day} className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 capitalize">{day}</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{count}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper Components
function StatCard({ title, value, icon, color, change }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'green' | 'pink'
  change?: number
}) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    pink: 'from-pink-600 to-pink-700',
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white`}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
    </div>
  )
}

function ChartCard({ title, subtitle, children }: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">{title}</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

function MetricsCard({ title, icon, metrics }: {
  title: string
  icon: string
  metrics: Array<{ label: string; value: string | number; color?: string }>
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      <div className="space-y-3">
        {metrics.map((metric, index: number) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">{metric.label}</span>
            <span className={`text-sm font-semibold ${metric.color || 'text-zinc-900 dark:text-white'}`}>
              {metric.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function calculateChange(dailyTrend: Array<{ date: string; views: number; visitors: number; conversions: number }>, metric: 'views' | 'visitors' | 'conversions'): number | undefined {
  if (!dailyTrend || dailyTrend.length < 2) return undefined

  const recent = dailyTrend.slice(-7)
  const previous = dailyTrend.slice(-14, -7)

  if (recent.length === 0 || previous.length === 0) return undefined

  const recentSum = recent.reduce((sum, day) => sum + day[metric], 0)
  const previousSum = previous.reduce((sum, day) => sum + day[metric], 0)

  if (previousSum === 0) return undefined

  return Math.round(((recentSum - previousSum) / previousSum) * 100)
}
