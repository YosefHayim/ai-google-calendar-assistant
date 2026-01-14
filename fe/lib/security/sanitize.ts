/**
 * Security: HTML Sanitization utilities
 *
 * Prevents XSS attacks by sanitizing HTML content before rendering.
 * Uses DOMPurify for robust sanitization.
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Use this before rendering any user-generated or AI-generated HTML content.
 *
 * @param dirty - The untrusted HTML string to sanitize
 * @returns Sanitized HTML string safe for rendering
 */
export function sanitizeHtml(dirty: string | undefined | null): string {
  if (!dirty) return ''

  // Only run DOMPurify on client side
  if (typeof window === 'undefined') {
    // Server-side: strip all HTML tags as a fallback
    return dirty.replace(/<[^>]*>/g, '')
  }

  return DOMPurify.sanitize(dirty, {
    // Allow safe HTML tags commonly used in event descriptions
    ALLOWED_TAGS: [
      'p',
      'br',
      'b',
      'i',
      'em',
      'strong',
      'a',
      'ul',
      'ol',
      'li',
      'blockquote',
      'code',
      'pre',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'span',
      'div',
    ],
    // Allow safe attributes
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id'],
    // Force all links to open in new tab with security attributes
    ADD_ATTR: ['target', 'rel'],
    // Prevent javascript: URLs and data: URLs
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i,
  })
}

/**
 * Sanitize HTML and force safe link attributes.
 * All external links will have target="_blank" and rel="noopener noreferrer"
 *
 * @param dirty - The untrusted HTML string to sanitize
 * @returns Sanitized HTML string with safe link attributes
 */
export function sanitizeHtmlWithSafeLinks(dirty: string | undefined | null): string {
  if (!dirty) return ''

  if (typeof window === 'undefined') {
    return dirty.replace(/<[^>]*>/g, '')
  }

  // First sanitize, then fix links
  const sanitized = sanitizeHtml(dirty)

  // Add noopener noreferrer to all links
  return sanitized.replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ')
}

/**
 * Strip all HTML tags, returning plain text.
 * Use this when you don't want any HTML rendering.
 *
 * @param dirty - The HTML string to strip
 * @returns Plain text with all HTML removed
 */
export function stripHtml(dirty: string | undefined | null): string {
  if (!dirty) return ''

  if (typeof window === 'undefined') {
    return dirty.replace(/<[^>]*>/g, '')
  }

  return DOMPurify.sanitize(dirty, { ALLOWED_TAGS: [] })
}

/**
 * Input validation constants
 */
export const INPUT_LIMITS = {
  /** Maximum characters for chat input (aligns with backend guardrail) */
  CHAT_MESSAGE: 5000,
  /** Maximum characters for event title */
  EVENT_TITLE: 500,
  /** Maximum characters for event description */
  EVENT_DESCRIPTION: 10000,
  /** Maximum file size for uploads (10MB) */
  MAX_FILE_SIZE_MB: 10,
} as const

/**
 * Validate input length
 *
 * @param input - The input string to validate
 * @param maxLength - Maximum allowed length
 * @returns Object with isValid flag and optional error message
 */
export function validateInputLength(
  input: string,
  maxLength: number,
): { isValid: boolean; error?: string; remaining: number } {
  const length = input.length
  const remaining = maxLength - length

  if (length > maxLength) {
    return {
      isValid: false,
      error: `Input exceeds maximum length of ${maxLength} characters (${length - maxLength} over limit)`,
      remaining,
    }
  }

  return { isValid: true, remaining }
}
