/**
 * Core module exports
 */

// Types
export * from "./types";

// Configuration
export { defaultConfig, mergeConfig, TYPE_EMOJIS, MINIMAL_EMOJIS } from "./config";

// Response Builder
export { ResponseBuilder } from "./response-builder";

// HTML Escaping
export {
  escapeHtml,
  escapeHtmlPreserving,
  containsUnsafeHtml,
  sanitizeUserInput,
  unescapeHtml,
} from "./html-escaper";

// RTL Handling
export {
  UNICODE_MARKERS,
  containsRtl,
  containsHebrew,
  containsArabic,
  isRtlText,
  detectDirection,
  applyUnicodeDirection,
  applyLineBasedDirection,
  applyRtl,
  isolateDirection,
  formatLabelValue,
  formatInlineLabelValue,
} from "./rtl-handler";
