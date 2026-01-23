'use client'

import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Message } from '@/types'
import MessageBubble from '@/components/dashboard/chat/MessageBubble'
import React from 'react'
import { cn } from '@/lib/utils'

interface EditableMessageProps {
  message: Message
  isEditing: boolean
  editText: string
  editInputRef: React.RefObject<HTMLTextAreaElement | null>
  onEditTextChange: (text: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  onConfirm: () => void
  onCancel: () => void
  hideTimestamp?: boolean
}

export const EditableMessage: React.FC<EditableMessageProps> = ({
  message,
  isEditing,
  editText,
  editInputRef,
  onEditTextChange,
  onKeyDown,
  onConfirm,
  onCancel,
  hideTimestamp = true,
}) => {
  if (!isEditing) {
    return (
      <MessageBubble
        role={message.role}
        content={message.content}
        timestamp={message.timestamp}
        images={message.images}
        hideTimestamp={hideTimestamp}
      />
    )
  }

  return (
    <div className={cn('flex w-full', message.role === 'user' ? 'justify-end' : 'justify-start')}>
      <div className="flex w-full max-w-[85%] flex-col gap-2 md:max-w-[75%]">
        <textarea
          ref={editInputRef}
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={onKeyDown}
          className="min-h-[60px] w-full resize-none rounded-xl rounded-tr-none border-2 border-primary bg-primary/10 p-3 text-sm leading-relaxed text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          rows={Math.min(5, editText.split('\n').length + 1)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="icon" onClick={onCancel} className="h-7 w-7" title="Cancel (Esc)">
            <X size={14} />
          </Button>
          <Button size="icon" onClick={onConfirm} className="h-7 w-7" title="Confirm (Enter)">
            <Check size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}
