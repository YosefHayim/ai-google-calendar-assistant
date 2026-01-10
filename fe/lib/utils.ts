import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detects if text contains RTL (right-to-left) characters.
 * Supports Hebrew (\u0590-\u05FF) and Arabic (\u0600-\u06FF, \u0750-\u077F)
 */
export function isRTLText(text: string): boolean {
  // Hebrew: \u0590-\u05FF
  // Arabic: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
  return rtlRegex.test(text)
}

/**
 * Returns the text direction based on content.
 * Returns 'rtl' if the text starts with or predominantly contains RTL characters.
 */
export function getTextDirection(text: string): 'rtl' | 'ltr' {
  if (!text) return 'ltr'

  // Check the first meaningful character (skip whitespace and punctuation)
  const firstMeaningfulChar = text.match(/[\p{L}\p{N}]/u)?.[0]
  if (firstMeaningfulChar && isRTLText(firstMeaningfulChar)) {
    return 'rtl'
  }

  // Fallback: check if significant portion is RTL
  const rtlChars = (text.match(/[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || []).length
  const latinChars = (text.match(/[a-zA-Z]/g) || []).length

  return rtlChars > latinChars ? 'rtl' : 'ltr'
}
