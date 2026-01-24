'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
}

function ProgressBar({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex w-full gap-2">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className={cn('h-1 flex-1 rounded-sm', index < currentStep ? 'bg-primary' : 'bg-muted')} />
      ))}
    </div>
  )
}

function OnboardingLayoutContent({ children, currentStep, totalSteps }: OnboardingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex w-full max-w-[560px] flex-col items-center gap-10"
      >
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        {children}
      </motion.div>
    </div>
  )
}

export { OnboardingLayoutContent }

export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return children
}
