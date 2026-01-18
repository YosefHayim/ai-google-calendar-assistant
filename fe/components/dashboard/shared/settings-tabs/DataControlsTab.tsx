'use client'

import { Brain, Loader2, MessageSquareX, Trash2, MessageCircleX, Eraser, UserX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsRow, SettingsSection, TabHeader } from './components'

import { Button } from '@/components/ui/button'
import React from 'react'

interface DataControlsTabProps {
  onDeleteAllConversations: () => void
  isDeletingConversations: boolean
  onResetMemory: () => void
  isResettingMemory: boolean
  onDeleteAccount: () => void
}

export const DataControlsTab: React.FC<DataControlsTabProps> = ({
  onDeleteAllConversations,
  isDeletingConversations,
  onResetMemory,
  isResettingMemory,
  onDeleteAccount,
}) => {
  const handleExport = () => {
    console.log('Exporting calendar data...')
  }

  return (
    <Card>
      <TabHeader title="Data Controls" tooltip="Manage your data, conversations, and account" />
      <CardContent>
        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="delete-conversations"
            title="Delete All Conversations"
            tooltip="Permanently delete all your chat history with Ally. This removes all messages, summaries, and conversation data. This cannot be undone."
            icon={<MessageCircleX size={18} className="text-foreground dark:text-primary" />}
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAllConversations}
                disabled={isDeletingConversations}
                className="gap-2 text-amber-700 hover:text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 dark:hover:bg-amber-900/20"
              >
                {isDeletingConversations ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquareX className="w-4 h-4" />
                )}
                Clear History
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="reset-memory"
            title="Reset Assistant Memory"
            tooltip="Clear all learned scheduling patterns, preferred meeting durations, and location preferences. Ally will need to relearn your habits over time."
            icon={<Eraser size={18} className="text-foreground dark:text-primary" />}
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={onResetMemory}
                disabled={isResettingMemory}
                className="gap-2 text-amber-700 hover:text-amber-700 border-amber-200 hover:bg-amber-50 dark:border-amber-900/30 dark:hover:bg-amber-900/20"
              >
                {isResettingMemory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
                Reset Memory
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="delete-account"
            title="Delete Account"
            tooltip="Permanently delete your account including all data, conversations, preferences, and calendar connections. This action is irreversible."
            icon={<UserX size={18} className="text-foreground dark:text-primary" />}
            control={
              <Button variant="destructive" size="sm" onClick={onDeleteAccount} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
