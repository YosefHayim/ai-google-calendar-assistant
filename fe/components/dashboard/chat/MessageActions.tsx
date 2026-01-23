'use client'

import { Check, Clock, Copy, Edit2, RotateCcw, Volume2 } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Message } from '@/types'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'

interface MessageActionsProps {
  msg: Message
  isSpeaking: boolean
  onResend: (text: string) => void
  onEdit: () => void
  onSpeak: (text: string) => void
}

export const MessageActions: React.FC<MessageActionsProps> = ({ msg, isSpeaking, onResend, onEdit, onSpeak }) => {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content)
      setCopied(true)
      toast.success(t('toast.messageCopied'))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t('toast.messageCopyFailed'))
    }
  }

  if (msg.role === 'assistant') {
    return (
      <div className="mt-1 flex items-center gap-2 px-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Copy message"
        >
          {copied ? <Check size={16} className="text-orange-500" /> : <Copy size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSpeak(msg.content)}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Hear response"
        >
          <Volume2 size={16} className={isSpeaking ? 'animate-pulse text-primary' : ''} />
        </Button>
        <span className="text-xs font-bold uppercase tracking-tighter text-muted-foreground">
          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    )
  }

  return (
    <div className="mt-1.5 flex items-center justify-end gap-3 px-1">
      <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-tighter text-muted-foreground">
        <Clock className="h-2.5 w-2.5" />
        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="flex items-center gap-1 border-l pl-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Copy message"
        >
          {copied ? <Check size={16} className="text-orange-500" /> : <Copy size={16} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onResend(msg.content)}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Reset / Re-trigger"
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onSpeak(msg.content)}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Hear message"
        >
          <Volume2 size={16} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="h-7 w-7 text-muted-foreground hover:text-primary"
          title="Edit & Resend"
        >
          <Edit2 size={16} />
        </Button>
      </div>
    </div>
  )
}
