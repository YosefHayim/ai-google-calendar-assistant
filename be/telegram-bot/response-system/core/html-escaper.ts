/**
 * HTML Escaper Utility
 * Sanitizes user input for safe inclusion in Telegram HTML messages
 * Reference: https://core.telegram.org/bots/api#html-style
 */

/**
 * HTML entities that must be escaped in Telegram's HTML subset
 */
const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

/**
 * Escape HTML special characters in user-provided content.
 * Prevents HTML injection and parse errors in Telegram messages.
 *
 * @param text - Raw user input that may contain HTML characters
 * @returns Escaped string safe for HTML parse mode
 *
 * @example
 * escapeHtml("Use <b> for bold") // "Use &lt;b&gt; for bold"
 * escapeHtml("Tom & Jerry") // "Tom &amp; Jerry"
 */
export function escapeHtml(text: string): string {
  if (!text) return "";

  return text.replace(/[&<>"]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Escape HTML but preserve allowed Telegram tags.
 * Use when you want to allow some formatting in user content.
 *
 * @param text - Text that may contain both safe and unsafe HTML
 * @param allowedTags - Tags to preserve (default: none)
 * @returns Partially escaped string
 */
export function escapeHtmlPreserving(
  text: string,
  allowedTags: string[] = []
): string {
  if (!text) return "";

  // First, escape everything
  let escaped = escapeHtml(text);

  // Then restore allowed tags
  for (const tag of allowedTags) {
    // Match opening tags (with or without attributes)
    const openPattern = new RegExp(`&lt;${tag}(&gt;|\\s[^&]*&gt;)`, "gi");
    const closePattern = new RegExp(`&lt;/${tag}&gt;`, "gi");

    escaped = escaped.replace(openPattern, (match) => {
      return match.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
    });
    escaped = escaped.replace(closePattern, `</${tag}>`);
  }

  return escaped;
}

/**
 * Check if a string contains unescaped HTML that could break parsing.
 *
 * @param text - Text to check
 * @returns true if text contains potentially dangerous HTML
 */
export function containsUnsafeHtml(text: string): boolean {
  if (!text) return false;

  // Telegram allowed tags pattern
  const allowedPattern =
    /<\/?(b|i|u|s|code|pre|a|tg-spoiler)(\s[^>]*)?>|<a\s+href="[^"]*">/gi;
  const stripped = text.replace(allowedPattern, "");

  return /<|>/.test(stripped);
}

/**
 * Sanitize and escape user input for safe inclusion in responses.
 * This is the main function to use for any user-provided content.
 *
 * @param userInput - Raw user input
 * @returns Sanitized and escaped string
 */
export function sanitizeUserInput(userInput: string): string {
  if (!userInput) return "";

  // Trim whitespace
  let sanitized = userInput.trim();

  // Escape HTML
  sanitized = escapeHtml(sanitized);

  // Normalize excessive whitespace (but preserve single newlines for readability)
  sanitized = sanitized.replace(/[ \t]+/g, " "); // Collapse spaces/tabs
  sanitized = sanitized.replace(/\n{3,}/g, "\n\n"); // Max 2 consecutive newlines

  return sanitized;
}

/**
 * Unescape HTML entities back to their original characters.
 * Useful for displaying escaped content in non-HTML contexts.
 *
 * @param text - Escaped HTML text
 * @returns Unescaped string
 */
export function unescapeHtml(text: string): string {
  if (!text) return "";

  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}
