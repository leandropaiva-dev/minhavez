'use client'

import { Button } from '@/components/ui/button'
import { CreditCard, Check } from 'lucide-react'

interface PaymentStepProps {
  onNext: () => void
  onBack: () => void
}

export default function PaymentStep({ onNext, onBack }: PaymentStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Pagamento</h2>
        <p className="text-zinc-400">
          Configure sua forma de pagamento
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="border-2 border-blue-600 rounded-xl p-8 bg-gradient-to-br from-blue-950/20 to-purple-950/20 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20">
            <CreditCard className="w-8 h-8 text-blue-500" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              Integração Stripe em Breve
            </h3>
            <p className="text-zinc-400">
              Estamos preparando a integração com o Stripe para processar seus
              pagamentos de forma segura.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Por enquanto, você tem:
            </h4>
            <ul className="space-y-3 text-left">
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                14 dias de trial gratuito
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                Acesso completo a todas as funcionalidades
              </li>
              <li className="flex items-center gap-3 text-zinc-300">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                Sem necessidade de cartão de crédito
              </li>
            </ul>
          </div>

          <p className="text-zinc-500 text-sm">
            Você receberá um email quando o sistema de pagamentos estiver
            disponível
          </p>
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">
          Voltar
        </Button>
        <Button onClick={onNext} className="flex-1">
          Finalizar e Ir para Dashboard
        </Button>
      </div>
    </div>
  )
}
