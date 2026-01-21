import { Bell, Brain, CreditCard, Database, LayoutDashboard, Settings, Shield } from 'lucide-react'

export type TabValue =
  | 'general'
  | 'account'
  | 'notifications'
  | 'integrations'
  | 'assistant'
  | 'security'
  | 'dataControls'

export interface TabConfig {
  id: TabValue
  label: string
  icon: React.ComponentType<{ size?: number }>
}

import { useTranslation } from 'react-i18next'

export const useSettingsTabs = () => {
  const { t } = useTranslation()

  return [
    { id: 'general', label: t('settings.tabs.general'), icon: Settings },
    { id: 'account', label: t('settings.tabs.account'), icon: CreditCard },
    { id: 'integrations', label: t('settings.tabs.integrations'), icon: LayoutDashboard },
    { id: 'assistant', label: t('settings.tabs.assistant'), icon: Brain },
    { id: 'notifications', label: t('settings.tabs.notifications'), icon: Bell },
    { id: 'security', label: t('settings.tabs.security'), icon: Shield },
    { id: 'dataControls', label: t('settings.tabs.dataControls'), icon: Database },
  ] as TabConfig[]
}

export const SETTINGS_TABS: TabConfig[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'account', label: 'Subscription', icon: CreditCard },
  { id: 'integrations', label: 'Integrations', icon: LayoutDashboard },
  { id: 'assistant', label: "Ally's Brain", icon: Brain },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'dataControls', label: 'Data', icon: Database },
]
