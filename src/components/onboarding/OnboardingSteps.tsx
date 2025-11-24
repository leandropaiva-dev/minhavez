'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Briefcase, CheckCircle, AlertCircle } from 'react-feather'
import { saveBusinessInfo, completeOnboarding } from '@/lib/onboarding/actions'

interface User {
  email?: string
  user_metadata?: {
    name?: string
  }
}

interface OnboardingStepsProps {
  user: User
}

export default function OnboardingSteps({ user }: OnboardingStepsProps) {
  const [step, setStep] = useState(1)

  // Form data
  const [businessName, setBusinessName] = useState('')
  const [businessType, setBusinessType] = useState<'restaurante' | 'bar' | 'clinica' | 'barbearia' | 'outro' | ''>('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSaveBusinessInfo = async () => {
    setLoading(true)
    setError('')

    if (!businessType) {
      setError('Tipo de negócio é obrigatório')
      setLoading(false)
      return false
    }

    const result = await saveBusinessInfo({
      name: businessName,
      businessType: businessType as 'restaurante' | 'bar' | 'clinica' | 'barbearia' | 'outro',
      phone,
      address,
      country: 'BR',
    })

    setLoading(false)

    if (result.error) {
      setError(result.error)
      return false
    }

    return true
  }

  const handleContinueToPayment = async () => {
    const saved = await handleSaveBusinessInfo()
    if (saved) {
      setStep(3)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    const result = await completeOnboarding()

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-zinc-400">Passo {step} de 3</span>
          <span className="text-sm text-zinc-400">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Welcome */}
      {step === 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Bem-vindo ao MinhaVez
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8">
            Olá, <span className="text-white font-semibold">{user.user_metadata?.name || user.email}</span>!
            <br />
            Vamos configurar sua conta em 3 passos simples.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <Briefcase className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">1. Seu Negócio</h3>
              <p className="text-sm text-zinc-400">Configure as informações básicas</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <CreditCard className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">2. Pagamento</h3>
              <p className="text-sm text-zinc-400">14 dias grátis, cancele quando quiser</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6">
              <CheckCircle className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <h3 className="font-semibold text-white mb-2">3. Pronto!</h3>
              <p className="text-sm text-zinc-400">Comece a gerenciar filas</p>
            </div>
          </div>

          <Button
            onClick={() => setStep(2)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Começar
          </Button>
        </div>
      )}

      {/* Step 2: Business Info */}
      {step === 2 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Configure seu Negócio
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8">
            Conte-nos um pouco sobre seu estabelecimento
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Nome do Estabelecimento *
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ex: Restaurante Sabor da Casa"
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Tipo de Negócio *
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value as 'restaurante' | 'bar' | 'clinica' | 'barbearia' | 'outro' | '')}
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="">Selecione...</option>
                <option value="restaurante">Restaurante</option>
                <option value="bar">Bar</option>
                <option value="clinica">Clínica</option>
                <option value="barbearia">Barbearia</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Telefone *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+351 912 345 678"
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Endereço (Opcional)
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Rua, número, cidade"
                className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => setStep(1)}
              variant="outline"
              className="flex-1 border-zinc-700 text-white"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              onClick={handleContinueToPayment}
              disabled={!businessName || !businessType || !phone || loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Continuar'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Método de Pagamento
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mb-6 sm:mb-8">
            Adicione um cartão para começar seu teste grátis de 14 dias
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div className="bg-blue-600/10 border border-blue-600/20 rounded-xl p-4 mb-6">
            <p className="text-blue-400 text-sm">
              ✨ Você não será cobrado nos próximos 14 dias. Cancele a qualquer momento.
            </p>
          </div>

          {/* Stripe Payment Form Placeholder */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Número do Cartão
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Validade
                  </label>
                  <input
                    type="text"
                    placeholder="MM/AA"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    placeholder="123"
                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Nome no Cartão
                </label>
                <input
                  type="text"
                  placeholder="João Silva"
                  className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-sm text-zinc-500">
              <CreditCard className="w-4 h-4" />
              <span>Pagamento seguro processado por Stripe</span>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => {
                setError('')
                setStep(2)
              }}
              variant="outline"
              className="flex-1 border-zinc-700 text-white"
              disabled={loading}
            >
              Voltar
            </Button>
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {loading ? 'Processando...' : 'Começar Teste Grátis'}
            </Button>
          </div>

          <p className="text-xs text-zinc-500 text-center mt-6">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos" target="_blank" className="text-blue-500 hover:text-blue-400">
              Termos de Uso
            </a>
          </p>
        </div>
      )}
    </div>
  )
}
