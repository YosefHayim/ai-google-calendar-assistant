// src/utils/format-date.ts

import { logger } from "../logger";

const formatDate = (date: Date | string | null | undefined, withTime = false, desiredLanguage = "he-IL"): string => {
  if (!date) {
    logger.error(`Date: formatDate called: date not found`);
    return "Invalid date";
  }

  let parsed: Date;
  if (typeof date === "string") {
    parsed = new Date(date);
  } else if (date instanceof Date) {
    parsed = date;
  } else {
    logger.error(`Date: formatDate called: invalid date`);
    return "Invalid date";
  }

  if (Number.isNaN(parsed.getTime())) {
    logger.error(`Date: formatDate called: invalid date`);
    return "Invalid date";
  }

  if (withTime) {
    return parsed.toLocaleDateString(desiredLanguage, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    });
  }
  const formattedDate = parsed.toLocaleDateString(desiredLanguage, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return formattedDate;
};

export default formatDate;
