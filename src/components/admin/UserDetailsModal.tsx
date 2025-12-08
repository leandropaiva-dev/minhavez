'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Activity, TrendingUp, Clock, Building2 } from 'lucide-react'
import { getUserDetailedInfo, getUserActivitySummary, type DetailedUserData } from '@/lib/admin/user-details'

interface UserDetailsModalProps {
  userId: string
  onClose: () => void
}

export default function UserDetailsModal({ userId, onClose }: UserDetailsModalProps) {
  const [userDetails, setUserDetails] = useState<DetailedUserData | null>(null)
  const [activitySummary, setActivitySummary] = useState<{
    totalActivities?: number
    activitiesLast7Days?: number
    activitiesLast30Days?: number
    activityByType?: Record<string, number>
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'metrics'>('overview')

  useEffect(() => {
    loadUserDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadUserDetails() {
    setLoading(true)
    const [detailsResult, summaryResult] = await Promise.all([
      getUserDetailedInfo(userId),
      getUserActivitySummary(userId)
    ])

    if (detailsResult.success && detailsResult.data) {
      setUserDetails(detailsResult.data as DetailedUserData)
    }

    if (summaryResult.success && summaryResult.data) {
      setActivitySummary(summaryResult.data)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!userDetails) {
    return null
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login': return '🔐'
      case 'logout': return '🚪'
      case 'create_queue': return '📝'
      case 'create_reservation': return '📅'
      case 'update_profile': return '👤'
      default: return '📌'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 max-w-6xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 p-6 rounded-t-xl z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {userDetails.email[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {userDetails.email}
                </h2>
                <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Cadastro: {new Date(userDetails.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  {userDetails.lastActivity && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Última atividade: {new Date(userDetails.lastActivity).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-zinc-500" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Visão Geral
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'activity'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Atividades ({userDetails.activityLogs.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              Métricas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                    <Building2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Estabelecimentos</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                    {userDetails.businesses.length}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-2">
                    <Activity className="w-5 h-5" />
                    <span className="text-sm font-medium">Total de Atividades</span>
                  </div>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                    {activitySummary?.totalActivities || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-medium">Últimos 7 dias</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                    {activitySummary?.activitiesLast7Days || 0}
                  </p>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 p-4 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-2">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-medium">Logins</span>
                  </div>
                  <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                    {userDetails.totalLogins}
                  </p>
                </div>
              </div>

              {/* Businesses List */}
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                  Estabelecimentos
                </h3>
                <div className="space-y-3">
                  {userDetails.businesses.map((business) => {
                    const trialEndsAt = business.trial_ends_at ? new Date(business.trial_ends_at) : null
                    const isTrialExpired = trialEndsAt && trialEndsAt < new Date()

                    return (
                      <div
                        key={business.id}
                        className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-zinc-900 dark:text-white">
                              {business.name}
                            </h4>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 capitalize mt-1">
                              {business.business_type}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                business.subscription_status === 'active'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : business.subscription_status === 'trial'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {business.subscription_status === 'active' ? 'Ativo' : business.subscription_status === 'trial' ? 'Trial' : 'Cancelado'}
                              </span>
                              {trialEndsAt && (
                                <span className={`text-xs ${isTrialExpired ? 'text-red-600 dark:text-red-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                  Trial: {trialEndsAt.toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-zinc-400">
                            Criado em {new Date(business.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              {userDetails.activityLogs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
                  Nenhuma atividade registrada
                </div>
              ) : (
                <div className="space-y-2">
                  {userDetails.activityLogs.map((log) => (
                    <div
                      key={log.id}
                      className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 border border-zinc-200 dark:border-zinc-700"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="text-2xl">{getActivityIcon(log.activity_type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-zinc-900 dark:text-white capitalize">
                              {log.activity_type.replace(/_/g, ' ')}
                            </p>
                            {log.details && (
                              <details className="mt-1">
                                <summary className="text-sm text-purple-600 dark:text-purple-400 cursor-pointer hover:underline">
                                  Ver detalhes
                                </summary>
                                <pre className="mt-2 text-xs bg-zinc-100 dark:bg-zinc-900 p-2 rounded overflow-auto">
                                  {JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Metrics Tab */}
          {activeTab === 'metrics' && (
            <div className="space-y-6">
              {userDetails.businesses.map((business) => {
                const m = business.metrics
                const hasAnyData = m.totalPageViews > 0 || m.total_queue_entries > 0 || m.total_reservations > 0

                return (
                  <div key={business.id}>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
                      {business.name}
                    </h3>

                    {!hasAnyData ? (
                      <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-8 text-center text-zinc-500 dark:text-zinc-400">
                        Nenhuma atividade registrada ainda
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Traffic & Analytics */}
                        {m.totalPageViews > 0 && (
                          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 rounded-lg p-6 border border-emerald-200 dark:border-emerald-800">
                            <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
                              <span className="text-2xl">📊</span>
                              Tráfego & Visitantes
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Page Views</p>
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                                  {m.totalPageViews}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Visitantes Únicos</p>
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                                  {m.uniqueVisitors}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Mobile</p>
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                                  {m.deviceBreakdown.mobile}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Desktop</p>
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                                  {m.deviceBreakdown.desktop}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-emerald-700 dark:text-emerald-300">Tablet</p>
                                <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">
                                  {m.deviceBreakdown.tablet}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Conversion Funnel */}
                        {(m.formStarts > 0 || m.formSubmissions > 0) && (
                          <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 rounded-lg p-6 border border-amber-200 dark:border-amber-800">
                            <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-4 flex items-center gap-2">
                              <span className="text-2xl">🎯</span>
                              Funil de Conversão
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Formulários Iniciados</p>
                                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                                  {m.formStarts}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Formulários Enviados</p>
                                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                                  {m.formSubmissions}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-amber-700 dark:text-amber-300">Taxa de Conversão</p>
                                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                                  {m.conversionRate}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Queue Metrics */}
                        {m.total_queue_entries > 0 && (
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg p-6 border border-blue-200 dark:border-blue-800">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                              <span className="text-2xl">🎫</span>
                              Filas de Espera
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Total</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                  {m.total_queue_entries}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300">Atendidos</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                                  {m.queue_completed}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-yellow-700 dark:text-yellow-300">Aguardando</p>
                                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-1">
                                  {m.queue_waiting}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-orange-700 dark:text-orange-300">Cancelados</p>
                                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                                  {m.queue_cancelled}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-300">No-show</p>
                                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">
                                  {m.queue_no_show}
                                </p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-blue-200 dark:border-blue-700">
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Tempo Médio de Espera</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                  {m.avg_wait_time} min
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Taxa de Conclusão</p>
                                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                  {m.completion_rate}%
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reservation Metrics */}
                        {m.total_reservations > 0 && (
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg p-6 border border-purple-200 dark:border-purple-800">
                            <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-4 flex items-center gap-2">
                              <span className="text-2xl">📅</span>
                              Reservas
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                              <div>
                                <p className="text-xs text-purple-700 dark:text-purple-300">Total</p>
                                <p className="text-3xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                                  {m.total_reservations}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-green-700 dark:text-green-300">Confirmadas</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-1">
                                  {m.confirmed_reservations}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-blue-700 dark:text-blue-300">Pendentes</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                                  {m.pending_reservations}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-orange-700 dark:text-orange-300">Canceladas</p>
                                <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mt-1">
                                  {m.canceled_reservations}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-red-700 dark:text-red-300">No-show</p>
                                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-1">
                                  {m.no_show_reservations}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* General Stats */}
                        <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 rounded-lg p-6 border border-zinc-200 dark:border-zinc-700">
                          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <span className="text-2xl">📈</span>
                            Estatísticas Gerais
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">Tamanho Médio do Grupo</p>
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                                {m.avg_party_size} pessoas
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-zinc-600 dark:text-zinc-400">Taxa de Confirmação (Reservas)</p>
                              <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">
                                {m.confirmation_rate}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
