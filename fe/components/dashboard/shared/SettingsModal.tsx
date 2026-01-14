'use client'

import {
  AssistantTab,
  DataControlsTab,
  GeneralTab,
  IntegrationsTab,
  NotificationsTab,
  SecurityTab,
  SubscriptionTab,
} from './settings-tabs'
import { Bell, Brain, CreditCard, Database, LayoutDashboard, LogOut, Settings, Shield, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useDeactivateUser,
  useDeleteAllConversations,
  useDisconnectGoogleCalendar,
  useGoogleCalendarStatus,
  useResetMemory,
  useUser,
} from '@/hooks/queries'

import { AllyLogo } from '@/components/shared/logo'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

type TabValue = 'general' | 'account' | 'notifications' | 'integrations' | 'assistant' | 'security' | 'data_controls'

const tabs: { id: TabValue; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Subscription', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: LayoutDashboard },
  { id: 'assistant', label: "Ally's Brain", icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data_controls', label: 'Data', icon: Database },
]

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSignOut, isDarkMode, toggleTheme }) => {
  const [showDeleteConversationsDialog, setShowDeleteConversationsDialog] = useState(false)
  const [showDisconnectGoogleDialog, setShowDisconnectGoogleDialog] = useState(false)
  const [showResetMemoryDialog, setShowResetMemoryDialog] = useState(false)
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false)

  const { data: userData, isLoading: isUserLoading } = useUser({
    customUser: true,
    enabled: isOpen,
  })

  const { data: googleCalendarStatus, isLoading: isGoogleCalendarLoading } = useGoogleCalendarStatus({
    enabled: isOpen,
  })

  const router = useRouter()
  const { mutate: disconnectGoogleCalendar, isPending: isDisconnecting } = useDisconnectGoogleCalendar()
  const { deleteAll: deleteAllConversations, isDeleting: isDeletingConversations } = useDeleteAllConversations()
  const { resetMemory: resetMemoryMutation, isResetting: isResettingMemory } = useResetMemory()
  const { mutateAsync: deactivateUserAsync, isPending: isDeactivating } = useDeactivateUser()

  const isGoogleCalendarBusy = isGoogleCalendarLoading || isDisconnecting

  const handleGoogleCalendarResync = () => {
    if (googleCalendarStatus?.authUrl) {
      window.location.href = googleCalendarStatus.authUrl
    }
  }

  const handleGoogleCalendarDisconnect = () => {
    setShowDisconnectGoogleDialog(true)
  }

  const confirmGoogleCalendarDisconnect = () => {
    disconnectGoogleCalendar()
    setShowDisconnectGoogleDialog(false)
    toast.success('Google Calendar disconnected', {
      description: 'Your calendar integration has been removed.',
    })
  }

  const handleDeleteAllConversations = () => {
    setShowDeleteConversationsDialog(true)
  }

  const confirmDeleteAllConversations = () => {
    deleteAllConversations(undefined, {
      onSuccess: () => {
        setShowDeleteConversationsDialog(false)
        toast.success('Conversations deleted', {
          description: 'All your chat history has been permanently deleted.',
        })
      },
      onError: (error) => {
        toast.error('Failed to delete conversations', {
          description: error instanceof Error ? error.message : 'An error occurred',
        })
      },
    })
  }

  const handleResetMemory = () => {
    setShowResetMemoryDialog(true)
  }

  const confirmResetMemory = () => {
    resetMemoryMutation(undefined, {
      onSuccess: (data) => {
        setShowResetMemoryDialog(false)
        toast.success('Memory cleared', {
          description: data.message || 'Ally will relearn your scheduling habits over time.',
        })
      },
      onError: (error) => {
        toast.error('Failed to reset memory', {
          description: error instanceof Error ? error.message : 'An error occurred',
        })
      },
    })
  }

  const handleDeleteAccount = () => {
    setShowDeleteAccountDialog(true)
  }

  const confirmDeleteAccount = async () => {
    try {
      await deactivateUserAsync()
      setShowDeleteAccountDialog(false)
      toast.success('Account deleted successfully', {
        description: 'Your account and all associated data have been permanently deleted.',
      })
      onSignOut?.()
      router.push('/')
    } catch (error) {
      toast.error('Failed to delete account', {
        description: error instanceof Error ? error.message : 'An error occurred while deleting your account.',
      })
    }
  }

  return (
    <>
      <ConfirmDialog
        isOpen={showDeleteConversationsDialog}
        onClose={() => setShowDeleteConversationsDialog(false)}
        onConfirm={confirmDeleteAllConversations}
        title="Delete All Conversations"
        description="Are you sure you want to delete all your chat history? This will permanently remove all messages, summaries, and conversation data. This action cannot be undone."
        confirmLabel="Delete All"
        variant="warning"
        isLoading={isDeletingConversations}
      />

      <ConfirmDialog
        isOpen={showDisconnectGoogleDialog}
        onClose={() => setShowDisconnectGoogleDialog(false)}
        onConfirm={confirmGoogleCalendarDisconnect}
        title="Disconnect Google Calendar"
        description="Are you sure you want to disconnect Google Calendar? Ally will no longer be able to view or manage your calendar events."
        confirmLabel="Disconnect"
        variant="destructive"
        isLoading={isDisconnecting}
      />

      <ConfirmDialog
        isOpen={showResetMemoryDialog}
        onClose={() => setShowResetMemoryDialog(false)}
        onConfirm={confirmResetMemory}
        title="Reset Assistant Memory"
        description="Are you sure you want to reset Ally's memory? This will clear all learned scheduling patterns, preferred meeting durations, and location preferences. Ally will need to relearn your habits over time."
        confirmLabel="Reset Memory"
        variant="warning"
        isLoading={isResettingMemory}
      />

      <ConfirmDialog
        isOpen={showDeleteAccountDialog}
        onClose={() => setShowDeleteAccountDialog(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        description="Are you sure you want to permanently delete your account? This will remove all your data including conversations, preferences, calendar connections, and subscription. This action cannot be undone."
        confirmLabel="Delete Account"
        variant="destructive"
        isLoading={isDeactivating}
      />

      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-3xl h-[85dvh] sm:h-[600px] p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your Ally preferences and settings.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="flex flex-col sm:flex-row w-full h-full" orientation="vertical">
            {/* Mobile Header */}
            <div className="flex sm:hidden items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                  <AllyLogo className="w-4 h-4" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Settings</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-zinc-500 hover:text-zinc-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Tab Bar - Horizontal scrollable with icons only */}
            <div className="flex sm:hidden border-b border-zinc-200 dark:border-zinc-800 flex-shrink-0 bg-zinc-50 dark:bg-zinc-900/50">
              <TabsList className="flex w-full h-auto bg-transparent p-1 gap-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex-shrink-0 flex items-center justify-center p-2 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500"
                    title={tab.label}
                  >
                    <tab.icon size={16} />
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden sm:flex w-52 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex-col p-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-8 h-8 bg-zinc-900 dark:bg-white rounded-md flex items-center justify-center text-white dark:text-zinc-900">
                  <AllyLogo className="w-5 h-5" />
                </div>
                <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">Ally Settings</h2>
              </div>

              <TabsList className="flex-1 flex flex-col h-full justify-start bg-transparent p-0 gap-1">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full justify-start gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/70"
                  >
                    <tab.icon size={14} />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <Button
                variant="ghost"
                onClick={onSignOut}
                className="w-full justify-start gap-2 px-2 py-1.5 text-zinc-500 text-xs font-medium mt-auto hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
              >
                <LogOut size={14} /> Sign Out
              </Button>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
              {/* Desktop Close Button */}
              <div className="hidden sm:flex items-center justify-end p-3 pb-0 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-zinc-500 hover:text-zinc-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 pb-4 pt-2 sm:pt-0">
                <TabsContent value="general" className="mt-0 data-[state=active]:pb-4">
                  <GeneralTab
                    isDarkMode={isDarkMode}
                    toggleTheme={toggleTheme}
                    userData={userData}
                    isUserLoading={isUserLoading}
                  />
                </TabsContent>

                <TabsContent value="account" className="mt-0 data-[state=active]:pb-4">
                  <SubscriptionTab />
                </TabsContent>

                <TabsContent value="integrations" className="mt-0 data-[state=active]:pb-4">
                  <IntegrationsTab
                    googleCalendarStatus={googleCalendarStatus}
                    isGoogleCalendarLoading={isGoogleCalendarLoading}
                    isGoogleCalendarBusy={isGoogleCalendarBusy}
                    isDisconnecting={isDisconnecting}
                    onResync={handleGoogleCalendarResync}
                    onDisconnect={handleGoogleCalendarDisconnect}
                  />
                </TabsContent>

                <TabsContent value="assistant" className="mt-0 data-[state=active]:pb-4">
                  <AssistantTab />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0 data-[state=active]:pb-4">
                  <NotificationsTab />
                </TabsContent>

                <TabsContent value="security" className="mt-0 data-[state=active]:pb-4">
                  <SecurityTab />
                </TabsContent>

                <TabsContent value="data_controls" className="mt-0 data-[state=active]:pb-4">
                  <DataControlsTab
                    onDeleteAllConversations={handleDeleteAllConversations}
                    isDeletingConversations={isDeletingConversations}
                    onResetMemory={handleResetMemory}
                    isResettingMemory={isResettingMemory}
                    onDeleteAccount={handleDeleteAccount}
                  />
                </TabsContent>

                {/* Mobile Sign Out */}
                <div className="sm:hidden mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                  <Button
                    variant="ghost"
                    onClick={onSignOut}
                    className="w-full justify-center gap-2 py-2 text-zinc-500 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <LogOut size={14} /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default SettingsModal
