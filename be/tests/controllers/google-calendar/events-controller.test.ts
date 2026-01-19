import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import type { NextFunction, Request, Response } from "express";
import { mockFn } from "../../test-utils";

// Mock functions
const mockEventsHandler = mockFn();
const mockFetchCredentialsByEmail = mockFn();
const mockInitUserSupabaseCalendarWithTokensAndUpdateTokens = mockFn();
const mockGetEvents = mockFn();
const mockQuickAddWithOrchestrator = mockFn();
const mockGetCachedInsights = mockFn();
const mockSetCachedInsights = mockFn();
const mockCalculateInsightsMetrics = mockFn();
const mockGenerateInsightsWithRetry = mockFn();
const mockSendR = mockFn();

jest.mock("@/config", () => ({
  ACTION: {
    GET: "get",
    INSERT: "insert",
    UPDATE: "update",
    DELETE: "delete",
  },
  REQUEST_CONFIG_BASE: { prettyPrint: true },
  STATUS_RESPONSE: {
    SUCCESS: { code: 200, success: true },
    CREATED: { code: 201, success: true },
    BAD_REQUEST: { code: 400, success: false },
    UNAUTHORIZED: { code: 401, success: false },
    NOT_FOUND: { code: 404, success: false },
    CONFLICT: { code: 409, success: false },
    INTERNAL_SERVER_ERROR: { code: 500, success: false },
  },
}));

jest.mock("@/utils", () => ({
  eventsHandler: (...args: unknown[]) => mockEventsHandler(...args),
  formatDate: (date: Date, _includeTime?: boolean) => date.toISOString(),
}));

jest.mock("@/utils/cache/insights-cache", () => ({
  getCachedInsights: (...args: unknown[]) => mockGetCachedInsights(...args),
  setCachedInsights: (...args: unknown[]) => mockSetCachedInsights(...args),
}));

jest.mock("@/utils/http", () => ({
  sendR: (...args: unknown[]) => mockSendR(...args),
  reqResAsyncHandler:
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) =>
    (req: Request, res: Response, next: NextFunction) =>
      Promise.resolve(fn(req, res, next)).catch(next),
}));

jest.mock("@/utils/ai/insights-calculator", () => ({
  calculateInsightsMetrics: (events: unknown, calendarMap: unknown) =>
    mockCalculateInsightsMetrics(events, calendarMap),
}));

jest.mock("@/utils/ai/quick-add-orchestrator", () => ({
  quickAddWithOrchestrator: (...args: unknown[]) =>
    mockQuickAddWithOrchestrator(...args),
}));

jest.mock("@/utils/auth/get-user-calendar-tokens", () => ({
  fetchCredentialsByEmail: (email: string) =>
    mockFetchCredentialsByEmail(email),
}));

jest.mock("@/ai-agents/insights-generator", () => ({
  generateInsightsWithRetry: (...args: unknown[]) =>
    mockGenerateInsightsWithRetry(...args),
}));

jest.mock("@/utils/calendar/get-events", () => ({
  getEvents: (params: unknown) => mockGetEvents(params),
}));

jest.mock("@/utils/calendar/init", () => ({
  initUserSupabaseCalendarWithTokensAndUpdateTokens: (tokenData: unknown) =>
    mockInitUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData),
}));

// Import after mocks
import eventsController from "@/controllers/google-calendar/events-controller";

