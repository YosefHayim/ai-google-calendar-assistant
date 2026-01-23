'use client'

import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  totalSteps: number
  currentStep: number
}

export function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex justify-center mb-6">
      <div className="flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              index === currentStep
                ? 'w-8 bg-primary'
                : index < currentStep
                  ? 'w-1.5 bg-primary/50'
                  : 'w-1.5 bg-accent dark:bg-secondary',
            )}
          />
        ))}
      </div>
    </div>
  )
}
