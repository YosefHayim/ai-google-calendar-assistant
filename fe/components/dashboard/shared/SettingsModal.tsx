'use client'

import React from 'react'
import { Bell, Brain, Clock, CreditCard, Database, LayoutDashboard, LogOut, Settings, Shield, X } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  useGoogleCalendarStatus,
  useDisconnectGoogleCalendar,
  useDeleteAllConversations,
  useUser,
} from '@/hooks/queries'
import { toast } from 'sonner'

import {
  GeneralTab,
  SubscriptionTab,
  NotificationsTab,
  DataControlsTab,
  IntegrationsTab,
  SecurityTab,
  AssistantTab,
  GapSettingsTab,
} from './settings-tabs'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSignOut?: () => void
  isDarkMode: boolean
  toggleTheme: () => void
}

type TabValue =
  | 'general'
  | 'account'
  | 'notifications'
  | 'integrations'
  | 'assistant'
  | 'security'
  | 'data_controls'
  | 'gap_settings'

const tabs: { id: TabValue; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Subscription', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: LayoutDashboard },
  { id: 'assistant', label: "Ally's Brain", icon: Brain },
  { id: 'gap_settings', label: 'Gap Detection', icon: Clock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'data_controls', label: 'Data', icon: Database },
]

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSignOut, isDarkMode, toggleTheme }) => {
  const { data: userData, isLoading: isUserLoading } = useUser({
    customUser: true,
    enabled: isOpen,
  })

  const { data: googleCalendarStatus, isLoading: isGoogleCalendarLoading } = useGoogleCalendarStatus({
    enabled: isOpen,
  })

  const { mutate: disconnectGoogleCalendar, isPending: isDisconnecting } = useDisconnectGoogleCalendar()
  const { deleteAll: deleteAllConversations, isDeleting: isDeletingConversations } = useDeleteAllConversations()

  const isGoogleCalendarBusy = isGoogleCalendarLoading || isDisconnecting

  const handleGoogleCalendarResync = () => {
    if (googleCalendarStatus?.authUrl) {
      window.location.href = googleCalendarStatus.authUrl
    }
  }

  const handleGoogleCalendarDisconnect = () => {
    if (
      !window.confirm(
        'Are you sure you want to disconnect Google Calendar? The assistant will no longer be able to manage your schedule.',
      )
    ) {
      return
    }
    disconnectGoogleCalendar()
  }

  const handleDeleteAllConversations = () => {
    if (!window.confirm('Are you sure you want to delete ALL chat logs? This cannot be undone.')) {
      return
    }
    deleteAllConversations(undefined, {
      onSuccess: () => {
        toast.success('Chat logs deleted', {
          description: 'All conversation logs have been deleted.',
        })
      },
      onError: (error) => {
        toast.error('Failed to delete conversations', {
          description: error instanceof Error ? error.message : 'An error occurred',
        })
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 [&>button]:hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your Ally preferences and settings.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex w-full h-[500px]" orientation="vertical">
          {/* Sidebar */}
          <div className="w-56 bg-zinc-50 dark:bg-zinc-900/50 border-r border-zinc-200 dark:border-zinc-800 flex flex-col p-4">
            <div className="flex items-center gap-2 mb-8 px-2">
              <div className="w-6 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-md flex items-center justify-center text-white dark:text-zinc-900 font-bold text-xs">
                A
              </div>
              <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Ally Settings</h2>
            </div>

            <TabsList className="flex-1 flex flex-col h-auto bg-transparent p-0 gap-1">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="w-full justify-start gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:dark:bg-zinc-800 data-[state=active]:text-zinc-900 data-[state=active]:dark:text-zinc-100 data-[state=active]:shadow-sm text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 data-[state=inactive]:shadow-none"
                >
                  <tab.icon size={16} />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <Button
              variant="ghost"
              onClick={onSignOut}
              className="w-full justify-start gap-3 px-3 py-2 text-red-500 text-sm font-medium mt-auto hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
            >
              <LogOut size={16} /> Sign Out
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
            <div className="flex items-center justify-end p-4 pb-2">
              <Button variant="ghost" size="icon" onClick={onClose} className="text-zinc-500 hover:text-zinc-700">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="px-6 pb-6">
              <TabsContent value="general" className="mt-0">
                <GeneralTab
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                  userData={userData}
                  isUserLoading={isUserLoading}
                />
              </TabsContent>

              <TabsContent value="account" className="mt-0">
                <SubscriptionTab />
              </TabsContent>

              <TabsContent value="integrations" className="mt-0">
                <IntegrationsTab
                  googleCalendarStatus={googleCalendarStatus}
                  isGoogleCalendarLoading={isGoogleCalendarLoading}
                  isGoogleCalendarBusy={isGoogleCalendarBusy}
                  isDisconnecting={isDisconnecting}
                  onResync={handleGoogleCalendarResync}
                  onDisconnect={handleGoogleCalendarDisconnect}
                />
              </TabsContent>

              <TabsContent value="assistant" className="mt-0">
                <AssistantTab
                  onDeleteAllConversations={handleDeleteAllConversations}
                  isDeletingConversations={isDeletingConversations}
                />
              </TabsContent>

              <TabsContent value="gap_settings" className="mt-0">
                <GapSettingsTab />
              </TabsContent>

              <TabsContent value="notifications" className="mt-0">
                <NotificationsTab />
              </TabsContent>

              <TabsContent value="security" className="mt-0">
                <SecurityTab />
              </TabsContent>

              <TabsContent value="data_controls" className="mt-0">
                <DataControlsTab />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsModal
