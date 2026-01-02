'use client'

import React from 'react'
import { Clock, Edit2, RotateCcw, Volume2 } from 'lucide-react'
import { Message } from '@/types'

interface MessageActionsProps {
  msg: Message
  isSpeaking: boolean
  onResend: (text: string) => void
  onEdit: (text: string) => void
  onSpeak: (text: string) => void
}

export const MessageActions: React.FC<MessageActionsProps> = ({ msg, isSpeaking, onResend, onEdit, onSpeak }) => {
  if (msg.role === 'assistant') {
    return (
      <div className="flex items-center gap-2 mt-1 px-1">
        <button
          onClick={() => onSpeak(msg.content)}
          className="p-1 text-zinc-400 hover:text-primary transition-colors"
          title="Hear response"
        >
          <Volume2 className={`w-3 h-3 ${isSpeaking ? 'animate-pulse text-primary' : ''}`} />
        </button>
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-tighter">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-end gap-3 mt-1.5 px-1">
      <div className="flex items-center gap-1 text-xs font-bold text-zinc-400 uppercase tracking-tighter">
        <Clock className="w-2.5 h-2.5" />
        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex items-center gap-2 border-l border-zinc-200 dark:border-zinc-800 pl-2">
        <button
          onClick={() => onResend(msg.content)}
          className="p-1 text-zinc-400 hover:text-primary transition-colors"
          title="Reset / Re-trigger"
        >
          <RotateCcw size={16} />
        </button>
        <button
          onClick={() => onSpeak(msg.content)}
          className="p-1 text-zinc-400 hover:text-primary transition-colors"
          title="Hear message"
        >
          <Volume2 size={16} />
        </button>
        <button
          onClick={() => onEdit(msg.content)}
          className="p-1 text-zinc-400 hover:text-primary transition-colors"
          title="Edit & Resend"
        >
          <Edit2 size={16} />
        </button>
      </div>
    </div>
  )
}
