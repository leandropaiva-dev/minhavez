'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight } from 'react-feather'
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

interface Professional {
  id: string
  name: string
  description?: string | null
  photo_url?: string | null
}

interface ReservationConfig {
  requiresProfessional: boolean
  requiresPayment: boolean
}

interface ReservationFormData {
  customer_name: string
  customer_email: string
  customer_phone: string
  selected_service: string | null
  selected_professional: string | null
  reservation_date: string
  reservation_time: string
  notes: string
}

interface MultiStepReservationFormProps {
  businessId: string
  businessName: string
  services: Service[]
  professionals?: Professional[]
  config: ReservationConfig
  onSubmit: (data: ReservationFormData) => Promise<void>
}

export default function MultiStepReservationForm({
  services,
  professionals = [],
  config,
  onSubmit,
}: MultiStepReservationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ReservationFormData>({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    selected_service: null,
    selected_professional: null,
    reservation_date: '',
    reservation_time: '',
    notes: '',
  })

  // Define quais passos mostrar baseado na config
  const totalSteps = 3 + (config.requiresProfessional && professionals.length > 0 ? 1 : 0)

  const getStepLabel = (step: number) => {
    if (step === 1) return 'Dados'
    if (step === 2) return 'Serviços'
    if (config.requiresProfessional && professionals.length > 0) {
      if (step === 3) return 'Profissional & Data'
      if (step === 4) return 'Confirmação'
    } else {
      if (step === 3) return 'Data & Hora'
      if (step === 4) return 'Confirmação'
    }
    return ''
  }

  const steps = Array.from({ length: totalSteps }, (_, i) => ({
    number: i + 1,
    label: getStepLabel(i + 1),
    completed: i + 1 < currentStep,
    current: i + 1 === currentStep,
  }))

  const canProceed = () => {
    if (currentStep === 1) {
      return formData.customer_name && formData.customer_email && formData.customer_phone
    }
    if (currentStep === 2) {
      return formData.selected_service
    }
    if (currentStep === 3) {
      if (config.requiresProfessional && professionals.length > 0) {
        return formData.selected_professional
      }
      return formData.reservation_date && formData.reservation_time
    }
    return true
  }

  const handleNext = () => {
    if (canProceed() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    await onSubmit(formData)
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
                Precisamos desses dados para confirmar sua reserva
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nome Completo *
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
                Email *
              </label>
              <input
                type="email"
                value={formData.customer_email}
                onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seuemail@exemplo.com"
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
          </div>
        )}

        {/* Step 2: Serviços */}
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

        {/* Step 3: Profissional (se necessário) ou Data/Hora */}
        {currentStep === 3 && (
          <div className="space-y-4">
            {config.requiresProfessional && professionals.length > 0 ? (
              <>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Escolha o Profissional
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Selecione quem vai te atender
                  </p>
                </div>

                <div className="space-y-3">
                  {professionals.map((professional) => (
                    <button
                      key={professional.id}
                      onClick={() => setFormData({ ...formData, selected_professional: professional.id })}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                        formData.selected_professional === professional.id
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {professional.photo_url ? (
                          <img src={professional.photo_url} alt={professional.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-2xl font-bold">
                            {professional.name[0]}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-white">{professional.name}</h3>
                        {professional.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">{professional.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div>
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                    Data & Horário
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Escolha quando deseja ser atendido
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Data *
                  </label>
                  <input
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Horário *
                  </label>
                  <input
                    type="time"
                    value={formData.reservation_time}
                    onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                    className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>
        )}

        {/* Step 4: Data/Hora (se tiver profissional) ou Confirmação */}
        {currentStep === 4 && config.requiresProfessional && professionals.length > 0 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Data & Horário
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Escolha quando deseja ser atendido
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Data *
              </label>
              <input
                type="date"
                value={formData.reservation_date}
                onChange={(e) => setFormData({ ...formData, reservation_date: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Horário *
              </label>
              <input
                type="time"
                value={formData.reservation_time}
                onChange={(e) => setFormData({ ...formData, reservation_time: e.target.value })}
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Step Final: Confirmação */}
        {currentStep === totalSteps && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                Confirme sua Reserva
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Revise os dados antes de confirmar
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Nome</p>
                <p className="font-medium text-zinc-900 dark:text-white">{formData.customer_name}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Serviço</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {services.find(s => s.id === formData.selected_service)?.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Data e Hora</p>
                <p className="font-medium text-zinc-900 dark:text-white">
                  {formData.reservation_date} às {formData.reservation_time}
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
                className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

          {currentStep < totalSteps ? (
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
              className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Confirmar Reserva
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
