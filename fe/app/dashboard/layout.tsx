'use client'

import { DashboardUIProvider, useDashboardUI } from '@/contexts/DashboardUIContext'
import React, { Suspense, useEffect } from 'react'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

import { AppSidebar } from '@/components/dashboard/shared/AppSidebar'
import { ChatProvider } from '@/contexts/ChatContext'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import SettingsModal from '@/components/dashboard/shared/SettingsModal'
import { TrialExpirationBanner } from '@/components/dashboard/shared/TrialExpirationBanner'
import { redirectToCheckout } from '@/services/payment-service'
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

  const handleUpgrade = async () => {
    try {
      await redirectToCheckout({
        planSlug: 'pro',
        interval: 'yearly',
      })
    } catch (error) {
      console.error('Failed to redirect to checkout:', error)
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-muted dark:bg-secondary">
        {showTour && <OnboardingTour onComplete={completeTour} />}

        <AppSidebar onOpenSettings={openSettings} onSignOut={handleSignOut} />

        <SidebarInset className="flex-1 flex flex-col">
          <TrialExpirationBanner onUpgrade={handleUpgrade} />

          <header className="sticky top-0 flex h-14 items-center gap-2 border-b bg-muted dark:bg-secondary px-4 md:hidden z-40">
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
    <div className="flex h-screen items-center justify-center bg-muted dark:bg-secondary">
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
