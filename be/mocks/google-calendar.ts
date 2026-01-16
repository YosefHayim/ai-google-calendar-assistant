import { jest } from "@jest/globals";
import type { calendar_v3 } from "googleapis";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

/**
 * Mock Google Calendar API responses and data
 */

export const mockCalendarEvent: calendar_v3.Schema$Event = {
  id: "mock-event-id-1",
  summary: "Team Standup",
  description: "Daily team synchronization meeting",
  location: "Conference Room A",
  start: {
    dateTime: "2024-01-15T09:00:00Z",
    timeZone: "America/New_York",
  },
  end: {
    dateTime: "2024-01-15T09:30:00Z",
    timeZone: "America/New_York",
  },
  attendees: [
    { email: "user1@example.com", responseStatus: "accepted" },
    { email: "user2@example.com", responseStatus: "needsAction" },
  ],
  creator: {
    email: "organizer@example.com",
    displayName: "Event Organizer",
  },
  organizer: {
    email: "organizer@example.com",
    displayName: "Event Organizer",
  },
  status: "confirmed",
  created: "2024-01-01T00:00:00Z",
  updated: "2024-01-01T00:00:00Z",
  etag: '"mock-etag-1"',
  htmlLink: "https://calendar.google.com/event?eid=mock-event-id-1",
  kind: "calendar#event",
  sequence: 0,
  reminders: {
    useDefault: true,
  },
};

export const mockRecurringEvent: calendar_v3.Schema$Event = {
  ...mockCalendarEvent,
  id: "mock-recurring-event-id",
  summary: "Weekly Standup",
  recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=MO"],
};

export const mockAllDayEvent: calendar_v3.Schema$Event = {
  ...mockCalendarEvent,
  id: "mock-all-day-event-id",
  summary: "Company Holiday",
  start: {
    date: "2024-12-25",
    timeZone: "America/New_York",
  },
  end: {
    date: "2024-12-26",
    timeZone: "America/New_York",
  },
};

export const mockEventsList: calendar_v3.Schema$Events = {
  kind: "calendar#events",
  etag: '"mock-events-list-etag"',
  summary: "Primary Calendar",
  updated: "2024-01-15T00:00:00Z",
  timeZone: "America/New_York",
  accessRole: "owner",
  defaultReminders: [],
  items: [mockCalendarEvent, mockRecurringEvent, mockAllDayEvent],
  nextPageToken: undefined,
};

export const mockCalendar: calendar_v3.Schema$Calendar = {
  id: "primary",
  summary: "Primary Calendar",
  description: "Main calendar for test user",
  timeZone: "America/New_York",
  kind: "calendar#calendar",
  etag: '"mock-calendar-etag"',
};

export const mockCalendarList: calendar_v3.Schema$CalendarList = {
  kind: "calendar#calendarList",
  etag: '"mock-calendar-list-etag"',
  items: [
    {
      id: "primary",
      summary: "Primary Calendar",
      timeZone: "America/New_York",
      accessRole: "owner",
      backgroundColor: "#9fe1e7",
      foregroundColor: "#000000",
      selected: true,
      kind: "calendar#calendarListEntry",
    },
    {
      id: "work-calendar-id",
      summary: "Work Calendar",
      timeZone: "America/New_York",
      accessRole: "owner",
      backgroundColor: "#42d692",
      foregroundColor: "#000000",
      selected: true,
      kind: "calendar#calendarListEntry",
    },
  ],
};

/**
 * Create a mock Google Calendar client with configurable responses
 */
export const createMockCalendarClient = () => {
  const mockEventsApi = {
    list: jest.fn<AnyFn>(),
    get: jest.fn<AnyFn>(),
    insert: jest.fn<AnyFn>(),
    update: jest.fn<AnyFn>(),
    patch: jest.fn<AnyFn>(),
    delete: jest.fn<AnyFn>(),
    instances: jest.fn<AnyFn>(),
    move: jest.fn<AnyFn>(),
    quickAdd: jest.fn<AnyFn>(),
    watch: jest.fn<AnyFn>(),
  };

  const mockCalendarsApi = {
    get: jest.fn<AnyFn>(),
    insert: jest.fn<AnyFn>(),
    update: jest.fn<AnyFn>(),
    patch: jest.fn<AnyFn>(),
    delete: jest.fn<AnyFn>(),
    clear: jest.fn<AnyFn>(),
  };

  const mockCalendarListApi = {
    list: jest.fn<AnyFn>(),
    get: jest.fn<AnyFn>(),
    insert: jest.fn<AnyFn>(),
    update: jest.fn<AnyFn>(),
    patch: jest.fn<AnyFn>(),
    delete: jest.fn<AnyFn>(),
    watch: jest.fn<AnyFn>(),
  };

  // Default successful responses
  mockEventsApi.list.mockResolvedValue({ data: mockEventsList });
  mockEventsApi.get.mockResolvedValue({ data: mockCalendarEvent });
  mockEventsApi.insert.mockImplementation((args: { requestBody: any }) =>
    Promise.resolve({
      data: {
        ...mockCalendarEvent,
        ...args.requestBody,
        id: `mock-event-${Date.now()}`,
      },
    })
  );
  mockEventsApi.update.mockImplementation((args: { requestBody: any }) =>
    Promise.resolve({
      data: {
        ...mockCalendarEvent,
        ...args.requestBody,
      },
    })
  );
  mockEventsApi.patch.mockImplementation((args: { requestBody: any }) =>
    Promise.resolve({
      data: {
        ...mockCalendarEvent,
        ...args.requestBody,
      },
    })
  );
  mockEventsApi.delete.mockResolvedValue({ data: {} });

  mockCalendarsApi.get.mockResolvedValue({ data: mockCalendar });
  mockCalendarListApi.list.mockResolvedValue({ data: mockCalendarList });

  return {
    events: mockEventsApi,
    calendars: mockCalendarsApi,
    calendarList: mockCalendarListApi,
  };
};

