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

// Core exports
export {
  // Main builder
  ResponseBuilder,
  // Configuration
  defaultConfig,
  mergeConfig,
  TYPE_EMOJIS,
  MINIMAL_EMOJIS,
  // HTML utilities
  escapeHtml,
  escapeHtmlPreserving,
  containsUnsafeHtml,
  sanitizeUserInput,
  unescapeHtml,
  // RTL utilities
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
} from "./core";

// Type exports
export type {
  TextDirection,
  RtlStrategy,
  Channel,
  EmojiStyle,
  ResponseConfig,
  MessageType,
  MessageHeader,
  MessageFooter,
  BulletStyle,
  ListItem,
  BodySection,
  BaseMessage,
  CalendarEvent,
  DaySchedule,
  WeekSchedule,
  ChannelAdapter,
  ResponseBuilderOptions,
  BuilderResult,
} from "./core";

// Adapter exports
export { TelegramAdapter, createTelegramAdapter } from "./adapters";

// Template exports
export {
  // Calendar templates
  weeklyCalendarTemplate,
  todayScheduleTemplate,
  tomorrowScheduleTemplate,
  eventListTemplate,
  freeTimeTemplate,
  busyTimeTemplate,
  monthlyOverviewTemplate,
  // Success templates
  eventCreatedTemplate,
  eventUpdatedTemplate,
  eventDeletedTemplate,
  successTemplate,
  // Error templates
  eventNotFoundTemplate,
  connectionErrorTemplate,
  permissionErrorTemplate,
  timeConflictTemplate,
  errorTemplate,
  // Info/Notification templates
  welcomeTemplate,
  sessionEndedTemplate,
  helpTemplate,
  statusTemplate,
  settingsTemplate,
  feedbackTemplate,
  loadingTemplate,
  confirmationTemplate,
} from "./templates";
