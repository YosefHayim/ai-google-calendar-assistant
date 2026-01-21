/**
 * WhatsApp Response Formatter
 * Converts HTML formatting (used by Telegram) to WhatsApp's markdown-like format
 * @see https://faq.whatsapp.com/539178204879377
 */

/**
 * WhatsApp formatting rules:
 * - Bold: *text*
 * - Italic: _text_
 * - Strikethrough: ~text~
 * - Monospace: ```text```
 * - Inline code: `text`
 */

/**
 * Converts HTML tags to WhatsApp formatting
 */
export const htmlToWhatsApp = (html: string): string => {
  let result = html

  // Bold: <b> or <strong> → *text*
  result = result.replace(/<b>(.*?)<\/b>/gi, "*$1*")
  result = result.replace(/<strong>(.*?)<\/strong>/gi, "*$1*")

  // Italic: <i> or <em> → _text_
  result = result.replace(/<i>(.*?)<\/i>/gi, "_$1_")
  result = result.replace(/<em>(.*?)<\/em>/gi, "_$1_")

  // Strikethrough: <s> or <del> or <strike> → ~text~
  result = result.replace(/<s>(.*?)<\/s>/gi, "~$1~")
  result = result.replace(/<del>(.*?)<\/del>/gi, "~$1~")
  result = result.replace(/<strike>(.*?)<\/strike>/gi, "~$1~")

  // Code block: <pre> or <code> → ```text```
  result = result.replace(/<pre>(.*?)<\/pre>/gis, "```$1```")
  result = result.replace(/<code>(.*?)<\/code>/gi, "`$1`")

  // Links: <a href="url">text</a> → text (url)
  result = result.replace(
    /<a[^>]*href=["']([^"']*)["'][^>]*>(.*?)<\/a>/gi,
    "$2 ($1)"
  )

  // Line breaks: <br> or <br/> → newline
  result = result.replace(/<br\s*\/?>/gi, "\n")

  // Paragraphs: <p>text</p> → text + double newline
  result = result.replace(/<p>(.*?)<\/p>/gis, "$1\n\n")

  // Lists: <ul><li>item</li></ul> → • item
  result = result.replace(/<ul>(.*?)<\/ul>/gis, (_, content) =>
    content.replace(/<li>(.*?)<\/li>/gi, "• $1\n")
  )

  // Ordered lists: <ol><li>item</li></ol> → 1. item
  result = result.replace(/<ol>(.*?)<\/ol>/gis, (_, content) => {
    let index = 0
    return content.replace(
      /<li>(.*?)<\/li>/gi,
      (_match: string, itemContent: string) => {
        index++
        return `${index}. ${itemContent}\n`
      }
    )
  })

  // Headings: <h1-6>text</h1-6> → *TEXT* with newlines
  result = result.replace(/<h[1-6]>(.*?)<\/h[1-6]>/gi, "*$1*\n\n")

  // Blockquotes: <blockquote>text</blockquote> → > text
  result = result.replace(/<blockquote>(.*?)<\/blockquote>/gis, (_, content) =>
    content
      .split("\n")
      .map((line: string) => `> ${line}`)
      .join("\n")
  )

  // Remove any remaining HTML tags
  result = result.replace(/<[^>]*>/g, "")

  // Decode HTML entities
  result = decodeHtmlEntities(result)

  // Clean up excessive newlines
  result = result.replace(/\n{3,}/g, "\n\n")
  result = result.trim()

  return result
}

/**
 * Decodes common HTML entities
 */
const decodeHtmlEntities = (text: string): string => {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&nbsp;": " ",
    "&ndash;": "–",
    "&mdash;": "—",
    "&hellip;": "...",
    "&copy;": "©",
    "&reg;": "®",
    "&trade;": "™",
  }

  let result = text
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, "gi"), char)
  }

  // Decode numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCharCode(Number.parseInt(code, 10))
  )
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
    String.fromCharCode(Number.parseInt(code, 16))
  )

  return result
}

/**
 * Escapes special WhatsApp formatting characters
 */
export const escapeWhatsApp = (text: string): string => {
  // Escape characters that have special meaning in WhatsApp
  return text
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/~/g, "\\~")
    .replace(/`/g, "\\`")
}

/**
 * Formats a calendar event for WhatsApp display
 */
export const formatEventForWhatsApp = (event: {
  title: string
  startTime: string
  endTime?: string
  location?: string
  description?: string
}): string => {
  const lines: string[] = []

  lines.push(`*${event.title}*`)
  lines.push(
    `🗓 ${event.startTime}${event.endTime ? ` - ${event.endTime}` : ""}`
  )

  if (event.location) {
    lines.push(`📍 ${event.location}`)
  }

  if (event.description) {
    lines.push(`\n${event.description}`)
  }

  return lines.join("\n")
}

/**
 * Formats a list of events for WhatsApp display
 */
export const formatEventsListForWhatsApp = (
  events: Array<{
    title: string
    time: string
    duration?: string
  }>,
  header?: string
): string => {
  const lines: string[] = []

  if (header) {
    lines.push(`*${header}*\n`)
  }

  events.forEach((event, index) => {
    const line = `${index + 1}. *${event.title}*\n   ⏰ ${event.time}${event.duration ? ` (${event.duration})` : ""}`
    lines.push(line)
  })

  if (events.length === 0) {
    lines.push("_No events found_")
  }

  return lines.join("\n\n")
}

/**
 * Formats an error message for WhatsApp
 */
export const formatErrorForWhatsApp = (message: string): string =>
  `⚠️ ${message}`

/**
 * Formats a success message for WhatsApp
 */
export const formatSuccessForWhatsApp = (message: string): string =>
  `✅ ${message}`

/**
 * Truncates text to WhatsApp's limit while preserving word boundaries
 */
export const truncateForWhatsApp = (text: string, maxLength = 4096): string => {
  if (text.length <= maxLength) {
    return text
  }

  const truncated = text.slice(0, maxLength - 3)
  const lastSpace = truncated.lastIndexOf(" ")

  if (lastSpace > maxLength * 0.8) {
    return `${truncated.slice(0, lastSpace)}...`
  }

  return `${truncated}...`
}
