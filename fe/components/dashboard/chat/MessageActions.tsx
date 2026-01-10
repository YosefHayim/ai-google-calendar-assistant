'use client'

import React, { useState } from 'react'
import { Check, Clock, Copy, Edit2, RotateCcw, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Message } from '@/types'
import { toast } from 'sonner'

interface MessageActionsProps {
  msg: Message
  isSpeaking: boolean
  onResend: (text: string) => void
  onEdit: (text: string) => void
  onSpeak: (text: string) => void
}

export const MessageActions: React.FC<MessageActionsProps> = ({ msg, isSpeaking, onResend, onEdit, onSpeak }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      toast.success('Message copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy message')
    }
  }

  if (msg.role === 'assistant') {
    return (
      <div className="flex items-center gap-2 mt-1 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Copy message"
        >
          {copied ? <Check size={16} className="text-orange-500" /> : <Copy size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSpeak(msg.content)}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Hear response"
        >
          <Volume2 size={16} className={isSpeaking ? 'animate-pulse text-primary' : ''} />
        </Button>
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
      <div className="flex items-center gap-1 border-l border-zinc-200 dark:border-zinc-800 pl-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Copy message"
        >
          {copied ? <Check size={16} className="text-orange-500" /> : <Copy size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onResend(msg.content)}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Reset / Re-trigger"
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSpeak(msg.content)}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Hear message"
        >
          <Volume2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(msg.content)}
          className="h-7 w-7 text-zinc-400 hover:text-primary"
          title="Edit & Resend"
        >
          <Edit2 size={16} />
        </Button>
      </div>
    </div>
  )
}
