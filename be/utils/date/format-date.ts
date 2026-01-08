import { isValid, parseISO } from "date-fns"
import { logger } from "../logger"

const formatDate = (
  date: Date | string | null | undefined,
  withTime = false,
  desiredLanguage = "he-IL",
): string => {
  if (!date) {
    logger.error("Date: formatDate called: date not found")
    return "Invalid date"
  }

  let parsed: Date
  if (typeof date === "string") {
    parsed = parseISO(date)
    if (!isValid(parsed)) {
      parsed = new Date(date)
    }
  } else if (date instanceof Date) {
    parsed = date
  } else {
    logger.error("Date: formatDate called: invalid date")
    return "Invalid date"
  }

  if (!isValid(parsed)) {
    logger.error("Date: formatDate called: invalid date")
    return "Invalid date"
  }

  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  if (withTime) {
    options.hour = "numeric"
    options.minute = "numeric"
  }

  return parsed.toLocaleDateString(desiredLanguage, options)
}

export default formatDate
