/**
 * Type definitions for API requests and responses
 * Based on backend types and Google Calendar API types
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

