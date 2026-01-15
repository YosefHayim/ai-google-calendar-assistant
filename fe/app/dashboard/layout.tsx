'use client'

import { DashboardUIProvider, useDashboardUI } from '@/contexts/DashboardUIContext'

import { ChatProvider } from '@/contexts/ChatContext'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import React, { Suspense, useEffect } from 'react'
import SettingsModal from '@/components/dashboard/shared/SettingsModal'
import Sidebar from '@/components/dashboard/shared/Sidebar'
import { AnimatedHamburger } from '@/components/ui/animated-hamburger'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function DashboardLayoutContent({ children }: { children?: React.ReactNode }) {
  const {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isSettingsOpen,
    openSettings,
    closeSettings,
    isDarkMode,
    toggleTheme,
    showTour,
    completeTour,
    handleSignOut,
  } = useDashboardUI()

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {showTour && <OnboardingTour onComplete={completeTour} />}

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        onToggle={toggleSidebar}
        onOpenSettings={openSettings}
        onSignOut={handleSignOut}
      />
      <main className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}>
        {!isSidebarOpen && (
          <AnimatedHamburger
            isOpen={false}
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-[60] md:hidden bg-zinc-50 dark:bg-zinc-950 rounded-md"
          />
        )}
        {children}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
    </div>
  )
}

function DashboardLayoutFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="animate-pulse text-zinc-500">Loading...</div>
    </div>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return <DashboardLayoutFallback />
  }

  if (!isAuthenticated) {
    return <DashboardLayoutFallback />
  }

  return <>{children}</>
}

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <AuthGuard>
        <DashboardUIProvider>
          <ChatProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
          </ChatProvider>
        </DashboardUIProvider>
      </AuthGuard>
    </Suspense>
  )
}
