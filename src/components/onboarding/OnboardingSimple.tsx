'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, AlertCircle, Clock, Users, Calendar } from 'react-feather'
import { detectCountry, getCountryConfig, type Country } from '@/lib/utils/country-detection'
import { formatPhone } from '@/lib/utils/document-validation'
import { completeSimpleOnboarding } from '@/lib/onboarding/actions'

const STEPS = [
  { id: 0, label: 'Seu negócio' },
  { id: 1, label: 'Como atende' },
  { id: 2, label: 'Pronto!' },
]

type ServiceMode = 'queue' | 'reservation' | 'both'
type Segment = 'health' | 'food' | 'beauty'

const SEGMENTS = [
  {
    value: 'health' as const,
    label: 'Saúde, bem-estar, clínicas e consultórios',
  },
  {
    value: 'food' as const,
    label: 'Restaurantes, bares e cafés',
  },
  {
    value: 'beauty' as const,
    label: 'Estética, barbearia e beleza',
  },
]

export default function OnboardingSimple() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1: Business Info
  const [country, setCountry] = useState<Country>('BR')
  const [isDetectingCountry, setIsDetectingCountry] = useState(true)
  const [businessName, setBusinessName] = useState('')
  const [phone, setPhone] = useState('')
  const [segment, setSegment] = useState<Segment | ''>('')

  // Step 2: Service Config
  const [avgServiceTime, setAvgServiceTime] = useState('30')
  const [serviceMode, setServiceMode] = useState<ServiceMode>('queue')

  // Auto-detect country on mount
  useEffect(() => {
    detectCountry().then((result) => {
      setCountry(result.country)
      setIsDetectingCountry(false)
    })
  }, [])

  const config = getCountryConfig(country)

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value, country)
    setPhone(formatted)
  }

  const handleStep1Next = () => {
    if (!businessName.trim()) {
      setError('Nome do negócio é obrigatório')
      return
    }
    if (!phone.trim()) {
      setError('Telefone é obrigatório')
      return
    }
    if (!segment) {
      setError('Selecione o segmento do seu negócio')
      return
    }
    setError('')
    setCurrentStep(1)
  }

  const handleStep2Next = () => {
    if (!avgServiceTime || parseInt(avgServiceTime) <= 0) {
      setError('Tempo médio de atendimento inválido')
      return
    }
    setError('')
    setCurrentStep(2)
  }

  const handleComplete = async () => {
    setLoading(true)
    setError('')

    const result = await completeSimpleOnboarding({
      businessName,
      phone,
      country,
      segment: segment as Segment,
      avgServiceTime: parseInt(avgServiceTime),
      serviceMode,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    // Redirect to dashboard
    router.push('/dashboard')
  }

  if (isDetectingCountry) {
    return (
      <div className="min-h-screen bg-black py-8 px-4 flex items-center justify-center">
        <div className="text-zinc-400">Detectando sua localização...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -translate-y-1/2 -z-10" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 -z-10 transition-all duration-500"
              style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
            />

            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep

              return (
                <div key={step.id} className="flex flex-col items-center relative">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isCompleted
                        ? 'bg-blue-600 border-blue-600'
                        : isCurrent
                          ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-600/20'
                          : 'bg-zinc-900 border-zinc-700'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-white' : 'text-zinc-500'
                        }`}
                      >
                        {index + 1}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm font-medium ${
                      isCurrent ? 'text-white' : 'text-zinc-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Business Info */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Seu negócio
                </h2>
                <p className="text-zinc-400">
                  Vamos começar com o básico
                </p>
              </div>

              {/* Country Auto-Detected */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">
                  {config.flag} Detectamos que você está em: <span className="font-semibold text-white">{config.name}</span>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="segment" className="text-zinc-300">
                    Segmento do negócio *
                  </Label>
                  <Select
                    value={segment}
                    onValueChange={(value) => setSegment(value as Segment)}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Selecione o segmento" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEGMENTS.map((seg) => (
                        <SelectItem key={seg.value} value={seg.value}>
                          {seg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="businessName" className="text-zinc-300">
                    Nome do negócio *
                  </Label>
                  <Input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ex: Restaurante Sabor & Cia"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-zinc-300">
                    Telefone *
                  </Label>
                  <div className="relative mt-2">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 text-sm">
                      {config.phonePrefix}
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      placeholder={config.phonePlaceholder}
                      className="pl-16"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={handleStep1Next}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Service Config */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Como você atende?
                </h2>
                <p className="text-zinc-400">
                  Configure como seus clientes serão atendidos
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="avgServiceTime" className="text-zinc-300">
                    Tempo médio de atendimento (minutos) *
                  </Label>
                  <div className="relative mt-2">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                    <Input
                      id="avgServiceTime"
                      type="number"
                      min="1"
                      value={avgServiceTime}
                      onChange={(e) => setAvgServiceTime(e.target.value)}
                      placeholder="30"
                      className="pl-11"
                    />
                  </div>
                  <p className="text-xs text-zinc-500 mt-1">
                    Quanto tempo em média você leva para atender cada cliente?
                  </p>
                </div>

                <div>
                  <Label className="text-zinc-300 mb-3 block">
                    Modo de atendimento *
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setServiceMode('queue')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        serviceMode === 'queue'
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <Users className={`w-8 h-8 mx-auto mb-2 ${serviceMode === 'queue' ? 'text-blue-400' : 'text-zinc-400'}`} />
                      <div className="text-sm font-semibold text-white">Fila</div>
                      <div className="text-xs text-zinc-400 mt-1">Ordem de chegada</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceMode('reservation')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        serviceMode === 'reservation'
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <Calendar className={`w-8 h-8 mx-auto mb-2 ${serviceMode === 'reservation' ? 'text-blue-400' : 'text-zinc-400'}`} />
                      <div className="text-sm font-semibold text-white">Reserva</div>
                      <div className="text-xs text-zinc-400 mt-1">Agendamento</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setServiceMode('both')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        serviceMode === 'both'
                          ? 'border-blue-600 bg-blue-600/10'
                          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Users className={`w-6 h-6 ${serviceMode === 'both' ? 'text-blue-400' : 'text-zinc-400'}`} />
                        <Calendar className={`w-6 h-6 ${serviceMode === 'both' ? 'text-blue-400' : 'text-zinc-400'}`} />
                      </div>
                      <div className="text-sm font-semibold text-white">Ambos</div>
                      <div className="text-xs text-zinc-400 mt-1">Fila + Reserva</div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(0)}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleStep2Next}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Completion */}
          {currentStep === 2 && (
            <div className="space-y-6 text-center">
              <div>
                <div className="w-20 h-20 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Tudo pronto!
                </h2>
                <p className="text-zinc-400">
                  Vamos criar sua fila e você já pode começar a atender seus clientes.
                </p>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-6 text-left">
                <h3 className="text-white font-semibold mb-4">O que vamos criar para você:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">Fila padrão</div>
                      <div className="text-sm text-zinc-400">Com o nome do seu negócio</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">Formulário básico</div>
                      <div className="text-sm text-zinc-400">Nome e telefone do cliente</div>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">Link personalizado</div>
                      <div className="text-sm text-zinc-400">Para seus clientes entrarem na fila</div>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-zinc-400 text-sm">
                  Você poderá completar o cadastro depois. Agora vamos colocar sua fila pra funcionar.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
                  className="flex-1"
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleComplete}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Começar agora'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
