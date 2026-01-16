/**
 * Response System Type Definitions
 * Provides type-safe interfaces for the multi-channel response rendering system
 */

// ============================================
// Direction & Configuration Types
// ============================================

export type TextDirection = "ltr" | "rtl" | "auto";
export type RtlStrategy = "line-based" | "unicode-markers" | "both";
export type Channel = "telegram" | "whatsapp" | "web";
export type EmojiStyle = "minimal" | "friendly" | "expressive";

export type ResponseConfig = {
  /** Default text direction */
  defaultDirection: TextDirection;
  /** RTL handling strategy */
  rtlStrategy: RtlStrategy;
  /** Emoji style - warm and friendly by default */
  emojiStyle: EmojiStyle;
  /** Auto-escape HTML in user content */
  autoEscapeHtml: boolean;
};

// ============================================
// Message Structure Types
// ============================================

export type MessageType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "list"
  | "calendar"
  | "notification"
  | "confirmation"
  | "help";

export type MessageHeader = {
  /** Primary emoji for visual scanning */
  emoji?: string;
  /** Main title/greeting */
  title: string;
  /** Optional subtitle/context */
  subtitle?: string;
};

export type MessageFooter = {
  /** Tip or call-to-action */
  tip?: string;
  /** Next steps or suggestions */
  nextSteps?: string[];
  /** Closing message */
  closing?: string;
};

export type BulletStyle = "dot" | "dash" | "number" | "emoji" | "none";

export type ListItem = {
  /** Bullet style */
  bullet?: BulletStyle;
  /** Custom emoji for bullet (when bullet is 'emoji') */
  bulletEmoji?: string;
  /** Primary text */
  text: string;
  /** Secondary/detail text (rendered italic) */
  detail?: string;
  /** Whether text should be emphasized (bold) */
  emphasis?: boolean;
};

export type BodySection = {
  /** Section emoji */
  emoji?: string;
  /** Section title */
  title?: string;
  /** Section content - string or list items */
  content: string | ListItem[];
  /** Add visual separator after section */
  separator?: boolean;
};

export type BaseMessage = {
  type: MessageType;
  header: MessageHeader;
  body: string | BodySection[];
  footer?: MessageFooter;
  direction?: TextDirection;
};

// ============================================
// Calendar Event Types
// ============================================

export type CalendarEvent = {
  id?: string;
  summary: string;
  start: Date | string;
  end: Date | string;
  location?: string;
  calendarName?: string;
  isAllDay?: boolean;
};

export type DaySchedule = {
  date: Date | string;
  events: CalendarEvent[];
  totalHours?: number;
};

export type WeekSchedule = {
  weekStart: Date | string;
  days: DaySchedule[];
  summary?: {
    totalEvents: number;
    totalHours: number;
    busiestDay?: string;
  };
};

// ============================================
// Adapter Interface
// ============================================

export type ChannelAdapter = {
  readonly channel: Channel;

  /** Format a complete message for this channel */
  format(message: BaseMessage): string;

  /** Format bold text */
  bold(text: string): string;

  /** Format italic text */
  italic(text: string): string;

  /** Format code/monospace text */
  code(text: string): string;

  /** Format a hyperlink */
  link(href: string, text: string): string;

  /** Escape user-provided content */
  escapeHtml(text: string): string;

  /** Apply RTL/LTR direction markers */
  applyDirection(text: string, direction: TextDirection): string;

  /** Get line separator for this channel */
  getLineSeparator(): string;

  /** Get section separator for this channel */
  getSectionSeparator(): string;
};

// ============================================
// Builder Pattern Types
// ============================================

export type ResponseBuilderOptions = {
  channel: Channel;
  config?: Partial<ResponseConfig>;
};

export type BuilderResult = {
  /** Formatted message string */
  content: string;
  /** Parse mode for the channel (e.g., 'HTML' for Telegram) */
  parseMode?: string;
  /** Original structured message */
  message: BaseMessage;
};
