/**
 * Type definitions for API requests and responses
 *
 * NOTE: These types are maintained for backward compatibility.
 * Once types are generated from the OpenAPI schema (run: npm run generate:types),
 * prefer using types from '@/types/api' which are auto-generated from the backend.
 *
 * To generate types:
 *   1. Start the backend server (npm run dev in be/)
 *   2. Run: npm run generate:types
 *   3. Import types from '@/types/api' instead
 */

// Re-export generated types when available (after running generate:types)
// These will be available once types are generated from OpenAPI schema
// import type { paths, components } from "@/types/api";

/**
 * Legacy type definitions (maintained for backward compatibility)
 * These will eventually be replaced by generated types from OpenAPI schema
 */

/**
 * Calendar Event Date/Time
 */
export interface EventDateTime {
  date?: string; // ISO date string (YYYY-MM-DD)
  dateTime?: string; // ISO datetime string
  timeZone?: string;
}

/**
 * Calendar Event Reminder
 */
export interface EventReminder {
  method?: "email" | "popup";
  minutes?: number;
}

/**
 * Calendar Event Parameters
 */
export interface EventParameters {
  summary?: string | null;
  description?: string | null;
  start?: EventDateTime;
  end?: EventDateTime;
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  reminders?: {
    useDefault?: boolean;
    overrides?: EventReminder[];
  };
  colorId?: string;
  calendarId?: string;
  email?: string;
}

/**
 * Calendar List Entry
 */
export interface CalendarInfo {
  calendarName: string | null;
  calendarId: string | null;
  calendarColorForEvents: string | null;
  accessRole: string | null;
  timeZoneForCalendar: string | null;
  defaultReminders?: EventReminder[];
}

/**
 * Calendar Event (full event object)
 */
export interface CalendarEvent {
  id?: string;
  summary?: string | null;
  description?: string | null;
  start?: EventDateTime;
  end?: EventDateTime;
  location?: string;
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: "needsAction" | "declined" | "tentative" | "accepted";
  }>;
  reminders?: {
    useDefault?: boolean;
    overrides?: EventReminder[];
  };
  colorId?: string;
  status?: "confirmed" | "tentative" | "cancelled";
  htmlLink?: string;
  created?: string;
  updated?: string;
  [key: string]: unknown;
}

/**
 * Calendar Colors
 */
export interface CalendarColors {
  calendar?: Record<string, { background: string; foreground: string }>;
  event?: Record<string, { background: string; foreground: string }>;
}

/**
 * Calendar Timezone Settings
 */
export interface CalendarTimezone {
  value?: string;
  kind?: string;
  etag?: string;
}

/**
 * Calendar Overview
 */
export interface CalendarOverview {
  id?: string;
  summary?: string;
  description?: string;
  timeZone?: string;
  location?: string;
  [key: string]: unknown;
}

/**
 * User Information
 */
export interface UserInfo {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Sign Up Request
 */
export interface SignUpRequest {
  email: string;
  password: string;
}

/**
 * Sign In Request
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Verify Email OTP Request
 */
export interface VerifyEmailOtpRequest {
  email: string;
  token: string;
}

/**
 * Deactivate User Request
 */
export interface DeactivateUserRequest {
  email: string;
}

/**
 * Agent Name Response
 */
export interface AgentNameResponse {
  agent_name: string | null;
}

/**
 * Event Query Parameters
 */
export interface EventQueryParams {
  calendarId?: string;
  timeMin?: string; // ISO datetime string
  timeMax?: string; // ISO datetime string
  maxResults?: number;
  singleEvents?: boolean;
  orderBy?: "startTime" | "updated";
  q?: string; // Search query
  showDeleted?: boolean;
  [key: string]: string | number | boolean | undefined;
}

/**
 * WhatsApp Notification Query Parameters
 */
export interface WhatsAppQueryParams {
  "hub.mode"?: string;
  "hub.challenge"?: string;
  "hub.verify_token"?: string;
}
