'use client'

import React, { ReactNode, createContext, useContext, useEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'ally_theme_mode'

interface ThemeContextType {
  isDarkMode: boolean
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Fix: Make children optional to resolve JSX children missing error in index.tsx
export const ThemeProvider = ({ children }: { children?: ReactNode }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check localStorage first, then fall back to system preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'dark')
    } else {
      setIsDarkMode(false)
    }
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev
      localStorage.setItem(THEME_STORAGE_KEY, newValue ? 'dark' : 'light')
      return newValue
    })
  }

  return <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>{children}</ThemeContext.Provider>
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
