export type Role = 'user' | 'assistant'

export interface Message {
  id: string
  role: Role
  content: string
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
