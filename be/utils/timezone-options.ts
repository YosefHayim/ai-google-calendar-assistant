import { TIMEZONE } from "@/config/constants/timezone"

export type TimezoneOption = {
  value: string
  label: string
}

function formatTimezoneLabel(tz: string): string {
  if (tz === "Etc/UTC") {
    return "UTC"
  }
  if (tz === "CET") {
    return "CET (Central European Time)"
  }

  const parts = tz.split("/")
  if (parts.length === 1) {
    return tz
  }

  const region = parts[0]
  const city = parts.slice(1).join(" / ").replace(/_/g, " ")

  return `${city} (${region})`
}

export function getTimezoneOptions(): TimezoneOption[] {
  return Object.values(TIMEZONE)
    .map((tz) => ({
      value: tz,
      label: formatTimezoneLabel(tz),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
}
