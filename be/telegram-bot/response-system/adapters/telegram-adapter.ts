/**
 * Telegram Channel Adapter
 * Formats messages using Telegram's HTML subset
 */

import { defaultConfig } from "../core/config";
import { escapeHtml } from "../core/html-escaper";
import { applyRtl } from "../core/rtl-handler";
import type {
  BaseMessage,
  BodySection,
  ChannelAdapter,
  ListItem,
  MessageFooter,
  MessageHeader,
  ResponseConfig,
  TextDirection,
} from "../core/types";

export class TelegramAdapter implements ChannelAdapter {
  readonly channel = "telegram" as const;

  private readonly config: ResponseConfig;

  constructor(config?: Partial<ResponseConfig>) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Format a complete message for Telegram
   */
  format(message: BaseMessage): string {
    const parts: string[] = [];

    // Format header
    if (message.header?.title) {
      parts.push(this.formatHeader(message.header));
    }

    // Format body
    if (message.body) {
      const bodyContent = this.formatBody(message.body);
      if (bodyContent) {
        parts.push(bodyContent);
      }
    }

    // Format footer
    if (message.footer) {
      const footerContent = this.formatFooter(message.footer);
      if (footerContent) {
        parts.push(footerContent);
      }
    }

    let result = parts.filter(Boolean).join("\n\n");

    // Apply RTL handling if needed
    const direction = message.direction || this.config.defaultDirection;
    if (direction !== "ltr") {
      result = this.applyDirection(result, direction);
    }

    return result;
  }

  /**
   * Format the message header
   */
  private formatHeader(header: MessageHeader): string {
    const parts: string[] = [];

    if (header.emoji) {
      parts.push(`${header.emoji} ${this.bold(header.title)}`);
    } else {
      parts.push(this.bold(header.title));
    }

    if (header.subtitle) {
      parts.push(header.subtitle);
    }

    return parts.join("\n");
  }

  /**
   * Format the message body
   */
  private formatBody(body: string | BodySection[]): string {
    if (typeof body === "string") {
      return body;
    }

    return body
      .map((section) => this.formatSection(section))
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Format a body section
   */
  private formatSection(section: BodySection): string {
    const parts: string[] = [];

    // Section header
    if (section.title) {
      const headerText = section.emoji
        ? `${section.emoji} ${this.bold(section.title)}`
        : this.bold(section.title);
      parts.push(headerText);
    }

    // Section content
    if (typeof section.content === "string") {
      if (section.content) {
        parts.push(section.content);
      }
    } else if (section.content.length > 0) {
      parts.push(this.formatList(section.content));
    }

    // Add separator if requested
    if (section.separator) {
      parts.push(this.getSectionSeparator());
    }

    return parts.join("\n");
  }

  /**
   * Format a list of items
   */
  private formatList(items: ListItem[]): string {
    return items
      .map((item, index) => this.formatListItem(item, index))
      .join("\n");
  }

  /**
   * Format a single list item
   */
  private formatListItem(item: ListItem, index: number): string {
    let bullet: string;

    switch (item.bullet) {
      case "dot":
        bullet = "•";
        break;
      case "dash":
        bullet = "—";
        break;
      case "number":
        bullet = `${index + 1}.`;
        break;
      case "emoji":
        bullet = item.bulletEmoji || "▪️";
        break;
      case "none":
        bullet = "";
        break;
      default:
        bullet = "•";
    }

    let text = item.emphasis ? this.bold(item.text) : item.text;

    if (item.detail) {
      text += ` ${this.italic(item.detail)}`;
    }

    return bullet ? `${bullet} ${text}` : text;
  }

  /**
   * Format the message footer
   */
  private formatFooter(footer: MessageFooter): string {
    const parts: string[] = [];

    if (footer.tip) {
      parts.push(this.italic(`💡 ${footer.tip}`));
    }

    if (footer.nextSteps && footer.nextSteps.length > 0) {
      parts.push(footer.nextSteps.map((step) => `• ${step}`).join("\n"));
    }

    if (footer.closing) {
      parts.push(this.italic(footer.closing));
    }

    return parts.join("\n");
  }

  // ============================================
  // ChannelAdapter Interface Methods
  // ============================================

  bold(text: string): string {
    return `<b>${text}</b>`;
  }

  italic(text: string): string {
    return `<i>${text}</i>`;
  }

  code(text: string): string {
    return `<code>${escapeHtml(text)}</code>`;
  }

  link(href: string, text: string): string {
    return `<a href="${escapeHtml(href)}">${escapeHtml(text)}</a>`;
  }

  escapeHtml(text: string): string {
    return escapeHtml(text);
  }

  applyDirection(text: string, direction: TextDirection): string {
    return applyRtl(text, direction, this.config.rtlStrategy);
  }

  getLineSeparator(): string {
    return "\n";
  }

  getSectionSeparator(): string {
    return "───────────────";
  }
}

/**
 * Create a new Telegram adapter instance
 */
export function createTelegramAdapter(
  config?: Partial<ResponseConfig>
): TelegramAdapter {
  return new TelegramAdapter(config);
}
