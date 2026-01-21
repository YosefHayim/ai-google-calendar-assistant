import { LayoutDashboard, TrendingUp, Clock, Calendar, Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export const useAnalyticsTabs = () => {
  const { t } = useTranslation()

  return [
    { id: 'overview', label: t('analytics.tabs.overview'), icon: LayoutDashboard },
    { id: 'patterns', label: t('analytics.tabs.patterns'), icon: TrendingUp },
    { id: 'time', label: t('analytics.tabs.time'), icon: Clock },
    { id: 'calendars', label: t('analytics.tabs.calendars'), icon: Calendar },
    { id: 'health', label: t('analytics.tabs.health'), icon: Heart },
  ] as const
}

export const ANALYTICS_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'patterns', label: 'Patterns', icon: TrendingUp },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'calendars', label: 'Calendars', icon: Calendar },
  { id: 'health', label: 'Health', icon: Heart },
] as const

export type TabId = (typeof ANALYTICS_TABS)[number]['id']

export const STORAGE_KEY = 'analytics_active_tab'
