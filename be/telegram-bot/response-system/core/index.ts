/**
 * Core module exports
 */

// Configuration
export {
  defaultConfig,
  MINIMAL_EMOJIS,
  mergeConfig,
  TYPE_EMOJIS,
} from "./config"
// HTML Escaping
export {
  containsUnsafeHtml,
  escapeHtml,
  escapeHtmlPreserving,
  sanitizeUserInput,
  unescapeHtml,
} from "./html-escaper"

// Response Builder
export { ResponseBuilder } from "./response-builder"
// RTL Handling
export {
  applyLineBasedDirection,
  applyRtl,
  applyUnicodeDirection,
  containsArabic,
  containsHebrew,
  containsRtl,
  detectDirection,
  formatInlineLabelValue,
  formatLabelValue,
  isolateDirection,
  isRtlText,
  UNICODE_MARKERS,
} from "./rtl-handler"
// Types
export * from "./types"