/**
 * Error scenarios for testing error handling
 */
export const createMockCalendarErrors = () => ({
  notFound: {
    code: 404,
    message: "Not Found",
    errors: [
      {
        domain: "global",
        reason: "notFound",
        message: "Not Found",
      },
    ],
  },
  unauthorized: {
    code: 401,
    message: "Unauthorized",
    errors: [
      {
        domain: "global",
        reason: "unauthorized",
        message: "Invalid Credentials",
      },
    ],
  },
  rateLimitExceeded: {
    code: 429,
    message: "Rate Limit Exceeded",
    errors: [
      {
        domain: "usageLimits",
        reason: "rateLimitExceeded",
        message: "Rate Limit Exceeded",
      },
    ],
  },
  invalidRequest: {
    code: 400,
    message: "Bad Request",
    errors: [
      {
        domain: "global",
        reason: "invalid",
        message: "Invalid request",
      },
    ],
  },
  serverError: {
    code: 500,
    message: "Internal Server Error",
    errors: [
      {
        domain: "global",
        reason: "backendError",
        message: "Internal error encountered",
      },
    ],
  },
  serviceUnavailable: {
    code: 503,
    message: "Service Unavailable",
    errors: [
      {
        domain: "global",
        reason: "backendError",
        message: "The service is currently unavailable",
      },
    ],
  },
});

/**
 * Helper to create an error response matching Google API error format
 */
export const createMockGoogleApiError = (
  errorType: keyof ReturnType<typeof createMockCalendarErrors>
) => {
  const errors = createMockCalendarErrors();
  const error = errors[errorType];
  const apiError = new Error(error.message) as Error & {
    code: number;
    errors: unknown[];
  };
  apiError.code = error.code;
  apiError.errors = error.errors;
  return apiError;
};

/**
 * Helper to create mock events with custom data
 */
export const createMockEvent = (
  overrides: Partial<calendar_v3.Schema$Event> = {}
): calendar_v3.Schema$Event => ({
  ...mockCalendarEvent,
  ...overrides,
  id:
    overrides.id ||
    `mock-event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
});

/**
 * Helper to create mock events list with custom events
 */
export const createMockEventsList = (
  events: calendar_v3.Schema$Event[] = [mockCalendarEvent]
): calendar_v3.Schema$Events => ({
  ...mockEventsList,
  items: events,
});

/**
 * Time/Date mocking utilities
 */
export const mockDateUtils = {
  /**
   * Create a date string in ISO format
   */
  createISODate: (daysFromNow = 0, hours = 9, minutes = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  },

  /**
   * Create a date-only string (for all-day events)
   */
  createDateOnly: (daysFromNow = 0): string => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return date.toISOString().split("T")[0];
  },

  /**
   * Create an event time range
   */
  createTimeRange: (startDaysFromNow = 0, durationMinutes = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + startDaysFromNow);
    startDate.setHours(9, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + durationMinutes);

    return {
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "America/New_York",
      },
    };
  },

  /**
   * Check if a date is in the past
   */
  isPast: (dateString: string): boolean => new Date(dateString) < new Date(),

  /**
   * Check if a date is in the future
   */
  isFuture: (dateString: string): boolean => new Date(dateString) > new Date(),
};

/**
 * Mock OAuth2 client for Google Calendar authentication
 */
export const createMockOAuth2Client = () => ({
  setCredentials: jest.fn<AnyFn>(),
  getAccessToken: jest.fn<AnyFn>().mockResolvedValue({
    token: "mock-access-token",
    res: {
      status: 200,
      data: {
        access_token: "mock-access-token",
        token_type: "Bearer",
        expiry_date: Date.now() + 3_600_000,
      },
    },
  }),
  refreshAccessToken: jest.fn<AnyFn>().mockResolvedValue({
    credentials: {
      access_token: "mock-refreshed-token",
      refresh_token: "mock-refresh-token",
      expiry_date: Date.now() + 3_600_000,
    },
  }),
  getToken: jest.fn<AnyFn>().mockResolvedValue({
    tokens: {
      access_token: "mock-access-token",
      refresh_token: "mock-refresh-token",
      expiry_date: Date.now() + 3_600_000,
    },
  }),
  generateAuthUrl: jest
    .fn<AnyFn>()
    .mockReturnValue("https://accounts.google.com/o/oauth2/v2/auth?mock=true"),
  _clientId: "mock-client-id",
  _clientSecret: "mock-client-secret",
});
