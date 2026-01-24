'use client'

import React from 'react'
import { Archive, Brain, Loader2, MessageSquare, Trash2, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SettingsRow, SettingsSection, TabHeader } from './components'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  return (
    <div className="space-y-6">
      <TabHeader
        title={t('settings.dataControls', 'Data Controls')}
        description={t('settings.dataControlsDescription', 'Manage your data, conversations, and account.')}
      />

      <SettingsSection
        variant="card"
        title={t('settings.conversationData', 'Conversation Data')}
        description={t('settings.conversationDataDescription', 'Manage your chat history and archived conversations')}
      >
        <SettingsRow
          id="delete-conversations"
          title={t('settings.deleteAllConversations', 'Delete All Conversations')}
          description={t(
            'settings.deleteConversationsDescription',
            'Permanently delete all your chat history with Ally',
          )}
          icon={<MessageSquare size={18} />}
          control={
            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteAllConversations}
              disabled={isDeletingConversations}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isDeletingConversations ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Clear History
            </Button>
          }
        />

        <SettingsRow
          id="archived-conversations"
          title={t('settings.archivedConversations', 'Archived Conversations')}
          description={t('settings.archivedDescription', "View and restore conversations you've previously archived")}
          icon={<Archive size={18} />}
          control={
            <Button variant="ghost" size="sm" onClick={onViewArchivedConversations}>
              View Archived
            </Button>
          }
        />

        <SettingsRow
          id="reset-memory"
          title={t('settings.resetAssistantMemory', 'Reset Assistant Memory')}
          description={t('settings.resetMemoryDescription', 'Clear all learned scheduling patterns and preferences')}
          icon={<Brain size={18} />}
          control={
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetMemory}
              disabled={isResettingMemory}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              {isResettingMemory ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Reset Memory
            </Button>
          }
        />
      </SettingsSection>

      <SettingsSection
        variant="danger"
        title={t('settings.dangerZone', 'Danger Zone')}
        description={t('settings.dangerZoneDescription', 'Irreversible and destructive actions')}
      >
        <SettingsRow
          id="delete-account"
          title={t('settings.deleteAccount', 'Delete Account')}
          description={t('settings.deleteAccountDescription', 'Permanently delete your account including all data')}
          icon={<UserX size={18} />}
          control={
            <Button variant="destructive" size="sm" onClick={onDeleteAccount}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          }
        />
      </SettingsSection>
    </div>
  )
}
