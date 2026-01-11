'use client'

import { DashboardUIProvider, useDashboardUI } from '@/contexts/DashboardUIContext'

import { ChatProvider } from '@/contexts/ChatContext'
import { LanguageOnboardingModal } from '@/components/onboarding/LanguageOnboardingModal'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import React, { Suspense } from 'react'
import SettingsModal from '@/components/dashboard/shared/SettingsModal'
import Sidebar from '@/components/dashboard/shared/Sidebar'

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
    showLanguageOnboarding,
    completeLanguageOnboarding,
    dismissLanguageOnboarding,
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
        {children}
      </main>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        onSignOut={handleSignOut}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
      />
      <LanguageOnboardingModal
        isOpen={showLanguageOnboarding}
        onClose={dismissLanguageOnboarding}
        onComplete={completeLanguageOnboarding}
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

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <Suspense fallback={<DashboardLayoutFallback />}>
      <DashboardUIProvider>
        <ChatProvider>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </ChatProvider>
      </DashboardUIProvider>
    </Suspense>
  )
}
