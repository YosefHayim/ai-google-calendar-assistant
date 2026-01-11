'use client'

import { DashboardUIProvider, useDashboardUI } from '@/contexts/DashboardUIContext'

import { ChatProvider } from '@/contexts/ChatContext'
import { LanguageOnboardingModal } from '@/components/onboarding/LanguageOnboardingModal'
import { OnboardingTour } from '@/components/dashboard/shared/OnboardingTour'
import React from 'react'
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

export default function DashboardLayout({ children }: { children?: React.ReactNode }) {
  return (
    <DashboardUIProvider>
      <ChatProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </ChatProvider>
    </DashboardUIProvider>
  )
}
