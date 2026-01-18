'use client'

import React from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useTranslation } from 'react-i18next'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}

export function SearchInput({ value, onChange, onClear }: SearchInputProps) {
  const { t } = useTranslation()

  return (
    <div className="px-6 pb-2">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t('dialogs.eventSearch.placeholder', 'Search by title or description...')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {value && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
