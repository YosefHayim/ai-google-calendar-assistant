/**
 * Data Transfer Object for Calendar Events
 */
export interface EventDTO {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
    responseStatus?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  recurrence?: string[];
  status?: string;
}

/**
 * DTO for creating a new event
 */
export interface CreateEventDTO {
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
    timeZone?: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  recurrence?: string[];
  calendarId?: string;
}

/**
 * DTO for updating an existing event
 */
export interface UpdateEventDTO extends Partial<CreateEventDTO> {
  id: string;
  calendarId?: string;
}

/**
 * DTO for custom event response format
 */
export interface CustomEventDTO {
  eventId: string;
  summary: string;
  description: string | null;
  location: string | null;
  durationOfEvent: string | null;
  start: string | null;
  end: string | null;
}

/**
 * DTO for event list response
 */
export interface EventListDTO {
  totalNumberOfEventsFound: number;
  totalEventsFound: CustomEventDTO[];
}
