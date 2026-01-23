'use client'

import { Moon, Sun } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { cn } from '@/components/../lib/utils'
import { useTheme } from 'next-themes'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDarkMode = theme === 'dark'

  // Prevent hydration mismatch by rendering a placeholder until mounted
  if (!mounted) {
    return (
      <div
        className={cn(
          'flex h-8 w-16 rounded-full border-border bg-accent bg-secondary p-1 transition-all duration-300',
          className,
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted" />
          <div className="flex h-6 w-6 items-center justify-center rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300',
        isDarkMode ? 'border-border bg-secondary' : 'border-border bg-background',
        className,
      )}
      onClick={() => setTheme(isDarkMode ? 'light' : 'dark')}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          setTheme(isDarkMode ? 'light' : 'dark')
        }
      }}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDarkMode ? 'translate-x-0 transform bg-secondary' : 'translate-x-8 transform bg-accent',
          )}
        >
          {isDarkMode ? (
            <Moon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          ) : (
            <Sun className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDarkMode ? 'bg-transparent' : '-translate-x-8 transform',
          )}
        >
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <Moon className="h-4 w-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
