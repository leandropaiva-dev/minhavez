'use client'

import { CreditCard, Calendar, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaymentManagerProps {
  subscriptionStatus: string
  trialEndsAt: string | null
  stripeCustomerId: string | null
}

export default function PaymentManager({
  subscriptionStatus,
  trialEndsAt,
}: PaymentManagerProps) {
  const getStatusInfo = () => {
    switch (subscriptionStatus) {
      case 'trial':
        return {
          label: 'Teste Gratuito',
          color: 'text-blue-500',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20',
          icon: <Clock className="w-5 h-5" />,
        }
      case 'active':
        return {
          label: 'Ativo',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          icon: <CheckCircle className="w-5 h-5" />,
        }
      case 'canceled':
        return {
          label: 'Cancelado',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          icon: <AlertTriangle className="w-5 h-5" />,
        }
      case 'past_due':
        return {
          label: 'Pagamento Pendente',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          icon: <AlertTriangle className="w-5 h-5" />,
        }
      default:
        return {
          label: 'Desconhecido',
          color: 'text-zinc-500',
          bgColor: 'bg-zinc-500/10',
          borderColor: 'border-zinc-500/20',
          icon: <CreditCard className="w-5 h-5" />,
        }
    }
  }

  const statusInfo = getStatusInfo()

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const getDaysRemaining = () => {
    if (!trialEndsAt) return 0
    const now = new Date()
    const end = new Date(trialEndsAt)
    const diff = end.getTime() - now.getTime()
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const daysRemaining = getDaysRemaining()

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <div className={`${statusInfo.bgColor} border ${statusInfo.borderColor} rounded-xl p-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${statusInfo.color}`}>
              {statusInfo.icon}
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Status da Assinatura</p>
              <p className={`text-xl font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
            </div>
          </div>
          {subscriptionStatus === 'trial' && (
            <div className="text-right">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Dias restantes</p>
              <p className="text-3xl font-bold text-blue-500">{daysRemaining}</p>
            </div>
          )}
        </div>
      </div>

      {/* Plan Details */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Detalhes do Plano
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">Plano Atual</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {subscriptionStatus === 'trial' ? 'Trial (14 dias)' : 'Pro'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-500 dark:text-zinc-400">Valor</span>
            <span className="font-medium text-zinc-900 dark:text-white">
              {subscriptionStatus === 'trial' ? 'Gratuito' : 'R$ 49,90/mês'}
            </span>
          </div>

          {subscriptionStatus === 'trial' && trialEndsAt && (
            <div className="flex items-center justify-between py-3 border-b border-zinc-200 dark:border-zinc-800">
              <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Trial expira em
              </span>
              <span className="font-medium text-zinc-900 dark:text-white">
                {formatDate(trialEndsAt)}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-3">
            <span className="text-zinc-500 dark:text-zinc-400">Recursos</span>
            <span className="font-medium text-zinc-900 dark:text-white">Todos liberados</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Ações
        </h3>

        <div className="space-y-3">
          {subscriptionStatus === 'trial' && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <CreditCard className="w-4 h-4" />
              Assinar Plano Pro - R$ 49,90/mês
            </Button>
          )}

          {subscriptionStatus === 'active' && (
            <>
              <Button variant="outline" className="w-full gap-2">
                <ExternalLink className="w-4 h-4" />
                Gerenciar Assinatura
              </Button>
              <Button variant="outline" className="w-full gap-2 text-red-500 border-red-500/20 hover:bg-red-500/10">
                Cancelar Assinatura
              </Button>
            </>
          )}

          {subscriptionStatus === 'canceled' && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 gap-2">
              <CreditCard className="w-4 h-4" />
              Reativar Assinatura
            </Button>
          )}

          {subscriptionStatus === 'past_due' && (
            <Button className="w-full bg-yellow-600 hover:bg-yellow-700 gap-2">
              <CreditCard className="w-4 h-4" />
              Atualizar Forma de Pagamento
            </Button>
          )}
        </div>
      </div>

      {/* Invoice History Placeholder */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
          Histórico de Faturas
        </h3>

        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Nenhuma fatura disponível</p>
          <p className="text-sm mt-1">Suas faturas aparecerão aqui após a primeira cobrança</p>
        </div>
      </div>
    </div>
  )
}
