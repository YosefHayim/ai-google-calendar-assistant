/**
 * Response System - Global Response Design System
 *
 * A structured, multi-channel response rendering system for the Telegram bot.
 * Provides type-safe, fluent API for constructing consistent, glanceable messages.
 *
 * @example
 * ```typescript
 * import { ResponseBuilder } from '@/response-system';
 *
 * const response = ResponseBuilder.telegram()
 *   .header('📅', "Today's Schedule")
 *   .text('Let me pull up your agenda...')
 *   .footer('Ask me anytime!')
 *   .build();
 *
 * await ctx.reply(response.content, { parse_mode: response.parseMode });
 * ```
 */

// Adapter exports
export { createTelegramAdapter, TelegramAdapter } from "./adapters";

// Type exports
export type {
  BaseMessage,
  BodySection,
  BuilderResult,
  BulletStyle,
  CalendarEvent,
  Channel,
  ChannelAdapter,
  DaySchedule,
  EmojiStyle,
  ListItem,
  MessageFooter,
  MessageHeader,
  MessageType,
  ResponseBuilderOptions,
  ResponseConfig,
  RtlStrategy,
  TextDirection,
  WeekSchedule,
} from "./core";
// Core exports
export {
  applyLineBasedDirection,
  applyRtl,
  applyUnicodeDirection,
  containsArabic,
  containsHebrew,
  containsRtl,
  containsUnsafeHtml,
  // Configuration
  defaultConfig,
  detectDirection,
  // HTML utilities
  escapeHtml,
  escapeHtmlPreserving,
  formatInlineLabelValue,
  formatLabelValue,
  isolateDirection,
  isRtlText,
  MINIMAL_EMOJIS,
  mergeConfig,
  // Main builder
  ResponseBuilder,
  sanitizeUserInput,
  TYPE_EMOJIS,
  // RTL utilities
  UNICODE_MARKERS,
  unescapeHtml,
} from "./core";

// Template exports
export {
  busyTimeTemplate,
  confirmationTemplate,
  connectionErrorTemplate,
  errorTemplate,
  // Success templates
  eventCreatedTemplate,
  eventDeletedTemplate,
  eventListTemplate,
  // Error templates
  eventNotFoundTemplate,
  eventUpdatedTemplate,
  feedbackTemplate,
  freeTimeTemplate,
  helpTemplate,
  loadingTemplate,
  monthlyOverviewTemplate,
  permissionErrorTemplate,
  sessionEndedTemplate,
  settingsTemplate,
  statusTemplate,
  successTemplate,
  timeConflictTemplate,
  todayScheduleTemplate,
  tomorrowScheduleTemplate,
  // Calendar templates
  weeklyCalendarTemplate,
  // Info/Notification templates
  welcomeTemplate,
} from "./templates";
