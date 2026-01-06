/**
 * RTL/LTR Handler Utility
 * Handles bidirectional text for Hebrew and other RTL languages
 */

import type { TextDirection, RtlStrategy } from "./types";

/**
 * Unicode directional markers
 */
export const UNICODE_MARKERS = {
  /** Left-to-Right Mark - invisible character that forces LTR */
  LRM: "\u200E",
  /** Right-to-Left Mark - invisible character that forces RTL */
  RLM: "\u200F",
  /** Left-to-Right Embedding */
  LRE: "\u202A",
  /** Right-to-Left Embedding */
  RLE: "\u202B",
  /** Pop Directional Formatting */
  PDF: "\u202C",
  /** Left-to-Right Override */
  LRO: "\u202D",
  /** Right-to-Left Override */
  RLO: "\u202E",
  /** Left-to-Right Isolate - recommended for modern use */
  LRI: "\u2066",
  /** Right-to-Left Isolate - recommended for modern use */
  RLI: "\u2067",
  /** First Strong Isolate - auto-detect direction */
  FSI: "\u2068",
  /** Pop Directional Isolate */
  PDI: "\u2069",
} as const;

/**
 * RTL script detection patterns
 */
const RTL_PATTERN = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
const HEBREW_PATTERN = /[\u0590-\u05FF]/;
const ARABIC_PATTERN = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detect if text contains any RTL characters
 *
 * @param text - Text to check
 * @returns true if text contains RTL characters
 */
export function containsRtl(text: string): boolean {
  return RTL_PATTERN.test(text);
}

/**
 * Detect if text contains Hebrew characters
 *
 * @param text - Text to check
 * @returns true if text contains Hebrew
 */
export function containsHebrew(text: string): boolean {
  return HEBREW_PATTERN.test(text);
}

/**
 * Detect if text contains Arabic characters
 *
 * @param text - Text to check
 * @returns true if text contains Arabic
 */
export function containsArabic(text: string): boolean {
  return ARABIC_PATTERN.test(text);
}

/**
 * Detect if text is primarily RTL based on first strong directional character
 *
 * @param text - Text to analyze
 * @returns true if text starts with RTL content
 */
export function isRtlText(text: string): boolean {
  if (!text) return false;

  // Find first strong directional character
  for (const char of text) {
    if (RTL_PATTERN.test(char)) return true;
    if (/[a-zA-Z]/.test(char)) return false;
  }

  return false;
}

/**
 * Detect the dominant text direction based on character counts
 *
 * @param text - Text to analyze
 * @returns Detected direction
 */
export function detectDirection(text: string): TextDirection {
  if (!text) return "ltr";

  const rtlChars = (text.match(RTL_PATTERN) || []).length;
  const ltrChars = (text.match(/[a-zA-Z]/g) || []).length;

  if (rtlChars === 0 && ltrChars === 0) return "ltr";

  return rtlChars > ltrChars ? "rtl" : "ltr";
}

/**
 * Apply direction using Unicode isolate markers.
 * This is the modern, recommended approach for embedding directional text.
 *
 * @param text - Text to wrap
 * @param direction - Direction to apply
 * @returns Text wrapped with direction isolates
 */
export function applyUnicodeDirection(
  text: string,
  direction: TextDirection
): string {
  if (!text) return "";

  const resolvedDir = direction === "auto" ? detectDirection(text) : direction;

  if (resolvedDir === "rtl") {
    return `${UNICODE_MARKERS.RLI}${text}${UNICODE_MARKERS.PDI}`;
  }

  return `${UNICODE_MARKERS.LRI}${text}${UNICODE_MARKERS.PDI}`;
}

/**
 * Apply direction using line-based markers.
 * Adds direction markers at the start of each line for consistent rendering.
 *
 * @param text - Text to process
 * @param direction - Direction to apply
 * @returns Text with per-line direction markers
 */
export function applyLineBasedDirection(
  text: string,
  direction: TextDirection
): string {
  if (!text) return "";

  if (direction === "auto") {
    // Apply per-line direction detection
    return text
      .split("\n")
      .map((line) => {
        const lineDir = detectDirection(line);
        const marker =
          lineDir === "rtl" ? UNICODE_MARKERS.RLM : UNICODE_MARKERS.LRM;
        return `${marker}${line}`;
      })
      .join("\n");
  }

  const marker =
    direction === "rtl" ? UNICODE_MARKERS.RLM : UNICODE_MARKERS.LRM;

  return text
    .split("\n")
    .map((line) => `${marker}${line}`)
    .join("\n");
}

/**
 * Main RTL application function.
 * Applies direction based on the configured strategy.
 *
 * @param text - Text to process
 * @param direction - Direction to apply
 * @param strategy - Strategy to use
 * @returns Processed text with direction markers
 */
export function applyRtl(
  text: string,
  direction: TextDirection,
  strategy: RtlStrategy
): string {
  if (!text) return "";

  // If no RTL content and direction is auto/ltr, skip processing
  if (direction !== "rtl" && !containsRtl(text)) {
    return text;
  }

  switch (strategy) {
    case "unicode-markers":
      return applyUnicodeDirection(text, direction);

    case "line-based":
      return applyLineBasedDirection(text, direction);

    case "both":
      // Apply both strategies for maximum compatibility
      let result = applyLineBasedDirection(text, direction);
      result = applyUnicodeDirection(result, direction);
      return result;

    default:
      return text;
  }
}

/**
 * Wrap mixed-direction content safely.
 * Use for embedding LTR content in RTL context or vice versa.
 *
 * @param text - Text to isolate
 * @param direction - Direction of the text
 * @returns Text wrapped in isolate markers
 */
export function isolateDirection(
  text: string,
  direction: TextDirection
): string {
  const resolvedDir = direction === "auto" ? detectDirection(text) : direction;
  const marker =
    resolvedDir === "rtl" ? UNICODE_MARKERS.RLI : UNICODE_MARKERS.LRI;
  return `${marker}${text}${UNICODE_MARKERS.PDI}`;
}

/**
 * Format a label-value pair for RTL-safe display.
 * Forces values on new lines to avoid bidirectional mixing.
 *
 * @param label - The label (e.g., "Name:")
 * @param value - The value (e.g., user input, possibly in Hebrew)
 * @param labelDirection - Direction of the label
 * @returns Formatted string safe for mixed RTL/LTR content
 */
export function formatLabelValue(
  label: string,
  value: string,
  labelDirection: TextDirection = "ltr"
): string {
  const isolatedLabel = isolateDirection(label, labelDirection);
  const isolatedValue = isolateDirection(value, "auto");
  return `${isolatedLabel}\n${isolatedValue}`;
}

/**
 * Format an inline label-value pair with proper isolates.
 * Use when you want label: value on the same line.
 *
 * @param label - The label
 * @param value - The value
 * @returns Formatted inline string
 */
export function formatInlineLabelValue(label: string, value: string): string {
  return `${isolateDirection(label, "ltr")} ${isolateDirection(value, "auto")}`;
}
