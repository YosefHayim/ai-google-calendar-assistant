/**
 * Event Data Transfer Object Types
 * Used for serialization/deserialization of Event entity
 */

import type {
  EventDateTime,
  EventAttendee,
  EventReminder,
  EventRecurrence,
} from "../entities/Event";

export interface EventDto {
  id: string;
  summary: string;
  start: EventDateTime;
  end: EventDateTime;
  description?: string;
  location?: string;
  attendees?: EventAttendee[];
  recurrence?: EventRecurrence;
  reminders?: EventReminder[];
  status?: "confirmed" | "tentative" | "cancelled";
  visibility?: "default" | "public" | "private" | "confidential";
  calendarId?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Type guard to check if an object is a valid EventDto
 */
export function isEventDto(obj: unknown): obj is EventDto {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.summary === "string" &&
    typeof candidate.start === "object" &&
    typeof candidate.end === "object"
  );
}
