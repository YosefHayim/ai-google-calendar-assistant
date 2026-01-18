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
        <div className="flex justify-center mb-6">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 text-primary">
            {step.icon}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground dark:text-white mb-2">{step.title}</h2>
        <p className="text-sm text-primary font-medium mb-4">{step.description}</p>
        <p className="text-zinc-600 dark:text-muted-foreground leading-relaxed">{step.content}</p>
      </motion.div>
    </AnimatePresence>
  )
}
