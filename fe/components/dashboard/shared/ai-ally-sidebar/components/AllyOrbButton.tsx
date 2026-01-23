'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'

interface AllyOrbButtonProps {
  onClick: () => void
  isOpen: boolean
}

export function AllyOrbButton({ onClick, isOpen }: AllyOrbButtonProps) {
  return (
    <motion.button
      onClick={onClick}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      suppressHydrationWarning
    >
      <div className="absolute inset-0 animate-pulse rounded-full bg-primary/30 blur-xl" />

      <div className="relative h-14 w-14 overflow-hidden rounded-full shadow-2xl shadow-primary/40">
        <VoicePoweredOrb enableVoiceControl={false} className="h-full w-full" maxRotationSpeed={0.3} />
      </div>

      <div className="pointer-events-none absolute -left-28 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        Chat with Ally
        <div className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 translate-x-1 rotate-45 bg-secondary" />
      </div>
    </motion.button>
  )
}
