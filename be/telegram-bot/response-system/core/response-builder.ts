/**
 * ResponseBuilder - Fluent API for constructing structured messages
 * The main entry point for the response rendering system
 */

import { TelegramAdapter } from "../adapters/telegram-adapter"
import { mergeConfig, TYPE_EMOJIS } from "./config"
import { sanitizeUserInput } from "./html-escaper"
import type {
  BaseMessage,
  BodySection,
  BuilderResult,
  BulletStyle,
  CalendarEvent,
  Channel,
  ChannelAdapter,
  DaySchedule,
  ListItem,
  MessageFooter,
  MessageHeader,
  MessageType,
  ResponseConfig,
  TextDirection,
  WeekSchedule,
} from "./types"

export class ResponseBuilder {
  private readonly channel: Channel
  private readonly config: ResponseConfig
  private readonly adapter: ChannelAdapter

  private _type: MessageType = "info"
  private _header: MessageHeader | null = null
  private readonly _body: BodySection[] = []
  private _footer: MessageFooter | null = null
  private _direction: TextDirection = "auto"

  constructor(channel: Channel, config?: Partial<ResponseConfig>) {
    this.channel = channel
    this.config = mergeConfig(config)
    this.adapter = this.createAdapter()
  }

  /**
   * Create the appropriate adapter for the channel
   */
  private createAdapter(): ChannelAdapter {
    switch (this.channel) {
      case "telegram":
        return new TelegramAdapter(this.config)
      // Future: case 'whatsapp': return new WhatsAppAdapter(this.config);
      // Future: case 'web': return new WebAdapter(this.config);
      default:
        return new TelegramAdapter(this.config)
    }
  }

  // ============================================
  // Static Factory Methods
  // ============================================

  /**
   * Create a builder for Telegram messages
   */
  static telegram(config?: Partial<ResponseConfig>): ResponseBuilder {
    return new ResponseBuilder("telegram", config)
  }

  /**
   * Create a builder for WhatsApp messages (future)
   */
  static whatsapp(config?: Partial<ResponseConfig>): ResponseBuilder {
    return new ResponseBuilder("whatsapp", config)
  }

  /**
   * Create a builder for web responses (future)
   */
  static web(config?: Partial<ResponseConfig>): ResponseBuilder {
    return new ResponseBuilder("web", config)
  }

  // ============================================
  // Builder Methods (Fluent API)
  // ============================================

  /**
   * Set message type for styling hints
   */
  type(messageType: MessageType): this {
    this._type = messageType
    return this
  }

  /**
   * Set header with emoji, title, and optional subtitle
   */
  header(emoji: string, title: string, subtitle?: string): this {
    this._header = { emoji: emoji || undefined, title, subtitle }
    return this
  }

  /**
   * Set header from object
   */
  headerFrom(header: MessageHeader): this {
    this._header = header
    return this
  }

  /**
   * Add plain text to body
   */
  text(content: string): this {
    if (content) {
      this._body.push({ content })
    }
    return this
  }

  /**
   * Add a section with emoji, title and content
   */
  section(emoji: string, title: string, content: string | ListItem[]): this {
    this._body.push({
      emoji: emoji || undefined,
      title,
      content,
      separator: false,
    })
    return this
  }

  /**
   * Add a section from object
   */
  sectionFrom(section: BodySection): this {
    this._body.push(section)
    return this
  }

  /**
   * Add a list of items with optional title
   */
  list(items: ListItem[], title?: string, emoji?: string): this {
    this._body.push({
      emoji: emoji || undefined,
      title,
      content: items,
      separator: false,
    })
    return this
  }

  /**
   * Add a simple bullet list from strings
   */
  bulletList(items: string[], bullet: BulletStyle = "dot"): this {
    const listItems: ListItem[] = items.map((text) => ({ text, bullet }))
    this._body.push({ content: listItems })
    return this
  }

  /**
   * Add a numbered list from strings
   */
  numberedList(items: string[]): this {
    const listItems: ListItem[] = items.map((text) => ({
      text,
      bullet: "number" as BulletStyle,
    }))
    this._body.push({ content: listItems })
    return this
  }

  /**
   * Add a separator line after the last section
   */
  separator(): this {
    if (this._body.length > 0) {
      const last = this._body.at(-1)
      if (last) {
        last.separator = true
      }
    }
    return this
  }

  /**
   * Add empty line for spacing
   */
  spacing(): this {
    this._body.push({ content: "" })
    return this
  }

  /**
   * Set footer with tip and/or closing
   */
  footer(tip?: string, closing?: string): this {
    this._footer = { tip, closing }
    return this
  }

  /**
   * Set footer with next steps
   */
  footerWithSteps(tip: string, nextSteps: string[]): this {
    this._footer = { tip, nextSteps }
    return this
  }

  /**
   * Set footer from object
   */
  footerFrom(footer: MessageFooter): this {
    this._footer = footer
    return this
  }

