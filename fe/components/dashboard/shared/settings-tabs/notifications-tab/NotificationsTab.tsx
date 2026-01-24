'use client'

import React from 'react'
import { TabHeader } from '../components'
import { NotificationsSection } from './components/NotificationsSection'
import { DailyBriefingSection } from './components/DailyBriefingSection'
import { useTranslation } from 'react-i18next'

export const NotificationsTab: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className="space-y-8">
      <TabHeader
        title={t('settings.notifications', 'Notifications')}
        description={t('settings.notificationsDescription', 'Configure how and when Ally notifies you.')}
      />
      <NotificationsSection />
      <DailyBriefingSection />
    </div>
  )
}
