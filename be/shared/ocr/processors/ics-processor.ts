import ICAL from "ical.js"
import { logger } from "@/lib/logger"
import type { ExtractedEvent, FileProcessorResult } from "../types"

const LOG_PREFIX = "[ICSProcessor]"
const RADIX_36 = 36
const RANDOM_START = 2
const RANDOM_END = 8
const MAILTO_PATTERN = /^mailto:/i

const generateEventId = (): string => {
  const timestamp = Date.now().toString(RADIX_36)
  const random = Math.random()
    .toString(RADIX_36)
    .substring(RANDOM_START, RANDOM_END)
  return `ics-${timestamp}-${random}`
}

const formatRecurrence = (rrule: ICAL.Recur | null): string | null => {
  if (!rrule) {
    return null
  }
  return rrule.toString()
}

const extractAttendees = (vevent: ICAL.Event): string[] | null => {
  try {
    const attendees = vevent.attendees
    if (!attendees || attendees.length === 0) {
      return null
    }

    return attendees
      .map((a: ICAL.Property) => {
        const val = a.getFirstValue()
        if (typeof val === "string") {
          return val.replace(MAILTO_PATTERN, "")
        }
        return ""
      })
      .filter(Boolean)
  } catch {
    return null
  }
}

const parseVEvent = (veventComp: ICAL.Component): ExtractedEvent | null => {
  try {
    const vevent = new ICAL.Event(veventComp)
    const startDate = vevent.startDate
    const endDate = vevent.endDate

    if (!startDate) {
      return null
    }

    const recurrence = formatRecurrence(
      vevent.component.getFirstPropertyValue("rrule")
    )
    const attendees = extractAttendees(vevent)

    return {
      id: generateEventId(),
      title: vevent.summary || "Untitled Event",
      description: vevent.description || "",
      startTime: startDate.toJSDate().toISOString(),
      endTime: endDate ? endDate.toJSDate().toISOString() : "",
      location: vevent.location || "",
      isAllDay: startDate.isDate,
      recurrence: recurrence || "",
      attendees: attendees || [],
      confidence: "high",
      source: "ocr",
    }
  } catch (eventError) {
    logger.warn(`${LOG_PREFIX} Failed to parse event:`, eventError)
    return null
  }
}

export const processICSFile = (icsContent: string): FileProcessorResult => {
  try {
    const jcalData = ICAL.parse(icsContent)
    const comp = new ICAL.Component(jcalData)
    const vevents = comp.getAllSubcomponents("vevent")

    const events = vevents
      .map(parseVEvent)
      .filter((e): e is ExtractedEvent => e !== null)

    logger.info(`${LOG_PREFIX} Extracted ${events.length} events from ICS file`)

    return {
      success: true,
      extractedEvents: events,
    }
  } catch (error) {
    logger.error(`${LOG_PREFIX} Failed to parse ICS file:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse ICS file",
    }
  }
}

export const processICSBuffer = (buffer: Buffer): FileProcessorResult => {
  const content = buffer.toString("utf-8")
  return processICSFile(content)
}
