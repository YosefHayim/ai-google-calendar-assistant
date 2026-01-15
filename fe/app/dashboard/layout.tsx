'use client'

import { DashboardUIProvider, useDashboardUI } from '@/contexts/DashboardUIContext'

import { ChatProvider } from '@/contexts/ChatContext'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import React, { Suspense, useEffect } from 'react'
import SettingsModal from '@/components/dashboard/shared/SettingsModal'
import { AppSidebar } from '@/components/dashboard/shared/AppSidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function DashboardLayoutContent({ children }: { children?: React.ReactNode }) {
  const {
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
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-zinc-50 dark:bg-zinc-950">
        {showTour && <OnboardingTour onComplete={completeTour} />}

        <AppSidebar onOpenSettings={openSettings} onSignOut={handleSignOut} />

        <SidebarInset className="flex-1 flex flex-col">
          <header className="flex h-14 items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
        </SidebarInset>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={closeSettings}
          onSignOut={handleSignOut}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />
      </div>
    </SidebarProvider>
  )
}

function DashboardLayoutFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <LoadingSpinner size="lg" />
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
