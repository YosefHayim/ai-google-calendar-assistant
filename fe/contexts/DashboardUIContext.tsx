'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

const ONBOARDING_COMPLETE_KEY = 'allyOnBoardingComplete'

interface DashboardUIContextValue {
  // Sidebar state
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void

  // Settings modal state
  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  // Theme
  isDarkMode: boolean
  toggleTheme: () => void

  // Onboarding tour
  showTour: boolean
  completeTour: () => void

  // Sign out
  handleSignOut: () => void
}

const DashboardUIContext = createContext<DashboardUIContextValue | null>(null)

export function DashboardUIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 768)

      // Check if user has seen onboarding tour
      const hasSeenTour = localStorage.getItem(ONBOARDING_COMPLETE_KEY)
      if (!hasSeenTour) {
        const timer = setTimeout(() => setShowTour(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev)
  }, [])

  const closeSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }, [])

  const openSettings = () => setIsSettingsOpen(true)

  const closeSettings = () => setIsSettingsOpen(false)

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  const completeTour = () => {
    setShowTour(false)
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
  }

  const handleSignOut = () => {
    closeSettings()
    router.push('/login')
  }

  const value: DashboardUIContextValue = {
    // Sidebar
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,

    // Settings
    isSettingsOpen,
    openSettings,
    closeSettings,

    // Theme
    isDarkMode: theme === 'dark',
    toggleTheme,

    // Onboarding
    showTour,
    completeTour,

    // Sign out
    handleSignOut,
  }

  return <DashboardUIContext.Provider value={value}>{children}</DashboardUIContext.Provider>
}

export function useDashboardUI() {
  const context = useContext(DashboardUIContext)
  if (!context) {
    throw new Error('useDashboardUI must be used within a DashboardUIProvider')
  }
  return context
}
