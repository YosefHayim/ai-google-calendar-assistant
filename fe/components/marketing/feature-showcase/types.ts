import type { LucideIcon } from 'lucide-react'

export type Platform = 'telegram' | 'slack' | 'whatsapp'

export interface Message {
  type: 'user' | 'ally'
  content: string | React.ReactNode
  time: string
  isVoice?: boolean
  showTyping?: boolean
}

export interface Feature {
  id: string
  icon: LucideIcon
  titleKey: string
  descriptionKey: string
  category: 'schedule' | 'manage' | 'insights' | 'ai'
  telegram: {
    messages: Message[]
  }
  slack: {
    messages: Message[]
  }
  whatsapp: {
    messages: Message[]
  }
  web: {
    component: React.ReactNode
  }
}
