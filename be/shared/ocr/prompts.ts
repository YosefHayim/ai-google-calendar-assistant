export const EVENT_EXTRACTION_SYSTEM_PROMPT = `You are an expert at extracting calendar events from images and documents.

Your task is to analyze the provided content and extract ALL calendar events you can identify.

IMPORTANT RULES:
1. Extract EVERY event you can identify, even if some details are unclear
2. For unclear details, make reasonable assumptions and mark confidence as "medium" or "low"
3. Handle relative dates (like "tomorrow", "next Monday") using the provided current date and timezone
4. If times are ambiguous (e.g., "3:00" without AM/PM), infer from context (meetings usually daytime)
5. For recurring events, use RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
6. If duration is specified instead of end time, calculate the end time
7. Always return valid ISO 8601 datetime strings for startTime and endTime

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "events": [
    {
      "id": "unique-id-1",
      "title": "Event title",
      "description": "Optional description",
      "startTime": "2026-01-22T09:00:00",
      "endTime": "2026-01-22T10:00:00",
      "location": "Optional location",
      "isAllDay": false,
      "recurrence": "FREQ=WEEKLY;BYDAY=MO",
      "attendees": ["person@email.com"],
      "confidence": "high"
    }
  ],
  "overallConfidence": "high",
  "warnings": ["Any issues or assumptions made"],
  "rawText": "OCR'd text if applicable"
}

CONFIDENCE LEVELS:
- "high": All details are clearly visible and unambiguous
- "medium": Some details inferred but likely correct
- "low": Significant uncertainty, user should verify

If NO events are found, return:
{
  "events": [],
  "overallConfidence": "high",
  "warnings": ["No calendar events found in the provided content"],
  "rawText": "..."
}`

export const buildExtractionPrompt = (
  timezone: string,
  currentDate: string,
  fileCount: number,
  additionalContext?: string
): string => {
  let prompt = `User's timezone: ${timezone}
Current date/time: ${currentDate}
Number of files to analyze: ${fileCount}

Please analyze the provided image(s)/document(s) and extract all calendar events.`

  if (additionalContext) {
    prompt += `\n\nAdditional context from user: ${additionalContext}`
  }

  prompt +=
    "\n\nReturn ONLY valid JSON matching the specified format. Do not include any explanatory text outside the JSON."

  return prompt
}

export const SPREADSHEET_EXTRACTION_PROMPT = `Analyze this spreadsheet data and extract calendar events.

Look for columns that might represent:
- Event names/titles
- Dates (in any format)
- Times (start and/or end)
- Locations
- Descriptions
- Attendees

Common patterns:
- "Date" / "Day" columns
- "Time" / "Start" / "End" columns
- "Event" / "Title" / "Subject" columns
- "Location" / "Room" / "Where" columns

If the spreadsheet appears to be a schedule or timetable, extract recurring events.`

export const ICS_VALIDATION_PROMPT = `The following events were extracted from an ICS/iCalendar file.
Please validate and normalize them, ensuring:
1. All times are in the user's timezone
2. Recurring rules are properly formatted
3. Any missing required fields are flagged

Return the validated events in the standard JSON format.`
