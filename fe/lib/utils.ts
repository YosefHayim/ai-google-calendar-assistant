import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines multiple class names using clsx and tailwind-merge.
 *
 * @description Merges class names intelligently, handling Tailwind CSS conflicts
 * by using tailwind-merge to resolve conflicting utility classes. This is the
 * standard utility for combining conditional and dynamic class names in the application.
 *
 * @param inputs - Variable number of class values (strings, arrays, objects, etc.)
 * @returns Merged and deduplicated class name string
 *
 * @example
 * // Basic usage
 * cn('px-2 py-1', 'bg-destructive')
 * // => 'px-2 py-1 bg-destructive'
 *
 * @example
 * // Conflicting classes are resolved (last wins)
 * cn('px-2', 'px-4')
 * // => 'px-4'
 *
 * @example
 * // Conditional classes with boolean expressions
 * cn('base-class', isActive && 'active-class', { 'error-class': hasError })
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detects if text contains RTL (right-to-left) characters.
 *
 * @description Checks whether the input text contains any right-to-left characters
 * from Hebrew or Arabic scripts. Uses Unicode ranges to identify RTL characters:
 * - Hebrew: \u0590-\u05FF
 * - Arabic: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF
 *
 * @param text - The text string to check for RTL characters
 * @returns True if the text contains any RTL characters, false otherwise
 *
 * @example
 * isRTLText('Hello')     // => false
 * isRTLText('שלום')      // => true (Hebrew)
 * isRTLText('مرحبا')     // => true (Arabic)
 * isRTLText('Hello שלום') // => true (mixed)
 */
export function isRTLText(text: string): boolean {
  // Hebrew: \u0590-\u05FF
  // Arabic: \u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF
  const rtlRegex = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/
  return rtlRegex.test(text)
}

/**
 * Returns the text direction based on content analysis.
 *
 * @description Determines whether text should be rendered left-to-right (LTR) or
 * right-to-left (RTL) based on the content. The function uses a two-step approach:
 * 1. First checks the first meaningful character (skipping whitespace/punctuation)
 * 2. Falls back to comparing the ratio of RTL to Latin characters
 *
 * @param text - The text string to analyze for direction
 * @returns 'rtl' if the text is predominantly RTL, 'ltr' otherwise
 *
 * @example
 * getTextDirection('Hello world')     // => 'ltr'
 * getTextDirection('שלום עולם')       // => 'rtl'
 * getTextDirection('  שלום')          // => 'rtl' (skips leading whitespace)
 * getTextDirection('')                // => 'ltr' (default for empty text)
 * getTextDirection('Hello שלום עולם') // => 'ltr' (starts with LTR)
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
