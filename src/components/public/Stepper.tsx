'use client'

import { Check } from 'react-feather'
import { cn } from '@/lib/utils'

interface Step {
  number: number
  label: string
  completed: boolean
  current: boolean
}

interface StepperProps {
  steps: Step[]
}

export default function Stepper({ steps }: StepperProps) {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="max-w-4xl mx-auto">
        {/* Desktop/Tablet: Horizontal */}
        <div className="hidden sm:block">
          <div className="relative flex items-center justify-between">
            {/* Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-zinc-200 dark:bg-zinc-800" style={{ zIndex: 0 }}>
              <div
                className="h-full bg-teal-600 transition-all duration-500"
                style={{
                  width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Step circles */}
            <div className="relative flex items-center justify-between w-full" style={{ zIndex: 1 }}>
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300',
                      step.completed
                        ? 'bg-teal-600 text-white'
                        : step.current
                        ? 'bg-teal-600 text-white ring-4 ring-teal-100 dark:ring-teal-900'
                        : 'bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.completed ? <Check className="w-5 h-5" /> : <span>{step.number}</span>}
                  </div>
                  <span
                    className={cn(
                      'mt-2 text-xs sm:text-sm font-medium text-center whitespace-nowrap transition-colors',
                      step.current
                        ? 'text-teal-600 dark:text-teal-400'
                        : step.completed
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile: Compact horizontal with smaller labels */}
        <div className="sm:hidden">
          <div className="relative flex items-start justify-between gap-2">
            {/* Line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-zinc-200 dark:bg-zinc-800" style={{ zIndex: 0 }}>
              <div
                className="h-full bg-teal-600 transition-all duration-500"
                style={{
                  width: `${(steps.filter(s => s.completed).length / (steps.length - 1)) * 100}%`
                }}
              />
            </div>

            {/* Step circles */}
            <div className="relative flex items-start justify-between w-full gap-1" style={{ zIndex: 1 }}>
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center flex-1 min-w-0">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 flex-shrink-0',
                      step.completed
                        ? 'bg-teal-600 text-white'
                        : step.current
                        ? 'bg-teal-600 text-white ring-2 ring-teal-100 dark:ring-teal-900'
                        : 'bg-white dark:bg-zinc-900 border-2 border-zinc-300 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.completed ? <Check className="w-4 h-4" /> : <span>{step.number}</span>}
                  </div>
                  <span
                    className={cn(
                      'mt-1.5 text-[10px] leading-tight font-medium text-center transition-colors line-clamp-2',
                      step.current
                        ? 'text-teal-600 dark:text-teal-400'
                        : step.completed
                        ? 'text-zinc-700 dark:text-zinc-300'
                        : 'text-zinc-500 dark:text-zinc-400'
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
