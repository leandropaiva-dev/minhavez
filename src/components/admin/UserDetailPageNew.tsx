'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, User, Activity, BarChart3, CreditCard, Gift, Calendar, Mail, Phone, Check, X, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { getUserDetailedInfo, type DetailedUserData } from '@/lib/admin/user-details'
import { getBusinessAnalytics, type ComprehensiveAnalytics } from '@/lib/analytics/get-analytics'

interface UserDetailPageNewProps {
  userId: string
}

export default function UserDetailPageNew({ userId }: UserDetailPageNewProps) {
  const [userDetails, setUserDetails] = useState<DetailedUserData | null>(null)
  const [businessAnalytics, setBusinessAnalytics] = useState<Record<string, ComprehensiveAnalytics>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'profile' | 'metrics' | 'activity' | 'subscription'>('profile')
  const [selectedBusiness, setSelectedBusiness] = useState<string | null>(null)

  useEffect(() => {
    loadAllData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function loadAllData() {
    setLoading(true)

    const [detailsResult] = await Promise.all([
      getUserDetailedInfo(userId)
    ])

    if (detailsResult.success && detailsResult.data) {
      setUserDetails(detailsResult.data as DetailedUserData)

      // Select first business by default
      if (!selectedBusiness && detailsResult.data.businesses.length > 0) {
        setSelectedBusiness(detailsResult.data.businesses[0].id)
      }

      // Load analytics for all businesses
      const analytics: Record<string, ComprehensiveAnalytics> = {}
      for (const business of detailsResult.data.businesses) {
        const analyticsResult = await getBusinessAnalytics(business.id, '30d')
        if (analyticsResult.success && analyticsResult.data) {
          analytics[business.id] = analyticsResult.data
        }
      }

      setBusinessAnalytics(analytics)
    }

    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!userDetails) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">Usuário não encontrado</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {userDetails.avatarUrl ? (
                <img
                  src={userDetails.avatarUrl}
                  alt={userDetails.name || 'User'}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                  {userDetails.name || 'Usuário sem nome'}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400">{userDetails.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    userDetails.hasActiveSubscription
                      ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                  }`}>
                    {userDetails.hasActiveSubscription ? (
                      <>
                        <Check className="w-3 h-3" />
                        Assinatura Ativa
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" />
                        Sem Assinatura
                      </>
                    )}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {userDetails.businesses.length} negócio(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-6 border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Informações do Perfil
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'metrics'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Métricas
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'subscription'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4 inline mr-2" />
            Assinaturas
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'activity'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4 inline mr-2" />
            Atividades
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'profile' && (
          <ProfileTab userDetails={userDetails} />
        )}

        {activeTab === 'metrics' && (
          <MetricsTab
            userDetails={userDetails}
            businessAnalytics={businessAnalytics}
            selectedBusiness={selectedBusiness}
            setSelectedBusiness={setSelectedBusiness}
          />
        )}

        {activeTab === 'subscription' && (
          <SubscriptionTab userDetails={userDetails} />
        )}

        {activeTab === 'activity' && (
          <ActivityTab userDetails={userDetails} />
        )}
      </div>
    </div>
  )
}

// Profile Tab Component
function ProfileTab({ userDetails }: { userDetails: DetailedUserData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Personal Information */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Dados Pessoais
        </h3>
        <div className="space-y-3">
          <InfoRow label="Nome" value={userDetails.name || 'Não informado'} />
          <InfoRow label="Email" value={userDetails.email} icon={<Mail className="w-4 h-4" />} />
          <InfoRow
            label="Email Verificado"
            value={userDetails.emailConfirmedAt ? 'Sim' : 'Não'}
            badge={userDetails.emailConfirmedAt ? 'success' : 'warning'}
          />
          <InfoRow label="Telefone" value={userDetails.phone || 'Não informado'} icon={<Phone className="w-4 h-4" />} />
          <InfoRow
            label="Telefone Verificado"
            value={userDetails.phoneConfirmedAt ? 'Sim' : 'Não'}
            badge={userDetails.phoneConfirmedAt ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Informações da Conta
        </h3>
        <div className="space-y-3">
          <InfoRow label="ID do Usuário" value={userDetails.userId} />
          <InfoRow label="Cadastrado em" value={new Date(userDetails.createdAt).toLocaleString('pt-BR')} />
          <InfoRow label="Último Login" value={userDetails.lastSignInAt ? new Date(userDetails.lastSignInAt).toLocaleString('pt-BR') : 'Nunca'} />
          <InfoRow label="Total de Logins" value={userDetails.totalLogins.toString()} />
          <InfoRow label="Última Atividade" value={userDetails.lastActivity || 'Nenhuma'} />
        </div>
      </div>

      {/* Businesses */}
      <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Negócios</h3>
        <div className="grid gap-4">
          {userDetails.businesses.map((business) => (
            <div key={business.id} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-zinc-900 dark:text-white">{business.name}</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">@{business.slug}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    <span>{business.business_type}</span>
                    <span>•</span>
                    <span>{business.country}</span>
                    {business.city && (
                      <>
                        <span>•</span>
                        <span>{business.city}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  business.subscription_status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : business.subscription_status === 'trial'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                }`}>
                  {business.subscription_status}
                </span>
              </div>
              {business.trial_ends_at && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  Trial termina em: {new Date(business.trial_ends_at).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coupons Used */}
      {userDetails.couponsUsed.length > 0 && (
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Cupons Utilizados
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="text-left py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Código</th>
                  <th className="text-left py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Negócio</th>
                  <th className="text-left py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Data</th>
                  <th className="text-right py-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">Benefício</th>
                </tr>
              </thead>
              <tbody>
                {userDetails.couponsUsed.map((coupon, i) => (
                  <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-3 font-mono text-sm">{coupon.code}</td>
                    <td className="py-3 text-sm">{coupon.businessName}</td>
                    <td className="py-3 text-sm text-zinc-500 dark:text-zinc-400">
                      {new Date(coupon.redeemedAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 text-sm text-right">
                      {coupon.trialDaysAdded
                        ? `+${coupon.trialDaysAdded} dias de trial`
                        : coupon.discountApplied
                        ? `${coupon.discountApplied}% desconto`
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// Metrics Tab Component (continuação no próximo arquivo)
function MetricsTab({
  userDetails,
  selectedBusiness,
  setSelectedBusiness
}: {
  userDetails: DetailedUserData
  businessAnalytics: Record<string, ComprehensiveAnalytics>
  selectedBusiness: string | null
  setSelectedBusiness: (id: string) => void
}) {
  if (userDetails.businesses.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-12 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">Nenhum negócio encontrado</p>
      </div>
    )
  }

  const selectedBusinessData = userDetails.businesses.find(b => b.id === selectedBusiness)

  return (
    <div className="space-y-6">
      {/* Business Selector */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex gap-2 flex-wrap">
          {userDetails.businesses.map((business) => (
            <button
              key={business.id}
              onClick={() => setSelectedBusiness(business.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedBusiness === business.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {business.name}
            </button>
          ))}
        </div>
      </div>

      {selectedBusinessData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metrics Cards */}
          <MetricCard
            title="Visualizações"
            value={selectedBusinessData.metrics.totalPageViews}
            icon={<TrendingUp className="w-5 h-5" />}
            color="purple"
          />
          <MetricCard
            title="Visitantes Únicos"
            value={selectedBusinessData.metrics.uniqueVisitors}
            icon={<User className="w-5 h-5" />}
            color="blue"
          />
          <MetricCard
            title="Taxa de Conversão"
            value={`${selectedBusinessData.metrics.conversionRate}%`}
            icon={<TrendingUp className="w-5 h-5" />}
            color="green"
          />
          <MetricCard
            title="Submissões"
            value={selectedBusinessData.metrics.formSubmissions}
            icon={<Check className="w-5 h-5" />}
            color="pink"
          />
        </div>
      )}

      {/* Queue & Reservation Metrics */}
      {selectedBusinessData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Queue Metrics */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Métricas de Fila</h3>
            <div className="space-y-3">
              <MetricRow label="Total de Entradas" value={selectedBusinessData.metrics.total_queue_entries} />
              <MetricRow label="Completadas" value={selectedBusinessData.metrics.queue_completed} badge="success" />
              <MetricRow label="Canceladas" value={selectedBusinessData.metrics.queue_cancelled} badge="error" />
              <MetricRow label="No-show" value={selectedBusinessData.metrics.queue_no_show} badge="warning" />
              <MetricRow label="Aguardando" value={selectedBusinessData.metrics.queue_waiting} badge="info" />
              <MetricRow label="Tempo Médio de Espera" value={`${selectedBusinessData.metrics.avg_wait_time} min`} />
              <MetricRow label="Taxa de Conclusão" value={`${selectedBusinessData.metrics.completion_rate}%`} />
            </div>
          </div>

          {/* Reservation Metrics */}
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Métricas de Reservas</h3>
            <div className="space-y-3">
              <MetricRow label="Total de Reservas" value={selectedBusinessData.metrics.total_reservations} />
              <MetricRow label="Confirmadas" value={selectedBusinessData.metrics.confirmed_reservations} badge="success" />
              <MetricRow label="Pendentes" value={selectedBusinessData.metrics.pending_reservations} badge="warning" />
              <MetricRow label="Canceladas" value={selectedBusinessData.metrics.canceled_reservations} badge="error" />
              <MetricRow label="No-show" value={selectedBusinessData.metrics.no_show_reservations} badge="error" />
              <MetricRow label="Taxa de Confirmação" value={`${selectedBusinessData.metrics.confirmation_rate}%`} />
              <MetricRow label="Tamanho Médio do Grupo" value={selectedBusinessData.metrics.avg_party_size} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Subscription Tab
function SubscriptionTab({ userDetails }: { userDetails: DetailedUserData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Histórico de Assinaturas</h3>
        <div className="space-y-4">
          {userDetails.subscriptionHistory.map((sub, i) => (
            <div key={i} className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-zinc-900 dark:text-white">{sub.businessName}</h4>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Início: {new Date(sub.startDate).toLocaleDateString('pt-BR')}
                  </p>
                  {sub.endDate && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      Fim: {new Date(sub.endDate).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  sub.status === 'active'
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : sub.status === 'trial'
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'
                }`}>
                  {sub.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Activity Tab
function ActivityTab({ userDetails }: { userDetails: DetailedUserData }) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Atividades Recentes</h3>
      <div className="space-y-2">
        {userDetails.activityLogs.map((log) => (
          <div key={log.id} className="p-3 border-l-4 border-purple-500 bg-zinc-50 dark:bg-zinc-800/50 rounded">
            <div className="flex items-center justify-between">
              <span className="font-medium text-zinc-900 dark:text-white">{log.activity_type}</span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {new Date(log.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper Components
function InfoRow({ label, value, icon, badge }: {
  label: string
  value: string
  icon?: React.ReactNode
  badge?: 'success' | 'warning' | 'error'
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/50">
      <span className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-medium ${
        badge === 'success' ? 'text-green-600 dark:text-green-400' :
        badge === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
        badge === 'error' ? 'text-red-600 dark:text-red-400' :
        'text-zinc-900 dark:text-white'
      }`}>
        {value}
      </span>
    </div>
  )
}

function MetricCard({ title, value, icon, color }: {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'purple' | 'blue' | 'green' | 'pink'
}) {
  const colorClasses = {
    purple: 'from-purple-600 to-purple-700',
    blue: 'from-blue-600 to-blue-700',
    green: 'from-green-600 to-green-700',
    pink: 'from-pink-600 to-pink-700',
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className={`w-10 h-10 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{title}</p>
      <p className="text-3xl font-bold text-zinc-900 dark:text-white mt-1">{value}</p>
    </div>
  )
}

function MetricRow({ label, value, badge }: {
  label: string
  value: string | number
  badge?: 'success' | 'warning' | 'error' | 'info'
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-zinc-600 dark:text-zinc-400">{label}</span>
      <span className={`text-sm font-semibold ${
        badge === 'success' ? 'text-green-600 dark:text-green-400' :
        badge === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
        badge === 'error' ? 'text-red-600 dark:text-red-400' :
        badge === 'info' ? 'text-blue-600 dark:text-blue-400' :
        'text-zinc-900 dark:text-white'
      }`}>
        {value}
      </span>
    </div>
  )
}
