'use client'

import { Moon, Sun } from 'lucide-react'

import React from 'react'
import { cn } from '@/components/../lib/utils'
import { useTheme } from 'next-themes'

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === 'dark'
  return (
    <div
      className={cn(
        'flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300',
        isDarkMode ? 'bg-zinc-950 border border-zinc-800' : 'bg-white border border-zinc-200',
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
            isDarkMode ? 'transform translate-x-0 bg-zinc-800' : 'transform translate-x-8 bg-zinc-200',
          )}
        >
          {isDarkMode ? (
            <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
          ) : (
            <Sun className="w-4 h-4 text-zinc-700" strokeWidth={1.5} />
          )}
        </div>
        <div
          className={cn(
            'flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300',
            isDarkMode ? 'bg-transparent' : 'transform -translate-x-8',
          )}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-zinc-500" strokeWidth={1.5} />
          ) : (
            <Moon className="w-4 h-4 text-zinc-900" strokeWidth={1.5} />
          )}
        </div>
      </div>
    </div>
  )
}
