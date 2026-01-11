export type Role = 'user' | 'assistant'

export interface MessageImage {
  data: string // base64 encoded
  mimeType: 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'
}

export interface Message {
  id: string
  role: Role
  content: string
  images?: MessageImage[]
  timestamp: Date
}

export interface ChatHistory {
  id: string
  title: string
  lastMessage: string
  date: string
}

export interface Integration {
  id: string
  name: string
  status: 'connected' | 'disconnected'
  icon: string
}

export type Route =
  | 'home'
  | 'pricing'
  | 'about'
  | 'contact'
  | 'dashboard'
  | 'login'
  | 'register'
  | 'roi'
  | 'waitinglist'
  | 'phone-registration'
  | 'otp-verification'
