export type ActiveTab = 'chat' | 'avatar'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
