/**
 * Parse natural language date expressions into Date objects
 * Supports: "today", "yesterday", "this week", "last week", "next week",
 * "this month", "last month", "next month", "this year", etc.
 */
export function parseNaturalLanguageDate(expression: string, referenceDate: Date = new Date()): { start: Date; end: Date } | null {
  const lower = expression.toLowerCase().trim();
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  // Today
  if (lower === "today" || lower === "this day") {
    const start = new Date(today);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Yesterday
  if (lower === "yesterday") {
    const start = new Date(today);
    start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // This week (Monday to Sunday)
  if (lower === "this week" || lower === "current week") {
    const start = new Date(today);
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Last week
  if (lower === "last week" || lower === "previous week") {
    const start = new Date(today);
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) - 7; // Previous Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Next week
  if (lower === "next week") {
    const start = new Date(today);
    const dayOfWeek = start.getDay();
    const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + 7; // Next Monday
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // This month
  if (lower === "this month" || lower === "current month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Last month
  if (lower === "last month" || lower === "previous month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Next month
  if (lower === "next month") {
    const start = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(today.getFullYear(), today.getMonth() + 2, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }

  // Last N days
  const lastDaysMatch = lower.match(/^last (\d+) days?$/);
  if (lastDaysMatch) {
    const days = parseInt(lastDaysMatch[1], 10);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  // Last N weeks
  const lastWeeksMatch = lower.match(/^last (\d+) weeks?$/);
  if (lastWeeksMatch) {
    const weeks = parseInt(lastWeeksMatch[1], 10);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setDate(start.getDate() - weeks * 7 + 1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  // Last N months
  const lastMonthsMatch = lower.match(/^last (\d+) months?$/);
  if (lastMonthsMatch) {
    const months = parseInt(lastMonthsMatch[1], 10);
    const end = new Date(today);
    end.setHours(23, 59, 59, 999);
    const start = new Date(end);
    start.setMonth(start.getMonth() - months);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  // Try to parse as ISO date
  try {
    const date = new Date(expression);
    if (!isNaN(date.getTime())) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
  } catch {
    // Not a valid date
  }

  return null;
}

/**
 * Extract date range from natural language query
 * Returns parsed dates or null if not found
 */
export function extractDateRangeFromQuery(query: string, referenceDate: Date = new Date()): { start: Date; end: Date } | null {
  // Common patterns
  const patterns = [
    /(?:for|in|during|over)\s+(today|yesterday|this week|last week|next week|this month|last month|next month)/i,
    /(?:for|in|during|over)\s+(last \d+ days?|last \d+ weeks?|last \d+ months?)/i,
    /(?:from|since)\s+([^to]+)\s+to\s+(.+)/i,
    /(today|yesterday|this week|last week|next week|this month|last month|next month)/i,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match) {
      if (match[1] && match[2]) {
        // "from X to Y" pattern
        const startDate = parseNaturalLanguageDate(match[1].trim(), referenceDate);
        const endDate = parseNaturalLanguageDate(match[2].trim(), referenceDate);
        if (startDate && endDate) {
          return { start: startDate.start, end: endDate.end };
        }
      } else {
        // Single date expression
        const dateRange = parseNaturalLanguageDate(match[1] || match[0], referenceDate);
        if (dateRange) {
          return dateRange;
        }
      }
    }
  }

  return null;
}

