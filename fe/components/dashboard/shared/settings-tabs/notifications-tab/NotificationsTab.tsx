'use client'

import React from 'react'
import { NotificationsSection } from './components/NotificationsSection'
import { DailyBriefingSection } from './components/DailyBriefingSection'
import { DefaultRemindersSection } from './components/DefaultRemindersSection'

export const NotificationsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <NotificationsSection />
      <DailyBriefingSection />
      <DefaultRemindersSection />
    </div>
  )
}
