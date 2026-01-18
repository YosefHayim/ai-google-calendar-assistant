'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '../types'

interface MessageBubbleProps {
  message: ChatMessage
  index: number
}

export function MessageBubble({ message, index }: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn('flex', message.isUser ? 'justify-end' : 'justify-start')}
    >
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm',
          message.isUser
            ? 'bg-gradient-to-br from-primary to-orange-500 text-white rounded-br-md'
            : 'bg-secondary dark:bg-secondary/80 text-foreground dark:text-primary-foreground rounded-bl-md border border/50 dark:border-zinc-700/50',
        )}
      >
        <p className="text-sm leading-relaxed">{message.text}</p>
      </div>
    </motion.div>
  )
}
