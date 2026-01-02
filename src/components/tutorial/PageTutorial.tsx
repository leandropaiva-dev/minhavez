'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, ArrowLeft, Check } from 'react-feather'
import { createClient } from '@/lib/supabase/client'

interface TutorialStep {
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
}

interface PageTutorialProps {
  userId: string
  pageName: string // 'overview', 'fila', 'reservas', 'historico', 'relatorios', 'links'
  steps: TutorialStep[]
  onComplete?: () => void
}

export default function PageTutorial({ userId, pageName, steps, onComplete }: PageTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [targetPosition, setTargetPosition] = useState<DOMRect | null>(null)

  useEffect(() => {
    const checkTutorialStatus = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      const tutorialKey = `tutorial_${pageName}_completed`

      if (user && !user.user_metadata?.[tutorialKey]) {
        setTimeout(() => setIsActive(true), 2000)
      }
    }

    checkTutorialStatus()
  }, [userId, pageName])

  useEffect(() => {
    if (!isActive) return

    const updateTargetPosition = () => {
      const step = steps[currentStep]
      const element = document.querySelector(step.target)

      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetPosition(rect)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
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
  }, [currentStep, isActive, steps])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
    const tutorialKey = `tutorial_${pageName}_completed`

    await supabase.auth.updateUser({
      data: { [tutorialKey]: true }
    })

    setIsActive(false)
    onComplete?.()
  }

  const skipTutorial = async () => {
    await completeTutorial()
  }

  if (!isActive || !targetPosition) return null

  const step = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <>
      {/* SVG Overlay with real hole */}
      <svg
        className="fixed inset-0 z-[9999] pointer-events-none"
        style={{ width: '100vw', height: '100vh' }}
      >
        <defs>
          <mask id="tutorial-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
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
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#tutorial-mask)"
        />
      </svg>

      {/* Highlight border */}
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

      {/* Tooltip */}
      <div
        className={`pointer-events-auto bg-white dark:bg-zinc-900 rounded-lg shadow-2xl border-2 border-blue-500 dark:border-blue-600 p-4 sm:p-6 z-[10001] ${
          isMobile
            ? 'fixed bottom-0 left-0 right-0 mx-4 mb-4 rounded-t-2xl'
            : 'fixed w-80 max-w-[calc(100vw-32px)]'
        }`}
        style={
          !isMobile
            ? (() => {
                const tooltipHeight = 350
                const spacing = 24
                const viewportWidth = window.innerWidth
                const viewportHeight = window.innerHeight

                // Detectar se é a página de links (tem preview sticky à direita)
                const isLinksPage = pageName === 'links'

                if (isLinksPage) {
                  // Para página de links: sempre posicionar à esquerda do conteúdo
                  const spaceLeft = targetPosition.left - spacing

                  if (spaceLeft >= 320 + spacing) {
                    // À esquerda se couber
                    return {
                      top: Math.max(16, Math.min(
                        targetPosition.top,
                        viewportHeight - tooltipHeight - 16
                      )),
                      left: targetPosition.left - 320 - spacing
                    }
                  } else {
                    // Embaixo centralizado se não couber à esquerda
                    return {
                      top: targetPosition.bottom + spacing,
                      left: Math.max(16, Math.min(
                        targetPosition.left + targetPosition.width / 2 - 160,
                        viewportWidth / 2 - 320 // Só usa metade esquerda da tela
                      ))
                    }
                  }
                }

                // Lógica normal para outras páginas
                const spaceBelow = viewportHeight - (targetPosition.bottom + spacing)

                if (spaceBelow >= tooltipHeight) {
                  return {
                    top: targetPosition.bottom + spacing,
                    left: Math.max(16, Math.min(
                      targetPosition.left + targetPosition.width / 2 - 160,
                      viewportWidth - 320 - 16
                    ))
                  }
                } else if (targetPosition.top - tooltipHeight - spacing > 0) {
                  return {
                    top: targetPosition.top - tooltipHeight - spacing,
                    left: Math.max(16, Math.min(
                      targetPosition.left + targetPosition.width / 2 - 160,
                      viewportWidth - 320 - 16
                    ))
                  }
                } else {
                  return { top: 16, left: 16 }
                }
              })()
            : {}
        }
      >
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

        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
          {step.content}
        </p>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-2">
            <span>Passo {currentStep + 1} de {steps.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

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
              {currentStep === steps.length - 1 ? (
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
