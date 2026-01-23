'use client'

import { Progress } from '@/components/ui/progress'
import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps: number
  title: string
  subtitle?: string
}

function OnboardingLayoutContent({ children, currentStep, totalSteps, title, subtitle }: OnboardingLayoutProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Progress bar at top */}
      <div className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-full max-w-2xl"
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-2 text-3xl font-bold tracking-tight"
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground"
              >
                {subtitle}
              </motion.p>
            )}
          </div>

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {children}
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// Export the content component for use in pages
export { OnboardingLayoutContent }

// Default export for Next.js layout
export default function OnboardingLayout({ children }: { children: ReactNode }) {
  return children
}
