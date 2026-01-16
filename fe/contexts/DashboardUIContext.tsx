'use client'

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTheme } from 'next-themes'
import { toast } from 'sonner'

import { useGoogleCalendarStatus } from '@/hooks/queries/integrations'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthContext } from '@/contexts/AuthContext'

const ONBOARDING_COMPLETE_KEY = 'allyOnBoardingComplete'

type DashboardUIContextValue = {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  closeSidebar: () => void

  isSettingsOpen: boolean
  openSettings: () => void
  closeSettings: () => void

  isDarkMode: boolean
  toggleTheme: () => void

  showTour: boolean
  completeTour: () => void

  handleSignOut: () => void
}

const DashboardUIContext = createContext<DashboardUIContextValue | null>(null)

export function DashboardUIProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const { logout } = useAuthContext()

  const { data: googleCalendarStatus } = useGoogleCalendarStatus()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 768)

      const hasSeenTour = localStorage.getItem(ONBOARDING_COMPLETE_KEY)
      if (!hasSeenTour) {
        const timer = setTimeout(() => setShowTour(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  // Handle Google Calendar reauth required
  useEffect(() => {
    const googleReauth = searchParams.get('google_reauth')
    const sessionReauth = typeof window !== 'undefined' ? sessionStorage.getItem('google_reauth_required') : null

    if (googleReauth === 'required' || sessionReauth === 'true') {
      // Clear the flags
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('google_reauth_required')
        // Remove query param from URL without reload
        const url = new URL(window.location.href)
        url.searchParams.delete('google_reauth')
        window.history.replaceState({}, '', url.toString())
      }

      // Show toast with reconnect action
      // Note: googleCalendarStatus is already the unwrapped GoogleCalendarIntegrationStatus (destructured from useQueryWrapper)
      const authUrl = googleCalendarStatus?.authUrl

      toast.error('Google Calendar session expired', {
        description: authUrl
          ? "Your Google Calendar connection needs to be refreshed. Click 'Reconnect' to continue."
          : 'Your Google Calendar connection needs to be refreshed. Go to Settings > Integrations to reconnect.',
        duration: 15000,
        action: authUrl
          ? {
              label: 'Reconnect',
              onClick: () => {
                window.location.href = authUrl
              },
            }
          : {
              label: 'Open Settings',
              onClick: () => {
                setIsSettingsOpen(true)
              },
            },
      })
    }
  }, [searchParams, googleCalendarStatus])

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

  const handleSignOut = useCallback(() => {
    closeSettings()
    logout()
    queryClient.clear()
    router.push('/login')
  }, [closeSettings, logout, queryClient, router])

  const value: DashboardUIContextValue = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,

    isSettingsOpen,
    openSettings,
    closeSettings,

    isDarkMode: theme === 'dark',
    toggleTheme,

    showTour,
    completeTour,

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
