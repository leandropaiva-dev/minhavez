'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, Check } from 'react-feather'
import { createClient } from '@/lib/supabase/client'

interface TutorialStep {
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: {
    label: string
    onClick: () => void
  }
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    target: '[data-tutorial="metrics"]',
    title: 'Métricas em Tempo Real',
    content: 'Acompanhe tudo o que acontece no seu negócio em tempo real: pessoas na fila, tempo médio de espera e reservas de hoje.',
    placement: 'bottom',
  },
  {
    target: '[data-tutorial="analytics"]',
    title: 'Analytics',
    content: 'Veja o desempenho do seu negócio. Use os filtros para ver diferentes períodos e métricas.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="qr-code"]',
    title: 'Compartilhe com Clientes',
    content: 'Use este QR Code ou link para seus clientes entrarem na fila. Cole na vitrine, redes sociais ou WhatsApp.',
    placement: 'top',
  },
  {
    target: '[data-tutorial="reservation-link"]',
    title: 'Link de Reservas',
    content: 'Compartilhe este link com seus clientes para fazerem reservas online.',
    placement: 'top',
  },
]

interface DashboardTutorialProps {
  userId: string
  businessId: string
  onComplete?: () => void
}

export default function DashboardTutorial({ userId, onComplete }: DashboardTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null)

  useEffect(() => {
    // Check if user has completed tutorial
    const checkTutorialStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      console.log('Tutorial check:', {
        user: !!user,
        tutorial_completed: user?.user_metadata?.tutorial_completed,
        dashboard_tutorial_completed: user?.user_metadata?.dashboard_tutorial_completed
      })

      if (user && !user.user_metadata?.tutorial_overview_completed) {
        // Start tutorial after a short delay
        console.log('Starting tutorial...')
        setTimeout(() => setIsActive(true), 2000)
      }
    }

    checkTutorialStatus()
  }, [userId])

  useEffect(() => {
    if (!isActive) return

    const updateTargetPosition = () => {
      const step = TUTORIAL_STEPS[currentStep]
      const element = document.querySelector(step.target)

      console.log('Tutorial step:', currentStep, 'Target:', step.target, 'Found:', !!element)

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetPosition(rect)
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        // Retry after a delay if element not found
        setTimeout(updateTargetPosition, 500)
      }
    }

    updateTargetPosition()
    window.addEventListener('resize', updateTargetPosition)
    window.addEventListener('scroll', updateTargetPosition)

    return () => {
      window.removeEventListener('resize', updateTargetPosition)
      window.removeEventListener('scroll', updateTargetPosition)
    }
  }, [currentStep, isActive])

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeTutorial()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const completeTutorial = async () => {
    const supabase = createClient()
    await supabase.auth.updateUser({
      data: {
        tutorial_completed: true,
        tutorial_overview_completed: true
      }
    })

    setIsActive(false)
    onComplete?.()
  }

  const skipTutorial = async () => {
    await completeTutorial()
  }

  if (!isActive || !targetPosition) return null

  const step = TUTORIAL_STEPS[currentStep]
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      {/* SVG Overlay with real hole - NO OVERLAY ON HIGHLIGHTED ELEMENT */}
      <svg
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="tutorial-mask">
            {/* White background */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black hole for highlighted element */}
            <rect
              x={targetPosition.left - 8}
              y={targetPosition.top - 8}
              width={targetPosition.width + 16}
              height={targetPosition.height + 16}
              rx="8"
              fill="black"
            />
          </mask>
        </defs>
        {/* Dark overlay with mask */}
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Highlight border (pulsing) */}
      <div
        className="fixed z-[10000] pointer-events-none"
        style={{
          top: targetPosition.top - 8,
          left: targetPosition.left - 8,
          width: targetPosition.width + 16,
          height: targetPosition.height + 16,
          borderRadius: '8px',
          border: '3px solid #3b82f6',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        }}
      />

      {/* Tooltip - MOBILE FIRST */}
      <div
        className={`pointer-events-auto bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border-2 border-blue-500 dark:border-blue-600 p-4 sm:p-6 z-[10001] ${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 mx-4 mb-4 rounded-t-2xl'
            : 'fixed w-80 max-w-[calc(100vw-32px)]'
        }`}
        style={
          !isMobile
            ? {
              top: targetPosition.top + targetPosition.height + 24 < window.innerHeight - 350
                ? targetPosition.bottom + 24
                : targetPosition.top - 350 > 0
                ? targetPosition.top - 350 - 24
                : 16,
              left: Math.max(16, Math.min(
                targetPosition.left + targetPosition.width / 2 - 160,
                window.innerWidth - 320 - 16
              )),
            }
            : {}
        }
      >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white pr-8">
              {step.title}
            </h3>
            <button
              onClick={skipTutorial}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
            {step.content}
          </p>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
              <span>Passo {currentStep + 1} de {TUTORIAL_STEPS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions - MOBILE FIRST */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
              onClick={skipTutorial}
              className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-center sm:text-left order-2 sm:order-1"
            >
              Pular tutorial
            </button>

            <div className="flex gap-2 order-1 sm:order-2">
              {currentStep > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {currentStep === TUTORIAL_STEPS.length - 1 ? (
                  <>
                    Concluir
                    <Check className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Próximo
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      {/* Pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
      `}</style>
    </>
  )
}