  /**
   * Set text direction
   */
  direction(dir: TextDirection): this {
    this._direction = dir
    return this
  }

  // ============================================
  // Calendar-Specific Builders
  // ============================================

  /**
   * Add a single event to the body
   */
  event(event: CalendarEvent): this {
    const timeStr = this.formatEventTime(event)
    const item: ListItem = {
      bullet: "emoji",
      bulletEmoji: "📌",
      text: event.summary,
      detail: timeStr,
      emphasis: false,
    }
    this._body.push({ content: [item] })
    return this
  }

  /**
   * Add a day's schedule
   */
  daySchedule(schedule: DaySchedule): this {
    const dateStr = this.formatDate(schedule.date)

    if (schedule.events.length === 0) {
      this.section("📅", dateStr, "No events scheduled")
      return this
    }

    const items: ListItem[] = schedule.events.map((event) => ({
      bullet: "emoji" as BulletStyle,
      bulletEmoji: this.getEventEmoji(event),
      text: event.summary,
      detail: this.formatEventTime(event),
    }))

    this.section("📅", dateStr, items)

    if (schedule.totalHours !== undefined) {
      this.text(`Total: ${schedule.totalHours}h scheduled`)
    }

    return this
  }

  /**
   * Add a week's schedule
   */
  weekSchedule(schedule: WeekSchedule): this {
    for (const day of schedule.days) {
      if (day.events.length > 0) {
        this.daySchedule(day)
        this.spacing()
      }
    }

    if (schedule.summary) {
      const summaryItems: ListItem[] = [
        { bullet: "dot", text: `${schedule.summary.totalEvents} events` },
        { bullet: "dot", text: `${schedule.summary.totalHours}h total` },
      ]

      if (schedule.summary.busiestDay) {
        summaryItems.push({
          bullet: "dot",
          text: `Busiest: ${schedule.summary.busiestDay}`,
        })
      }

      this.section("📊", "Summary", summaryItems)
    }

    return this
  }

  // ============================================
  // Pre-built Message Types
  // ============================================

  /**
   * Quick success message
   */
  success(title: string, detail?: string): this {
    return this.type("success")
      .header(TYPE_EMOJIS.success, title)
      .text(detail || "")
  }

  /**
   * Quick error message
   */
  error(title: string, suggestion?: string): this {
    return this.type("error")
      .header(TYPE_EMOJIS.error, title)
      .footer(suggestion)
  }

  /**
   * Quick warning message
   */
  warning(title: string, detail?: string): this {
    return this.type("warning")
      .header(TYPE_EMOJIS.warning, title)
      .text(detail || "")
  }

  /**
   * Quick info message
   */
  info(title: string, detail?: string): this {
    return this.type("info")
      .header(TYPE_EMOJIS.info, title)
      .text(detail || "")
  }

  // ============================================
  // User Input Handling
  // ============================================

  /**
   * Add sanitized user input to the message
   * Automatically escapes HTML
   */
  userInput(content: string): this {
    if (content) {
      const sanitized = sanitizeUserInput(content)
      this._body.push({ content: sanitized })
    }
    return this
  }

  /**
   * Quote user text (for error messages showing what user said)
   */
  quote(text: string): this {
    const sanitized = sanitizeUserInput(text)
    this._body.push({ content: `"${sanitized}"` })
    return this
  }

  // ============================================
  // Build Methods
  // ============================================

  /**
   * Build the final message
   */
  build(): BuilderResult {
    const message: BaseMessage = {
      type: this._type,
      header: this._header || { title: "" },
      body: this._body.length === 0 ? "" : this._body,
      footer: this._footer || undefined,
      direction: this._direction,
    }

    const content = this.adapter.format(message)

    return {
      content,
      parseMode: this.getParseMode(),
      message,
    }
  }

  /**
   * Build and return just the string content
   */
  toString(): string {
    return this.build().content
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private getParseMode(): string | undefined {
    switch (this.channel) {
      case "telegram":
        return "HTML"
      case "whatsapp":
        return // WhatsApp uses its own formatting
      case "web":
        return "html"
      default:
        return
    }
  }

  private formatEventTime(event: CalendarEvent): string {
    if (event.isAllDay) {
      return "All day"
    }

    const start = new Date(event.start)
    const end = new Date(event.end)

    return `${this.formatTime(start)} - ${this.formatTime(end)}`
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  private formatDate(date: Date | string): string {
    const d = new Date(date)
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  private getEventEmoji(event: CalendarEvent): string {
    // Could be enhanced with calendar-based or time-based emoji selection
    const hour = new Date(event.start).getHours()

    if (hour < 9) {
      return "🌅" // Early morning
    }
    if (hour < 12) {
      return "☀️" // Morning
    }
    if (hour < 14) {
      return "🍽️" // Lunch time
    }
    if (hour < 17) {
      return "💼" // Afternoon
    }
    if (hour < 20) {
      return "🌆" // Evening
    }
    return "🌙" // Night
  }
}
