import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock functions
const mockEventsHandler = jest.fn<() => Promise<unknown>>();
const mockFetchCredentialsByEmail = jest.fn<() => Promise<unknown>>();
const mockInitUserSupabaseCalendarWithTokensAndUpdateTokens = jest.fn<() => Promise<unknown>>();
const mockGenerateGoogleAuthUrl = jest.fn<() => string>();
const mockGetEvents = jest.fn<() => Promise<unknown>>();

// Mock the utils module to prevent lodash-es import
jest.mock("@/ai-agents/utils", () => ({
  formatEventData: (event: unknown) => event,
  parseToolArguments: (params: { email?: string; calendarId?: string; eventId?: string }) => ({
    email: params.email,
    calendarId: params.calendarId || "primary",
    eventId: params.eventId,
    eventLike: params,
  }),
}));

jest.mock("@/config", () => ({
  ACTION: {
    GET: "get",
    INSERT: "insert",
    UPDATE: "update",
    PATCH: "patch",
    DELETE: "delete",
  },
  SUPABASE: {},
}));

jest.mock("@/utils/calendar", () => ({
  eventsHandler: (...args: unknown[]) => mockEventsHandler(...args),
  initUserSupabaseCalendarWithTokensAndUpdateTokens: (tokens: unknown) =>
    mockInitUserSupabaseCalendarWithTokensAndUpdateTokens(tokens),
}));

jest.mock("@/utils/auth", () => ({
  fetchCredentialsByEmail: (email: string) => mockFetchCredentialsByEmail(email),
  generateGoogleAuthUrl: (options?: unknown) => mockGenerateGoogleAuthUrl(options),
}));

jest.mock("@/utils/calendar/get-events", () => ({
  getEvents: (params: unknown) => mockGetEvents(params),
}));

jest.mock("@/utils/http", () => ({
  asyncHandler: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => fn,
}));

// Import after mocks
import { EXECUTION_TOOLS } from "@/ai-agents/tool-execution";

