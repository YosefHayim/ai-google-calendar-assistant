'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'

interface ChatHeaderProps {
  onClose: () => void
  onMinimize: () => void
}

export function ChatHeader({ onClose, onMinimize }: ChatHeaderProps) {
  return (
    <div className="relative flex items-center justify-between px-4 py-3 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-gradient-to-r from-zinc-50/80 to-white/80 dark:from-zinc-900/80 dark:to-zinc-950/80 backdrop-blur-xl rounded-t-2xl">
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary via-orange-500 to-primary rounded-full"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <div className="flex items-center gap-3">
        <div className="relative w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-primary/20">
          <VoicePoweredOrb enableVoiceControl={false} className="w-full h-full" maxRotationSpeed={0.2} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
            Ally
            <span className="px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary rounded-md">
              AI
            </span>
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Minimize"
        >
          <ChevronDown size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          title="Close"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  )
}
