'use client'

import { Check, Globe } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface LanguageDropdownProps {
  className?: string
  triggerClassName?: string
  compact?: boolean
}

export function LanguageDropdown({ className, triggerClassName, compact = false }: LanguageDropdownProps) {
  const { currentLanguage, changeLanguage, languages } = useLanguage()
  const currentLang = languages.find((l) => l.code === currentLanguage)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition-colors',
          'text-muted-foreground dark:text-muted-foreground hover:text-foreground dark:hover:text-primary-foreground',
          'hover:bg-secondary dark:hover:bg-secondary',
          'focus:outline-none',
          triggerClassName,
        )}
      >
        <Globe className="h-4 w-4" />
        {!compact && <span className="hidden sm:inline">{currentLang?.flag}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn('min-w-44', className)}>
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={cn(
              'flex items-center justify-between gap-2 cursor-pointer',
              currentLanguage === lang.code && 'bg-secondary dark:bg-secondary',
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{lang.flag}</span>
              <span>{lang.nativeName}</span>
            </div>
            {currentLanguage === lang.code && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