describe("Events Controller", () => {
  let mockReq: Partial<Request> & { user?: any };
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      body: {},
      query: {},
      params: {},
      user: {
        id: "user-123",
        email: "test@example.com",
        app_metadata: {},
        user_metadata: {},
        aud: "authenticated",
        created_at: new Date().toISOString(),
      },
    };
    mockRes = {
      status: mockFn().mockReturnThis() as unknown as Response["status"],
      json: mockFn().mockReturnThis() as unknown as Response["json"],
    };
    mockNext = mockFn();

    // Default mock for tokens
    mockFetchCredentialsByEmail.mockResolvedValue({
      access_token: "token",
      refresh_token: "refresh",
    });
  });

  describe("getEventById", () => {
    it("should return not found if user tokens not found", async () => {
      mockFetchCredentialsByEmail.mockResolvedValue(null);
      mockReq.params = { id: "event-123" };

      await eventsController.getEventById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "User tokens are not found."
      );
    });

    it("should return bad request if event ID is missing", async () => {
      mockReq.params = {};

      await eventsController.getEventById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Event ID is required in order to get specific event."
      );
    });

    it("should get event by ID successfully", async () => {
      mockReq.params = { id: "event-123" };
      mockReq.query = { calendarId: "primary" };
      const mockCalendar = {
        events: {
          get: mockFn().mockResolvedValue({
            data: { id: "event-123", summary: "Test Event" },
          }),
        },
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );

      await eventsController.getEventById(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCalendar.events.get).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: "event-123", calendarId: "primary" })
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event retrieved successfully",
        expect.objectContaining({ id: "event-123" })
      );
    });
  });

  describe("getAllEvents", () => {
    it("should return not found if user tokens not found", async () => {
      mockFetchCredentialsByEmail.mockResolvedValue(null);

      await eventsController.getAllEvents(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "User tokens not found."
      );
    });

    it("should get all events successfully", async () => {
      const mockEvents = [{ id: "event-1" }, { id: "event-2" }];
      mockEventsHandler.mockResolvedValue(mockEvents);

      await eventsController.getAllEvents(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockEventsHandler).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Successfully retrieved all events",
        mockEvents
      );
    });
  });

  describe("createEvent", () => {
    it("should create event successfully", async () => {
      mockReq.body = {
        summary: "New Event",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };
      const mockCreatedEvent = { id: "new-event-123", summary: "New Event" };
      mockEventsHandler.mockResolvedValue(mockCreatedEvent);

      await eventsController.createEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockEventsHandler).toHaveBeenCalledWith(
        mockReq,
        "insert",
        mockReq.body,
        expect.any(Object)
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 201 }),
        "Event created successfully",
        mockCreatedEvent
      );
    });
  });

  describe("updateEvent", () => {
    it("should update event successfully", async () => {
      mockReq.params = { id: "event-123" };
      mockReq.body = { summary: "Updated Event" };
      const mockUpdatedEvent = { id: "event-123", summary: "Updated Event" };
      mockEventsHandler.mockResolvedValue(mockUpdatedEvent);

      await eventsController.updateEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockEventsHandler).toHaveBeenCalledWith(
        mockReq,
        "update",
        expect.objectContaining({ id: "event-123", summary: "Updated Event" })
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event updated successfully",
        mockUpdatedEvent
      );
    });
  });

  describe("deleteEvent", () => {
    it("should delete event successfully", async () => {
      mockReq.params = { id: "event-123" };
      mockEventsHandler.mockResolvedValue({ success: true });

      await eventsController.deleteEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockEventsHandler).toHaveBeenCalledWith(mockReq, "delete", {
        id: "event-123",
      });
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event deleted successfully",
        { success: true }
      );
    });
  });

  describe("quickAddEvent", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;

      await eventsController.quickAddEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated."
      );
    });

    it("should return bad request if text is missing", async () => {
      mockReq.body = {};

      await eventsController.quickAddEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Event text is required."
      );
    });

    it("should create event with quick add successfully", async () => {
      mockReq.body = { text: "Meeting tomorrow at 3pm" };
      mockQuickAddWithOrchestrator.mockResolvedValue({
        success: true,
        event: { id: "event-123" },
        parsed: { summary: "Meeting", startTime: "2024-01-16T15:00:00Z" },
        calendarId: "primary",
        calendarName: "Primary",
        eventUrl: "https://calendar.google.com/event/123",
      });

      await eventsController.quickAddEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockQuickAddWithOrchestrator).toHaveBeenCalledWith(
        "test@example.com",
        "Meeting tomorrow at 3pm",
        { forceCreate: undefined }
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 201 }),
        "Event created successfully",
        expect.objectContaining({
          event: { id: "event-123" },
          eventUrl: "https://calendar.google.com/event/123",
        })
      );
    });

    it("should return conflict when event has conflicts", async () => {
      mockReq.body = { text: "Meeting at 3pm" };
      mockQuickAddWithOrchestrator.mockResolvedValue({
        success: false,
        requiresConfirmation: true,
        error: "Conflicts detected",
        parsed: { summary: "Meeting" },
        conflicts: [{ id: "existing-123", summary: "Existing Meeting" }],
        calendarId: "primary",
        calendarName: "Primary",
      });

      await eventsController.quickAddEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 409 }),
        "Conflicts detected",
        expect.objectContaining({
          conflicts: [{ id: "existing-123", summary: "Existing Meeting" }],
        })
      );
    });

    it("should return bad request on failure without conflicts", async () => {
      mockReq.body = { text: "Invalid event text" };
      mockQuickAddWithOrchestrator.mockResolvedValue({
        success: false,
        error: "Could not parse event details",
      });

      await eventsController.quickAddEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "Could not parse event details"
      );
    });
  });

  describe("getInsights", () => {
    it("should return unauthorized if user not authenticated", async () => {
      mockReq.user = undefined;
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-01-31" };

      await eventsController.getInsights(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 401 }),
        "User not authenticated"
      );
    });

    it("should return bad request if timeMin or timeMax missing", async () => {
      mockReq.query = { timeMin: "2024-01-01" };

      await eventsController.getInsights(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 400 }),
        "timeMin and timeMax query parameters are required"
      );
    });

    it("should return cached insights if available", async () => {
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-01-31" };
      const cachedData = {
        insights: [{ type: "meetings", message: "You had 10 meetings" }],
        generatedAt: "2024-01-15T00:00:00Z",
      };
      mockGetCachedInsights.mockResolvedValue(cachedData);

      await eventsController.getInsights(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetCachedInsights).toHaveBeenCalledWith(
        "test@example.com",
        "2024-01-01",
        "2024-01-31"
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Insights retrieved from cache",
        cachedData
      );
    });

    it("should generate and cache new insights", async () => {
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-01-31" };
      mockGetCachedInsights.mockResolvedValue(null);

      const mockCalendar = {
        calendarList: {
          list: mockFn().mockResolvedValue({
            data: {
              items: [
                {
                  id: "primary",
                  summary: "Primary",
                  backgroundColor: "#4285f4",
                },
              ],
            },
          }),
        },
        events: {},
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );
      mockGetEvents.mockResolvedValue({
        type: "standard",
        data: { items: [{ id: "event-1", summary: "Meeting" }] },
      });
      mockCalculateInsightsMetrics.mockReturnValue({ totalEvents: 1 });
      mockGenerateInsightsWithRetry.mockResolvedValue({
        insights: [{ type: "summary", message: "You had 1 meeting" }],
      });
      mockSetCachedInsights.mockResolvedValue(undefined);

      await eventsController.getInsights(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGenerateInsightsWithRetry).toHaveBeenCalledWith(
        { totalEvents: 1 },
        "2024-01-01",
        "2024-01-31",
        3
      );
      expect(mockSetCachedInsights).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Insights generated successfully",
        expect.objectContaining({
          insights: [{ type: "summary", message: "You had 1 meeting" }],
        })
      );
    });

    it("should return empty insights when no events found", async () => {
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-01-31" };
      mockGetCachedInsights.mockResolvedValue(null);

      const mockCalendar = {
        calendarList: {
          list: mockFn().mockResolvedValue({
            data: { items: [{ id: "primary" }] },
          }),
        },
        events: {},
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );
      mockGetEvents.mockResolvedValue({
        type: "standard",
        data: { items: [] },
      });

      await eventsController.getInsights(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "No events found for the specified period",
        expect.objectContaining({ insights: [] })
      );
    });
  });

  describe("getEventAnalytics", () => {
    it("should return not found if user token not found", async () => {
      mockFetchCredentialsByEmail.mockResolvedValue(null);

      await eventsController.getEventAnalytics(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "User token not found."
      );
    });

    it("should get event analytics from all calendars", async () => {
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-01-31" };
      const mockCalendar = {
        calendarList: {
          list: mockFn().mockResolvedValue({
            data: { items: [{ id: "primary" }, { id: "work" }] },
          }),
        },
        events: {},
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );
      mockGetEvents.mockResolvedValue({
        type: "standard",
        data: { items: [{ id: "event-1" }] },
      });

      await eventsController.getEventAnalytics(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockGetEvents).toHaveBeenCalledTimes(2); // primary + work
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        expect.stringContaining("events retrieved successfully"),
        expect.objectContaining({ allEvents: expect.any(Array) })
      );
    });
  });

  describe("watchEvents", () => {
    it("should return not found if user token not found", async () => {
      mockFetchCredentialsByEmail.mockResolvedValue(null);

      await eventsController.watchEvents(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 404 }),
        "User token not found."
      );
    });

    it("should watch events successfully", async () => {
      mockReq.body = { id: "channel-123", type: "web_hook" };
      const mockCalendar = {
        events: {
          watch: mockFn().mockResolvedValue({
            data: { resourceId: "resource-123" },
          }),
        },
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );

      await eventsController.watchEvents(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCalendar.events.watch).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event watched successfully",
        expect.any(Object)
      );
    });
  });

  describe("moveEvent", () => {
    it("should move event successfully", async () => {
      mockReq.body = { destination: "work-calendar" };
      mockReq.query = { calendarId: "primary" };
      const mockCalendar = {
        events: {
          move: mockFn().mockResolvedValue({ data: { id: "moved-event" } }),
        },
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );

      await eventsController.moveEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCalendar.events.move).toHaveBeenCalled();
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event moved successfully",
        expect.any(Object)
      );
    });
  });

  describe("getEventInstances", () => {
    it("should get recurring event instances", async () => {
      mockReq.params = { id: "recurring-event-123" };
      mockReq.query = { timeMin: "2024-01-01", timeMax: "2024-12-31" };
      const mockCalendar = {
        events: {
          instances: mockFn().mockResolvedValue({
            data: { items: [{ id: "instance-1" }, { id: "instance-2" }] },
          }),
        },
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );

      await eventsController.getEventInstances(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCalendar.events.instances).toHaveBeenCalledWith(
        expect.objectContaining({ eventId: "recurring-event-123" })
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 200 }),
        "Event instances retrieved successfully",
        expect.objectContaining({ items: expect.any(Array) })
      );
    });
  });

  describe("importEvent", () => {
    it("should import event successfully", async () => {
      mockReq.body = {
        iCalUID: "uid@example.com",
        summary: "Imported Event",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      };
      const mockCalendar = {
        events: {
          import: mockFn().mockResolvedValue({ data: { id: "imported-123" } }),
        },
      };
      mockInitUserSupabaseCalendarWithTokensAndUpdateTokens.mockResolvedValue(
        mockCalendar
      );

      await eventsController.importEvent(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockCalendar.events.import).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({ iCalUID: "uid@example.com" }),
        })
      );
      expect(mockSendR).toHaveBeenCalledWith(
        mockRes,
        expect.objectContaining({ code: 201 }),
        "Event imported successfully",
        expect.any(Object)
      );
    });
  });
});
