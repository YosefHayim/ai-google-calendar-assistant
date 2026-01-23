'use client'

import { Archive, Brain, Eraser, Loader2, MessageCircleX, MessageSquareX, Trash2, UserX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SettingsRow, SettingsSection, TabHeader } from './components'

import { Button } from '@/components/ui/button'
import React from 'react'

interface DataControlsTabProps {
  onDeleteAllConversations: () => void
  isDeletingConversations: boolean
  onViewArchivedConversations: () => void
  onResetMemory: () => void
  isResettingMemory: boolean
  onDeleteAccount: () => void
}

export const DataControlsTab: React.FC<DataControlsTabProps> = ({
  onDeleteAllConversations,
  isDeletingConversations,
  onViewArchivedConversations,
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
            icon={<MessageCircleX size={18} className="text-foreground" />}
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteAllConversations}
                disabled={isDeletingConversations}
                className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isDeletingConversations ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquareX className="h-4 w-4" />
                )}
                Clear History
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="archived-conversations"
            title="Archived Conversations"
            tooltip="View and restore conversations you've previously archived. Archived conversations are hidden from your main chat list."
            icon={<Archive size={18} className="text-foreground" />}
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={onViewArchivedConversations}
                className="gap-2 border-muted text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Archive className="h-4 w-4" />
                View Archived
              </Button>
            }
          />
        </SettingsSection>

        <SettingsSection showDivider className="mt-4">
          <SettingsRow
            id="reset-memory"
            title="Reset Assistant Memory"
            tooltip="Clear all learned scheduling patterns, preferred meeting durations, and location preferences. Ally will need to relearn your habits over time."
            icon={<Eraser size={18} className="text-foreground" />}
            control={
              <Button
                variant="outline"
                size="sm"
                onClick={onResetMemory}
                disabled={isResettingMemory}
                className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                {isResettingMemory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
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
            icon={<UserX size={18} className="text-foreground" />}
            control={
              <Button variant="destructive" size="sm" onClick={onDeleteAccount} className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Account
              </Button>
            }
          />
        </SettingsSection>
      </CardContent>
    </Card>
  )
}
