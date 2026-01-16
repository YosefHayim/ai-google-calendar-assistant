export interface AIAllySidebarProps {
  isOpen: boolean
  onClose: () => void
  onOpen?: () => void
}

export interface ChatMessage {
  id: number
  text: string
  isUser: boolean
}

export interface QuickAction {
  label: string
  emoji: string
}
