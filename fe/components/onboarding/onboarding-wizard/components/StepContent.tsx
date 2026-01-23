'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { OnboardingStep } from '../constants'

interface StepContentProps {
  step: OnboardingStep
}

export function StepContent({ step }: StepContentProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={step.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-4 text-primary">
            {step.icon}
          </div>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-foreground">{step.title}</h2>
        <p className="mb-4 text-sm font-medium text-primary">{step.description}</p>
        <p className="leading-relaxed text-muted-foreground">{step.content}</p>
      </motion.div>
    </AnimatePresence>
  )
}
