'use client'

import React, { useEffect, useState } from 'react'

import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import SettingsModal from '@/components/dashboard/shared/SettingsModal'
import Sidebar from '@/components/dashboard/shared/Sidebar'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'

const ONBOARDING_COMPLETE_KEY = 'allyOnBoardingComplete'

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isSettingsOpen, setIsSettings] = useState(false)
  const [showTour, setShowTour] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsSidebarOpen(window.innerWidth >= 768)

      // Check if user has seen onboarding tour
      const hasSeenTour = localStorage.getItem(ONBOARDING_COMPLETE_KEY)
      if (!hasSeenTour) {
        // Delay slightly to allow the app to render fully
        const timer = setTimeout(() => setShowTour(true), 1000)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false)
    }
  }

  const openSettings = () => setIsSettings(true)
  const closeSettings = () => setIsSettings(false)

  const handleSignOut = () => {
    closeSettings()
    router.push('/login')
  }

  const handleTourComplete = () => {
    setShowTour(false)
    localStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true')
  }

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {showTour && <OnboardingTour onComplete={handleTourComplete} />}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        onOpenSettings={openSettings}
        onSignOut={handleSignOut}
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {children}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onSignOut={handleSignOut}
        isDarkMode={theme === 'dark'}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />
    </div>
  )
}
