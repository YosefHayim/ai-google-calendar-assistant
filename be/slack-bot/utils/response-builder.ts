import type {
  ContextBlock,
  DividerBlock,
  HeaderBlock,
  KnownBlock,
  SectionBlock,
} from "@slack/web-api";

export class SlackResponseBuilder {
  private readonly blocks: KnownBlock[] = [];
  private text = "";

  header(emoji: string, text: string): this {
    const headerBlock: HeaderBlock = {
      type: "header",
      text: {
        type: "plain_text",
        text: `${emoji} ${text}`,
        emoji: true,
      },
    };
    this.blocks.push(headerBlock);
    this.text = `${emoji} ${text}`;
    return this;
  }

  section(text: string, accessory?: SectionBlock["accessory"]): this {
    const block: SectionBlock = {
      type: "section",
      text: {
        type: "mrkdwn",
        text,
      },
    };
    if (accessory) {
      block.accessory = accessory;
    }
    this.blocks.push(block);
    this.text += `\n${text}`;
    return this;
  }

  bulletList(items: string[]): this {
    const text = items.map((item) => `• ${item}`).join("\n");
    return this.section(text);
  }

  numberedList(items: string[]): this {
    const text = items.map((item, i) => `${i + 1}. ${item}`).join("\n");
    return this.section(text);
  }

  divider(): this {
    const block: DividerBlock = { type: "divider" };
    this.blocks.push(block);
    return this;
  }

  context(elements: string[]): this {
    const block: ContextBlock = {
      type: "context",
      elements: elements.map((el) => ({
        type: "mrkdwn",
        text: el,
      })),
    };
    this.blocks.push(block);
    return this;
  }

  footer(text: string): this {
    return this.context([text]);
  }

  field(label: string, value: string): this {
    return this.section(`*${label}:* ${value}`);
  }

  eventCard(event: {
    title: string;
    date?: string;
    time?: string;
    location?: string;
    calendar?: string;
  }): this {
    this.section(`*${event.title}*`);

    const fields: string[] = [];
    if (event.date) {
      fields.push(`📅 ${event.date}`);
    }
    if (event.time) {
      fields.push(`🕐 ${event.time}`);
    }
    if (event.location) {
      fields.push(`📍 ${event.location}`);
    }
    if (event.calendar) {
      fields.push(`📁 ${event.calendar}`);
    }

    if (fields.length > 0) {
      this.context(fields);
    }

    return this;
  }

  error(message: string): this {
    return this.section(`❌ ${message}`);
  }

  success(message: string): this {
    return this.section(`✅ ${message}`);
  }

  warning(message: string): this {
    return this.section(`⚠️ ${message}`);
  }

  info(message: string): this {
    return this.section(`ℹ️ ${message}`);
  }

  build(): { blocks: KnownBlock[]; text: string } {
    return {
      blocks: this.blocks,
      text: this.text,
    };
  }

  static create(): SlackResponseBuilder {
    return new SlackResponseBuilder();
  }
}

export const formatEventList = (
  events: Array<{
    summary?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    location?: string;
  }>
): { blocks: KnownBlock[]; text: string } => {
  const builder = SlackResponseBuilder.create();

  if (events.length === 0) {
    return builder.info("No events found.").build();
  }

  for (const event of events.slice(0, 10)) {
    const startTime = event.start?.dateTime || event.start?.date || "";
    const title = event.summary || "Untitled Event";

    builder.section(`• *${title}*\n  ${formatDateTime(startTime)}`);
  }

  if (events.length > 10) {
    builder.context([`...and ${events.length - 10} more events`]);
  }

  return builder.build();
};

const formatDateTime = (isoString: string): string => {
  if (!isoString) {
    return "";
  }

  try {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
};
