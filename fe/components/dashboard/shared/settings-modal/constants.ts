import { Bell, Brain, CreditCard, Database, LayoutDashboard, Settings, Shield } from 'lucide-react'

export type TabValue = 'general' | 'account' | 'notifications' | 'integrations' | 'assistant' | 'security' | 'dataControls'

export interface TabConfig {
  id: TabValue
  label: string
  icon: React.ComponentType<{ size?: number }>
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
