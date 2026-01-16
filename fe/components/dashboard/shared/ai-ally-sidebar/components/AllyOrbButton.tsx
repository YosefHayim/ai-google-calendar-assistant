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
      className="group relative w-16 h-16 rounded-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={false}
      animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      suppressHydrationWarning
    >
      <div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />

      <div className="relative w-14 h-14 rounded-full overflow-hidden shadow-2xl shadow-primary/40">
        <VoicePoweredOrb enableVoiceControl={false} className="w-full h-full" maxRotationSpeed={0.3} />
      </div>

      <div className="absolute -left-28 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
        Chat with Ally
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-zinc-900 dark:bg-zinc-800 rotate-45" />
      </div>
    </motion.button>
  )
}
