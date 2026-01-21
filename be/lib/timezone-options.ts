import { TIMEZONE } from "@/config/constants/timezone";

export type TimezoneOption = {
  value: string;
  label: string;
};

/**
 * Formats a timezone identifier into a human-readable label.
 *
 * Converts IANA timezone identifiers (like "America/New_York") into user-friendly
 * labels (like "New York (America)"). Handles special cases like "Etc/UTC" and
 * "CET" with appropriate abbreviations.
 *
 * @param tz - The IANA timezone identifier (e.g., "America/New_York", "Europe/London")
 * @returns A formatted, human-readable timezone label
 *
 * @example
 * formatTimezoneLabel("America/New_York") // "New York (America)"
 * formatTimezoneLabel("Etc/UTC") // "UTC"
 * formatTimezoneLabel("CET") // "CET (Central European Time)"
 */
function formatTimezoneLabel(tz: string): string {
  if (tz === "Etc/UTC") {
    return "UTC";
  }
  if (tz === "CET") {
    return "CET (Central European Time)";
  }

  const parts = tz.split("/");
  if (parts.length === 1) {
    return tz;
  }

  const region = parts[0];
  const city = parts.slice(1).join(" / ").replace(/_/g, " ");

  return `${city} (${region})`;
}

/**
 * Returns a sorted array of all supported timezone options.
 *
 * Generates timezone options from the TIMEZONE constants, formatting each
 * timezone identifier into a human-readable label. Results are sorted
 * alphabetically by label for consistent UI presentation.
 *
 * @returns Array of timezone options with value (IANA identifier) and label (formatted name)
 *
 * @example
 * ```typescript
 * const options = getTimezoneOptions();
 * // Returns: [{ value: "America/New_York", label: "New York (America)" }, ...]
 * ```
 */
export function getTimezoneOptions(): TimezoneOption[] {
  return Object.values(TIMEZONE)
    .map((tz) => ({
      value: tz,
      label: formatTimezoneLabel(tz),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
