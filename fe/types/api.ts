export interface ApiResponse<T> {
  status: "success" | "error";
  message: string;
  data: T | null;
}

export interface User {
  id: string;
  email: string;
  user_metadata: Record<string, any>;
  aud: string;
  confirmed_at: string;
  created_at: string;
  updated_at: string;
}

export interface CustomUser {
  id: string;
  email: string;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthData {
  user: User;
  session: Session;
}

export interface CustomCalendar {
  calendarId: string;
  calendarName: string | null;
  calendarDescription: string | null;
  calendarLocation: string | null;
  calendarColorForEvents: string | null;
  accessRole: string | null;
  timeZoneForCalendar: string | null;
  defaultReminders?: EventReminder[];
}

export interface EventReminder {
  method: "email" | "popup";
  minutes: number;
}

export interface EventDateTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

export interface Attendee {
  id?: string;
  email: string;
  displayName?: string;
  organizer?: boolean;
  self?: boolean;
  responseStatus: "needsAction" | "declined" | "tentative" | "accepted";
  optional?: boolean;
}

export interface CalendarEvent {
  kind: "calendar#event";
  id: string;
  etag: string;
  status: "confirmed" | "tentative" | "cancelled";
  htmlLink: string;
  summary: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator: { email: string };
  organizer: { email: string };
  start: EventDateTime;
  end: EventDateTime;
  attendees?: Attendee[];
  reminders: { useDefault: boolean; overrides?: EventReminder[] };
  created: string;
  updated: string;
}

export interface CustomEvent {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
}

// Event query parameters
export interface EventQueryParams {
  calendarId?: string;
  timeMin?: string;
  timeMax?: string;
  maxResults?: number;
  orderBy?: string;
  singleEvents?: boolean;
}

// Analytics response
export interface EventAnalytics {
  allEvents: CalendarEvent[][];
}

// Quick add request
export interface QuickAddEventRequest {
  text: string;
  calendarId?: string;
}

// Move event request
export interface MoveEventRequest {
  eventId: string;
  destination: string;
  calendarId?: string;
}

// Watch events request
export interface WatchEventsRequest {
  id: string;
  type: string;
  address: string;
  calendarId?: string;
}

// Create event request
export interface CreateEventRequest {
  summary: string;
  description?: string;
  location?: string;
  start: EventDateTime;
  end: EventDateTime;
  attendees?: Attendee[];
  reminders?: { useDefault: boolean; overrides?: EventReminder[] };
  calendarId?: string;
  email?: string;
}

// Update event request
export interface UpdateEventRequest {
  summary?: string;
  description?: string;
  location?: string;
  start?: EventDateTime;
  end?: EventDateTime;
  attendees?: Attendee[];
  reminders?: { useDefault: boolean; overrides?: EventReminder[] };
}

// Create calendar request
export interface CreateCalendarRequest {
  summary: string;
  description?: string;
  location?: string;
  timeZone?: string;
}

// Create calendar response
export interface CreateCalendarResponse {
  kind: "calendar#calendar";
  etag: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  timeZone?: string;
}

// Calendar colors response
export interface CalendarColors {
  [key: string]: {
    background: string;
    foreground: string;
  };
}

// Timezone info response
export interface TimezoneInfo {
  value: string;
}

// Free/busy response
export interface FreeBusyResponse {
  [calendarId: string]: {
    busy: Array<{
      start: string;
      end: string;
    }>;
  };
}

// Calendar list response
export interface CalendarListResponse {
  kind: "calendar#calendarList";
  etag: string;
  nextSyncToken?: string;
  items: CalendarListEntry[];
}

export interface CalendarListEntry {
  kind: "calendar#calendarListEntry";
  etag: string;
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole?: string;
  defaultReminders?: EventReminder[];
  primary?: boolean;
}