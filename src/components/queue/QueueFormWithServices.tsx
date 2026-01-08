'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle } from 'react-feather'
import Stepper from '@/components/public/Stepper'
import ServiceCard from '@/components/public/ServiceCard'
import PhoneInput from '@/components/ui/phone-input'

interface Service {
  id: string
  name: string
  description?: string | null
  photo_url: string
  price_cents?: number | null
  estimated_duration_minutes?: number | null
}

interface QueueFormData {
  customer_name: string
  customer_phone: string
  selected_service: string | null
  party_size: number
  notes: string
}

interface QueueFormWithServicesProps {
  businessId: string
  businessName: string
  services: Service[]
  onSubmit: (data: QueueFormData) => Promise<void>
}

export default function QueueFormWithServices({
  services,
  onSubmit,
}: QueueFormWithServicesProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<QueueFormData>({
    customer_name: '',
    customer_phone: '',
    selected_service: null,
    party_size: 1,
    notes: '',
  })

  const steps = [
    { number: 1, label: 'Dados', completed: currentStep > 1, current: currentStep === 1 },
    { number: 2, label: 'Serviço', completed: currentStep > 2, current: currentStep === 2 },
    { number: 3, label: 'Confirmação', completed: false, current: currentStep === 3 },
  ]

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.customer_name && formData.customer_phone && formData.party_size
    }
    if (currentStep === 2) {
      return formData.selected_service
    }
    return true
  }

  const handleNext = () => {
    if (canProceed() && currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Error submitting:', error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stepper */}
      <Stepper steps={steps} />

      {/* Step Content */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8">
        {/* Step 1: Dados */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Suas Informações
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Precisamos desses dados para te chamar quando chegar sua vez
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nome *
              </label>
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Telefone *
              </label>
              <PhoneInput
                value={formData.customer_phone}
                onChange={(value) => setFormData({ ...formData, customer_phone: value })}
                required
                defaultCountry="PT"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Quantas pessoas? *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.party_size}
                onChange={(e) => setFormData({ ...formData, party_size: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step 2: Serviço */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Escolha o Serviço
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Selecione o serviço desejado
              </p>
            </div>

            <div className="space-y-3">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  description={service.description}
                  photoUrl={service.photo_url}
                  price={service.price_cents}
                  duration={service.estimated_duration_minutes}
                  selected={formData.selected_service === service.id}
                  onClick={() => setFormData({ ...formData, selected_service: service.id })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirmação */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Confirme sua Entrada
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Revise os dados antes de entrar na fila
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Nome</p>
                <p className="font-medium text-zinc-900 dark:text-white">{formData.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Telefone</p>
                <p className="font-medium text-zinc-900 dark:text-white">{formData.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Pessoas</p>
                <p className="font-medium text-zinc-900 dark:text-white">{formData.party_size}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Serviço</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {services.find(s => s.id === formData.selected_service)?.name}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Observações (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Alguma informação adicional?"
              />
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Entrar na Fila
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
