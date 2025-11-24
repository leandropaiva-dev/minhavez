'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'react-feather'
import BasicInfoStep from './steps/BasicInfoStep'
import SegmentConfigStep from './steps/SegmentConfigStep'
import FormConfigStep from './steps/FormConfigStep'
import PaymentStep from './steps/PaymentStep'
import type { OnboardingProgress } from '@/types/config.types'
import {
  saveOnboardingProgress,
  getOnboardingProgress,
  clearOnboardingData,
  saveSegmentConfig,
  saveQueueFormConfig,
} from '@/lib/config/storage'

const STEPS = [
  { id: 0, label: 'Informações' },
  { id: 1, label: 'Segmento' },
  { id: 2, label: 'Formulário' },
  { id: 3, label: 'Pagamento' },
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState<OnboardingProgress>({
    currentStep: 0,
  })

  useEffect(() => {
    // Load existing progress
    const existingProgress = getOnboardingProgress()
    if (existingProgress) {
      setProgress(existingProgress)
      setCurrentStep(existingProgress.currentStep)
    }
  }, [])

  const saveProgress = (updatedProgress: OnboardingProgress) => {
    setProgress(updatedProgress)
    saveOnboardingProgress(updatedProgress)
  }

  const handleBasicInfoNext = (data: OnboardingProgress['basicInfo']) => {
    const updatedProgress = {
      ...progress,
      basicInfo: data,
      currentStep: 1,
    }
    saveProgress(updatedProgress)
    setCurrentStep(1)
  }

  const handleSegmentConfigNext = (data: OnboardingProgress['segmentConfig']) => {
    const updatedProgress = {
      ...progress,
      segmentConfig: data,
      currentStep: 2,
    }
    saveProgress(updatedProgress)
    if (data) {
      saveSegmentConfig(data)
    }
    setCurrentStep(2)
  }

  const handleFormConfigNext = (data: OnboardingProgress['formConfig']) => {
    const updatedProgress = {
      ...progress,
      formConfig: data,
      currentStep: 3,
    }
    saveProgress(updatedProgress)
    if (data) {
      saveQueueFormConfig(data)
    }
    setCurrentStep(3)
  }

  const handlePaymentFinish = () => {
    // Clear onboarding data
    clearOnboardingData()
    // Redirect to dashboard
    router.push('/dashboard')
  }

  const handleBack = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1
      const updatedProgress = {
        ...progress,
        currentStep: newStep,
      }
      saveProgress(updatedProgress)
      setCurrentStep(newStep)
    }
  }

  return (
    <div className="min-h-screen bg-black py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
          {currentStep === 0 && (
            <BasicInfoStep
              onNext={handleBasicInfoNext}
              initialData={progress.basicInfo}
            />
          )}

          {currentStep === 1 && (
            <SegmentConfigStep
              onNext={handleSegmentConfigNext}
              onBack={handleBack}
              initialData={progress.segmentConfig}
            />
          )}

          {currentStep === 2 && (
            <FormConfigStep
              onNext={handleFormConfigNext}
              onBack={handleBack}
              initialData={progress.formConfig}
            />
          )}

          {currentStep === 3 && (
            <PaymentStep onNext={handlePaymentFinish} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  )
}
