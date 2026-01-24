'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface QuickSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
  className?: string
  disabled?: boolean
}

const SUGGESTIONS = ["What's on my schedule today?", 'Find time for a meeting', 'Cancel my 3pm']

export function QuickSuggestions({ onSuggestionClick, className, disabled }: QuickSuggestionsProps) {
  return (
    <div className={cn('flex flex-wrap gap-2 pb-3', className)}>
      {SUGGESTIONS.map((suggestion) => (
        <button
          key={suggestion}
          type="button"
          onClick={() => onSuggestionClick(suggestion)}
          disabled={disabled}
          className={cn(
            'rounded-2xl bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground',
            'transition-colors hover:bg-secondary/80',
            'disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
