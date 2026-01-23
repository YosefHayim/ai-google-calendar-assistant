'use client'

import { ChevronDown, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import React from 'react'
import { VoicePoweredOrb } from '@/components/ui/voice-powered-orb'
import { motion } from 'framer-motion'

interface ChatHeaderProps {
  onClose: () => void
  onMinimize: () => void
}

export function ChatHeader({ onClose, onMinimize }: ChatHeaderProps) {
  return (
    <div className="border/50 /50 relative flex items-center justify-between rounded-t-2xl border-b bg-gradient-to-r from-zinc-900/80 to-zinc-950/80 px-4 py-3 backdrop-blur-xl">
      <motion.div
        className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full bg-gradient-to-r from-primary via-orange-500 to-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />

      <div className="flex items-center gap-3">
        <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-lg shadow-primary/20">
          <VoicePoweredOrb enableVoiceControl={false} className="h-full w-full" maxRotationSpeed={0.2} />
        </div>
        <div>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-foreground">
            Ally
            <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-bold uppercase tracking-wider text-primary">
              AI
            </span>
          </h3>
          <p className="text-xs font-medium text-emerald-400">Online</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMinimize}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Minimize chat"
        >
          <ChevronDown size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          aria-label="Close chat"
        >
          <X size={16} />
        </Button>
      </div>
    </div>
  )
}
