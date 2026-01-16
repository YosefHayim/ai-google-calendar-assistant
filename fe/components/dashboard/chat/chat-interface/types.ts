export type ActiveTab = 'chat' | 'avatar' | '3d'

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext
  }
}