describe("Tool Execution", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGenerateGoogleAuthUrl.mockReturnValue("https://accounts.google.com/oauth");
  });

  describe("generateGoogleAuthUrl", () => {
    it("should return auth URL", () => {
      const result = EXECUTION_TOOLS.generateGoogleAuthUrl();

      expect(mockGenerateGoogleAuthUrl).toHaveBeenCalled();
      expect(result).toBe("https://accounts.google.com/oauth");
    });
  });

  describe("registerUser", () => {
    it("should throw error if email is missing", async () => {
      await expect(EXECUTION_TOOLS.registerUser({ email: "" })).rejects.toThrow(
        "Email is required for registration."
      );
    });

    it("should throw error for invalid email", async () => {
      await expect(EXECUTION_TOOLS.registerUser({ email: "invalid-email" })).rejects.toThrow(
        "Invalid email address."
      );
    });

    it("should return auth URL for valid email", async () => {
      const result = await EXECUTION_TOOLS.registerUser({
        email: "test@example.com",
        name: "Test User",
      });

      expect(mockGenerateGoogleAuthUrl).toHaveBeenCalledWith({ forceConsent: true });
      expect(result).toEqual({
        status: "needs_auth",
        email: "test@example.com",
        name: "Test User",
        authUrl: "https://accounts.google.com/oauth",
        message: expect.any(String),
      });
    });
  });

  describe("insertEvent", () => {
    beforeEach(() => {
      mockFetchCredentialsByEmail.mockResolvedValue({
        access_token: "token",
        refresh_token: "refresh",
      });
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue({
        settings: { get: jest.fn().mockResolvedValue({ data: { value: "America/New_York" } }) },
      });
      mockEventsHandler.mockResolvedValue({ id: "event-123" });
    });

    it("should throw error for invalid email", async () => {
      await expect(
        EXECUTION_TOOLS.insertEvent({
          email: "invalid",
          summary: "Test Event",
        })
      ).rejects.toThrow("Invalid email address.");
    });

    it("should insert event successfully", async () => {
      const result = await EXECUTION_TOOLS.insertEvent({
        email: "test@example.com",
        summary: "Team Meeting",
        description: "Weekly sync",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "insert",
        expect.objectContaining({ summary: "Team Meeting" }),
        expect.objectContaining({ email: "test@example.com" })
      );
      expect(result).toEqual({ id: "event-123" });
    });

    it("should apply default timezone for timed events", async () => {
      await EXECUTION_TOOLS.insertEvent({
        email: "test@example.com",
        summary: "Meeting",
        start: { dateTime: "2024-01-15T10:00:00" },
        end: { dateTime: "2024-01-15T11:00:00" },
      });

      expect(mockInitUserSupabaseCalendarWithTokensAndUpdateTokens).toHaveBeenCalled();
    });

    it("should not apply timezone for all-day events", async () => {
      await EXECUTION_TOOLS.insertEvent({
        email: "test@example.com",
        summary: "All Day Event",
        start: { date: "2024-01-15" },
        end: { date: "2024-01-16" },
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "insert",
        expect.objectContaining({ summary: "All Day Event" }),
        expect.any(Object)
      );
    });
  });

  describe("updateEvent", () => {
    beforeEach(() => {
      mockFetchCredentialsByEmail.mockResolvedValue({
        access_token: "token",
        refresh_token: "refresh",
      });
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue({
        settings: { get: jest.fn().mockResolvedValue({ data: { value: "America/New_York" } }) },
      });
      mockEventsHandler.mockResolvedValue({ id: "event-123", summary: "Updated" });
    });

    it("should throw error for invalid email", async () => {
      await expect(
        EXECUTION_TOOLS.updateEvent({
          email: "invalid",
          eventId: "event-123",
        })
      ).rejects.toThrow("Invalid email address.");
    });

    it("should throw error if eventId is missing", async () => {
      await expect(
        EXECUTION_TOOLS.updateEvent({
          email: "test@example.com",
          eventId: "",
        })
      ).rejects.toThrow("eventId is required for update.");
    });

    it("should update event successfully", async () => {
      const result = await EXECUTION_TOOLS.updateEvent({
        email: "test@example.com",
        eventId: "event-123",
        summary: "Updated Meeting",
        description: "New description",
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "patch",
        expect.objectContaining({ id: "event-123", summary: "Updated Meeting" }),
        expect.objectContaining({ eventId: "event-123" })
      );
      expect(result).toEqual({ id: "event-123", summary: "Updated" });
    });

    it("should throw error for invalid start dateTime", async () => {
      await expect(
        EXECUTION_TOOLS.updateEvent({
          email: "test@example.com",
          eventId: "event-123",
          start: { dateTime: "invalid-date" },
        })
      ).rejects.toThrow("Invalid start dateTime format:");
    });

    it("should throw error for invalid end dateTime", async () => {
      await expect(
        EXECUTION_TOOLS.updateEvent({
          email: "test@example.com",
          eventId: "event-123",
          end: { dateTime: "invalid-date" },
        })
      ).rejects.toThrow("Invalid end dateTime format:");
    });
  });

  describe("getEvent", () => {
    beforeEach(() => {
      mockFetchCredentialsByEmail.mockResolvedValue({
        access_token: "token",
        refresh_token: "refresh",
      });
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue({
        calendarList: {
          list: jest.fn().mockResolvedValue({
            data: { items: [{ id: "primary" }, { id: "work" }] },
          }),
        },
      });
    });

    it("should throw error for invalid email", async () => {
      await expect(
        EXECUTION_TOOLS.getEvent({ email: "invalid" })
      ).rejects.toThrow("Invalid email address.");
    });

    it("should search all calendars by default", async () => {
      mockGetEvents.mockResolvedValue({ type: "standard", data: { items: [] } });

      const result = await EXECUTION_TOOLS.getEvent({
        email: "test@example.com",
      });

      expect(mockGetEvents).toHaveBeenCalled();
      expect(result).toHaveProperty("searchedCalendars");
      expect(result).toHaveProperty("allEvents");
    });

    it("should search single calendar when searchAllCalendars is false", async () => {
      mockEventsHandler.mockResolvedValue({ items: [] });

      const result = await EXECUTION_TOOLS.getEvent({
        email: "test@example.com",
        searchAllCalendars: false,
        calendarId: "primary",
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "get",
        {},
        expect.objectContaining({ calendarId: "primary" })
      );
    });

    it("should limit events to prevent context overflow", async () => {
      const manyEvents = Array.from({ length: 150 }, (_, i) => ({
        id: `event-${i}`,
        summary: `Event ${i}`,
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      }));
      mockGetEvents.mockResolvedValue({ type: "standard", data: { items: manyEvents } });

      const result = await EXECUTION_TOOLS.getEvent({
        email: "test@example.com",
      }) as { allEvents: unknown[]; truncated: boolean };

      expect(result.allEvents.length).toBeLessThanOrEqual(100);
      expect(result.truncated).toBe(true);
    });

    it("should apply search query", async () => {
      mockGetEvents.mockResolvedValue({ type: "standard", data: { items: [] } });

      await EXECUTION_TOOLS.getEvent({
        email: "test@example.com",
        q: "meeting",
        timeMin: "2024-01-01T00:00:00Z",
        timeMax: "2024-01-31T23:59:59Z",
      });

      expect(mockGetEvents).toHaveBeenCalledWith(
        expect.objectContaining({
          extra: expect.objectContaining({ q: "meeting" }),
        })
      );
    });
  });

  describe("deleteEvent", () => {
    beforeEach(() => {
      mockEventsHandler.mockResolvedValue({ success: true });
    });

    it("should throw error for invalid email", () => {
      expect(() =>
        EXECUTION_TOOLS.deleteEvent({ email: "invalid", eventId: "event-123" })
      ).toThrow("Invalid email address.");
    });

    it("should throw error if eventId is missing", () => {
      expect(() =>
        EXECUTION_TOOLS.deleteEvent({ email: "test@example.com", eventId: "" })
      ).toThrow("Event ID is required to delete event.");
    });

    it("should delete event successfully", async () => {
      const result = await EXECUTION_TOOLS.deleteEvent({
        email: "test@example.com",
        eventId: "event-123",
        calendarId: "work",
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "delete",
        { id: "event-123" },
        { email: "test@example.com", calendarId: "work" }
      );
      expect(result).toEqual({ success: true });
    });

    it("should use primary calendar by default", async () => {
      await EXECUTION_TOOLS.deleteEvent({
        email: "test@example.com",
        eventId: "event-123",
      });

      expect(mockEventsHandler).toHaveBeenCalledWith(
        null,
        "delete",
        { id: "event-123" },
        { email: "test@example.com", calendarId: "primary" }
      );
    });
  });
});
