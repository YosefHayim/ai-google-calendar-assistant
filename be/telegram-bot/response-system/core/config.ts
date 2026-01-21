/**
 * Response System Configuration
 * Default settings for the response rendering system
 */

import type { ResponseConfig } from "./types"

/**
 * Default configuration for the response system.
 * Optimized for Telegram with warm, friendly personality.
 */
export const defaultConfig: ResponseConfig = {
  /** Default to auto-detecting text direction */
  defaultDirection: "auto",

  /** Use both strategies for maximum RTL/LTR compatibility */
  rtlStrategy: "both",

  /** Warm personality with friendly emojis */
  emojiStyle: "friendly",

  /** Always auto-escape HTML in user content */
  autoEscapeHtml: true,
}

/**
 * Merge partial config with defaults
 *
 * @param partial - Partial configuration to merge
 * @returns Complete configuration
 */
export function mergeConfig(partial?: Partial<ResponseConfig>): ResponseConfig {
  if (!partial) {
    return { ...defaultConfig }
  }

  return {
    ...defaultConfig,
    ...partial,
  }
}

/**
 * Emoji mappings for different message types (friendly style)
 */
export const TYPE_EMOJIS = {
  success: "✅",
  error: "😕",
  warning: "⚠️",
  info: "💬",
  list: "📋",
  calendar: "📅",
  notification: "🔔",
  confirmation: "❓",
  help: "🤖",
} as const

/**
 * Emoji mappings for minimal style
 */
export const MINIMAL_EMOJIS = {
  success: "✓",
  error: "✗",
  warning: "!",
  info: "i",
  list: "•",
  calendar: "📅",
  notification: "•",
  confirmation: "?",
  help: "?",
} as const
