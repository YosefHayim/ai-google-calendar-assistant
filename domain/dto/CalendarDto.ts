/**
 * Calendar Data Transfer Object Types
 * Used for serialization/deserialization of Calendar entity
 */

import type { CalendarSettings } from "../entities/Calendar";

export interface CalendarDto {
  id: string;
  name: string;
  ownerId: string;
  settings: CalendarSettings;
  isDefault: boolean;
  accessRole: "owner" | "writer" | "reader" | "freeBusyReader";
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

/**
 * Type guard to check if an object is a valid CalendarDto
 */
export function isCalendarDto(obj: unknown): obj is CalendarDto {
  if (!obj || typeof obj !== "object") {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.ownerId === "string" &&
    typeof candidate.settings === "object" &&
    typeof candidate.isDefault === "boolean" &&
    typeof candidate.accessRole === "string"
  );
}
