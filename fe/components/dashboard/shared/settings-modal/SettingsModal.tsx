'use client'

import {
  AssistantTab,
  DataControlsTab,
  GeneralTab,
  IntegrationsTab,
  NotificationsTab,
  SecurityTab,
  SubscriptionTab,
} from '../settings-tabs'
import { DesktopSidebar, MobileHeader, MobileSignOut, MobileTabBar } from './components'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import React, { useState } from 'react'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import {
  useDeactivateUser,
  useDeleteAllConversations,
  useDisconnectGoogleCalendar,
  useGoogleCalendarStatus,
  useResetMemory,
  useUser,
} from '@/hooks/queries'

import { ArchivedConversationsDialog } from '@/components/dialogs/ArchivedConversationsDialog'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '../ConfirmDialog'
import { X } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

export function SettingsModal({ isOpen, onClose, onSignOut, isDarkMode, toggleTheme }: SettingsModalProps) {
  const { t } = useTranslation()
  const [showDeleteConversationsDialog, setShowDeleteConversationsDialog] = useState(false)
  const [showArchivedConversationsDialog, setShowArchivedConversationsDialog] = useState(false)
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
  const { mutate: disconnectGoogleCalendar, isPending: isDisconnecting } = useDisconnectGoogleCalendar({
    onSuccess: () => {
      setShowDisconnectGoogleDialog(false)
      toast.success(t('toast.googleCalendarDisconnected'), {
        description: 'Your calendar integration has been removed.',
      })
    },
    onError: (error: Error) => {
      toast.error(t('toast.googleCalendarDisconnectFailed'), {
        description: error.message || 'An error occurred',
      })
    },
  })
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
    disconnectGoogleCalendar(undefined)
  }

  const handleDeleteAllConversations = () => {
    setShowDeleteConversationsDialog(true)
  }

  const handleViewArchivedConversations = () => {
    setShowArchivedConversationsDialog(true)
  }

  const confirmDeleteAllConversations = () => {
    deleteAllConversations(undefined, {
      onSuccess: () => {
        setShowDeleteConversationsDialog(false)
        toast.success(t('toast.conversationsDeleted'), {
          description: 'All your chat history has been permanently deleted.',
        })
      },
      onError: (error) => {
        toast.error(t('toast.conversationsDeleteFailed'), {
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
        toast.success(t('toast.memoryCleared'), {
          description: data.message || 'Ally will relearn your scheduling habits over time.',
        })
      },
      onError: (error) => {
        toast.error(t('toast.memoryClearFailed'), {
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
      toast.success(t('toast.accountDeleted'), {
        description: 'Your account and all associated data have been permanently deleted.',
      })
      onSignOut?.()
      router.push('/')
    } catch (error) {
      toast.error(t('toast.accountDeleteFailed'), {
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
        <DialogContent className="h-[85dvh] w-[calc(100%-2rem)] max-w-3xl gap-0 overflow-hidden bg-background bg-secondary p-0 sm:h-[600px] [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>Manage your Ally preferences and settings.</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="general" className="flex h-full w-full flex-col sm:flex-row" orientation="vertical">
            <MobileHeader onClose={onClose} />
            <MobileTabBar />
            <DesktopSidebar onSignOut={onSignOut} />

            <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              <div className="hidden flex-shrink-0 items-center justify-end p-3 pb-0 sm:flex">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
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

                <TabsContent value="dataControls" className="mt-0 data-[state=active]:pb-4">
                  <DataControlsTab
                    onDeleteAllConversations={handleDeleteAllConversations}
                    isDeletingConversations={isDeletingConversations}
                    onViewArchivedConversations={handleViewArchivedConversations}
                    onResetMemory={handleResetMemory}
                    isResettingMemory={isResettingMemory}
                    onDeleteAccount={handleDeleteAccount}
                  />
                </TabsContent>

                <MobileSignOut onSignOut={onSignOut} />
              </div>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      <ArchivedConversationsDialog
        isOpen={showArchivedConversationsDialog}
        onClose={() => setShowArchivedConversationsDialog(false)}
      />
    </>
  )
}

export default SettingsModal
