import { LayoutDashboard, TrendingUp, Clock, Calendar, Heart } from 'lucide-react'

export const ANALYTICS_TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'patterns', label: 'Patterns', icon: TrendingUp },
  { id: 'time', label: 'Time', icon: Clock },
  { id: 'calendars', label: 'Calendars', icon: Calendar },
  { id: 'health', label: 'Health', icon: Heart },
] as const

export type TabId = (typeof ANALYTICS_TABS)[number]['id']

export const STORAGE_KEY = 'analytics_active_tab'
