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
          'flex w-16 h-8 p-1 rounded-full transition-all duration-300 bg-accent dark:bg-secondary border-border',
          className,
        )}
      >
        <div className="flex justify-between items-center w-full">
          <div className="flex justify-center items-center w-6 h-6 rounded-full bg-muted" />
          <div className="flex justify-center items-center w-6 h-6 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300',
        isDarkMode ? 'bg-secondary border-border' : 'bg-background border-border',
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
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
            isDarkMode ? 'transform translate-x-0 bg-secondary' : 'transform translate-x-8 bg-accent',
          )}
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
            isDarkMode ? 'bg-transparent' : 'transform -translate-x-8',
          )}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4 text-foreground" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
