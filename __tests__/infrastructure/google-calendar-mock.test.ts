import { describe, it, expect, beforeEach } from "@jest/globals";
import {
  createMockCalendarClient,
  createMockEvent,
  createMockEventsList,
  createMockGoogleApiError,
  createMockCalendarErrors,
  createMockOAuth2Client,
  mockDateUtils,
  mockCalendarEvent,
  mockEventsList,
  mockRecurringEvent,
  mockAllDayEvent,
} from "../../__mocks__/google-calendar";

describe("Google Calendar Mock Factory", () => {
  describe("createMockCalendarClient", () => {
    let mockClient: ReturnType<typeof createMockCalendarClient>;

    beforeEach(() => {
      mockClient = createMockCalendarClient();
    });

    describe("events.list", () => {
      it("should return mock events list by default", async () => {
        const response = await mockClient.events.list({
          calendarId: "primary",
        });

        expect(response.data).toBeDefined();
        expect(response.data.items).toBeDefined();
        expect(response.data.items?.length).toBeGreaterThan(0);
        expect(response.data.kind).toBe("calendar#events");
      });

      it("should allow custom mock implementation", async () => {
        const customEvents = createMockEventsList([
          createMockEvent({ summary: "Custom Event 1" }),
          createMockEvent({ summary: "Custom Event 2" }),
        ]);

        mockClient.events.list.mockResolvedValue({ data: customEvents });

        const response = await mockClient.events.list({
          calendarId: "primary",
        });

        expect(response.data.items?.length).toBe(2);
        expect(response.data.items?.[0].summary).toBe("Custom Event 1");
        expect(response.data.items?.[1].summary).toBe("Custom Event 2");
      });
    });

    describe("events.get", () => {
      it("should return mock event by default", async () => {
        const response = await mockClient.events.get({
          calendarId: "primary",
          eventId: "mock-event-id",
        });

        expect(response.data).toBeDefined();
        expect(response.data.id).toBeDefined();
        expect(response.data.summary).toBeDefined();
        expect(response.data.start).toBeDefined();
        expect(response.data.end).toBeDefined();
      });

      it("should handle not found error", async () => {
        mockClient.events.get.mockRejectedValue(createMockGoogleApiError("notFound"));

        await expect(
          mockClient.events.get({
            calendarId: "primary",
            eventId: "non-existent-id",
          }),
        ).rejects.toThrow("Not Found");
      });
    });

    describe("events.insert", () => {
      it("should create event with provided data", async () => {
        const newEvent = {
          summary: "New Meeting",
          start: {
            dateTime: "2024-01-20T10:00:00Z",
            timeZone: "America/New_York",
          },
          end: {
            dateTime: "2024-01-20T11:00:00Z",
            timeZone: "America/New_York",
          },
        };

        const response = await mockClient.events.insert({
          calendarId: "primary",
          requestBody: newEvent,
        });

        expect(response.data.summary).toBe("New Meeting");
        expect(response.data.start?.dateTime).toBe("2024-01-20T10:00:00Z");
        expect(response.data.id).toBeDefined();
      });

      it("should handle invalid request error", async () => {
        mockClient.events.insert.mockRejectedValue(createMockGoogleApiError("invalidRequest"));

        await expect(
          mockClient.events.insert({
            calendarId: "primary",
            requestBody: { summary: "" }, // Invalid: empty summary
          }),
        ).rejects.toThrow("Bad Request");
      });
    });

    describe("events.update", () => {
      it("should update event with provided data", async () => {
        const updates = {
          summary: "Updated Meeting Title",
          description: "Updated description",
        };

        const response = await mockClient.events.update({
          calendarId: "primary",
          eventId: "mock-event-id",
          requestBody: updates,
        });

        expect(response.data.summary).toBe("Updated Meeting Title");
        expect(response.data.description).toBe("Updated description");
      });
    });

    describe("events.patch", () => {
      it("should partially update event", async () => {
        const updates = {
          summary: "Patched Title",
        };

        const response = await mockClient.events.patch({
          calendarId: "primary",
          eventId: "mock-event-id",
          requestBody: updates,
        });

        expect(response.data.summary).toBe("Patched Title");
      });
    });

    describe("events.delete", () => {
      it("should delete event successfully", async () => {
        const response = await mockClient.events.delete({
          calendarId: "primary",
          eventId: "mock-event-id",
        });

        expect(response.data).toBeDefined();
      });

      it("should handle not found error when deleting", async () => {
        mockClient.events.delete.mockRejectedValue(createMockGoogleApiError("notFound"));

        await expect(
          mockClient.events.delete({
            calendarId: "primary",
            eventId: "non-existent-id",
          }),
        ).rejects.toThrow("Not Found");
      });
    });

    describe("calendarList.list", () => {
      it("should return list of calendars", async () => {
        const response = await mockClient.calendarList.list({});

        expect(response.data).toBeDefined();
        expect(response.data.items).toBeDefined();
        expect(response.data.items?.length).toBeGreaterThan(0);
        expect(response.data.kind).toBe("calendar#calendarList");
      });
    });
  });

  describe("Mock Data Structures", () => {
    it("should have valid event structure", () => {
      expect(mockCalendarEvent.id).toBeDefined();
      expect(mockCalendarEvent.summary).toBeDefined();
      expect(mockCalendarEvent.start).toBeDefined();
      expect(mockCalendarEvent.end).toBeDefined();
      expect(mockCalendarEvent.start?.dateTime).toBeDefined();
      expect(mockCalendarEvent.end?.dateTime).toBeDefined();
    });

    it("should have recurring event with recurrence rule", () => {
      expect(mockRecurringEvent.recurrence).toBeDefined();
      expect(mockRecurringEvent.recurrence?.length).toBeGreaterThan(0);
      expect(mockRecurringEvent.recurrence?.[0]).toContain("RRULE");
    });

    it("should have all-day event with date only", () => {
      expect(mockAllDayEvent.start?.date).toBeDefined();
      expect(mockAllDayEvent.end?.date).toBeDefined();
      expect(mockAllDayEvent.start?.dateTime).toBeUndefined();
      expect(mockAllDayEvent.end?.dateTime).toBeUndefined();
    });

    it("should have events list with multiple events", () => {
      expect(mockEventsList.items).toBeDefined();
      expect(mockEventsList.items?.length).toBeGreaterThan(0);
    });
  });

  describe("createMockEvent", () => {
    it("should create event with default values", () => {
      const event = createMockEvent();

      expect(event.id).toBeDefined();
      expect(event.summary).toBeDefined();
      expect(event.start).toBeDefined();
      expect(event.end).toBeDefined();
    });

    it("should create event with custom values", () => {
      const event = createMockEvent({
        summary: "Custom Event",
        description: "Custom description",
        location: "Custom Location",
      });

      expect(event.summary).toBe("Custom Event");
      expect(event.description).toBe("Custom description");
      expect(event.location).toBe("Custom Location");
    });

    it("should generate unique IDs for each event", () => {
      const event1 = createMockEvent();
      const event2 = createMockEvent();

      expect(event1.id).not.toBe(event2.id);
    });
  });

  describe("createMockEventsList", () => {
    it("should create events list with custom events", () => {
      const events = [createMockEvent({ summary: "Event 1" }), createMockEvent({ summary: "Event 2" })];

      const eventsList = createMockEventsList(events);

      expect(eventsList.items?.length).toBe(2);
      expect(eventsList.items?.[0].summary).toBe("Event 1");
      expect(eventsList.items?.[1].summary).toBe("Event 2");
      expect(eventsList.kind).toBe("calendar#events");
    });
  });

  describe("Error Scenarios", () => {
    it("should have all standard error types", () => {
      const errors = createMockCalendarErrors();

      expect(errors.notFound.code).toBe(404);
      expect(errors.unauthorized.code).toBe(401);
      expect(errors.rateLimitExceeded.code).toBe(429);
      expect(errors.invalidRequest.code).toBe(400);
      expect(errors.serverError.code).toBe(500);
      expect(errors.serviceUnavailable.code).toBe(503);
    });

    it("should create Google API error with correct structure", () => {
      const error = createMockGoogleApiError("notFound");

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Not Found");
      expect(error.code).toBe(404);
      expect(error.errors).toBeDefined();
      expect(error.errors.length).toBeGreaterThan(0);
    });

    it("should handle rate limit error", () => {
      const error = createMockGoogleApiError("rateLimitExceeded");

      expect(error.code).toBe(429);
      expect(error.message).toBe("Rate Limit Exceeded");
    });

    it("should handle unauthorized error", () => {
      const error = createMockGoogleApiError("unauthorized");

      expect(error.code).toBe(401);
      expect(error.message).toBe("Unauthorized");
    });
  });

  describe("Date Utilities", () => {
    it("should create ISO date string", () => {
      const isoDate = mockDateUtils.createISODate(0, 9, 30);

      expect(isoDate).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(new Date(isoDate)).toBeInstanceOf(Date);
    });

    it("should create date-only string", () => {
      const dateOnly = mockDateUtils.createDateOnly(0);

      expect(dateOnly).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(dateOnly.split("T").length).toBe(1);
    });

    it("should create time range with duration", () => {
      const timeRange = mockDateUtils.createTimeRange(0, 60);

      expect(timeRange.start.dateTime).toBeDefined();
      expect(timeRange.end.dateTime).toBeDefined();

      const startDate = new Date(timeRange.start.dateTime);
      const endDate = new Date(timeRange.end.dateTime);
      const durationMs = endDate.getTime() - startDate.getTime();
      const durationMinutes = durationMs / (1000 * 60);

      expect(durationMinutes).toBe(60);
    });

    it("should check if date is in past", () => {
      const pastDate = "2020-01-01T00:00:00Z";
      const futureDate = "2030-01-01T00:00:00Z";

      expect(mockDateUtils.isPast(pastDate)).toBe(true);
      expect(mockDateUtils.isPast(futureDate)).toBe(false);
    });

    it("should check if date is in future", () => {
      const pastDate = "2020-01-01T00:00:00Z";
      const futureDate = "2030-01-01T00:00:00Z";

      expect(mockDateUtils.isFuture(pastDate)).toBe(false);
      expect(mockDateUtils.isFuture(futureDate)).toBe(true);
    });
  });

  describe("OAuth2 Client Mock", () => {
    let mockOAuth2: ReturnType<typeof createMockOAuth2Client>;

    beforeEach(() => {
      mockOAuth2 = createMockOAuth2Client();
    });

    it("should set credentials", () => {
      const credentials = {
        access_token: "test-token",
        refresh_token: "test-refresh",
      };

      mockOAuth2.setCredentials(credentials);

      expect(mockOAuth2.setCredentials).toHaveBeenCalledWith(credentials);
    });

    it("should get access token", async () => {
      const response = await mockOAuth2.getAccessToken();

      expect(response.token).toBe("mock-access-token");
      expect(response.res?.data.access_token).toBe("mock-access-token");
    });

    it("should refresh access token", async () => {
      const response = await mockOAuth2.refreshAccessToken();

      expect(response.credentials.access_token).toBe("mock-refreshed-token");
      expect(response.credentials.refresh_token).toBe("mock-refresh-token");
    });

    it("should generate auth URL", () => {
      const authUrl = mockOAuth2.generateAuthUrl();

      expect(authUrl).toContain("https://accounts.google.com");
      expect(authUrl).toContain("oauth2");
    });

    it("should have client ID and secret", () => {
      expect(mockOAuth2._clientId).toBe("mock-client-id");
      expect(mockOAuth2._clientSecret).toBe("mock-client-secret");
    });
  });

  describe("Edge Cases", () => {
    let mockClient: ReturnType<typeof createMockCalendarClient>;

    beforeEach(() => {
      mockClient = createMockCalendarClient();
    });

    it("should handle invalid date formats", () => {
      const invalidDate = "not-a-date";

      expect(() => {
        new Date(invalidDate);
      }).not.toThrow(); // Date constructor doesn't throw, returns Invalid Date

      expect(new Date(invalidDate).toString()).toBe("Invalid Date");
    });

    it("should handle empty events list", async () => {
      mockClient.events.list.mockResolvedValue({
        data: createMockEventsList([]),
      });

      const response = await mockClient.events.list({
        calendarId: "primary",
      });

      expect(response.data.items?.length).toBe(0);
    });

    it("should handle server errors", async () => {
      mockClient.events.list.mockRejectedValue(createMockGoogleApiError("serverError"));

      await expect(
        mockClient.events.list({
          calendarId: "primary",
        }),
      ).rejects.toThrow("Internal Server Error");
    });

    it("should handle service unavailable", async () => {
      mockClient.events.get.mockRejectedValue(createMockGoogleApiError("serviceUnavailable"));

      await expect(
        mockClient.events.get({
          calendarId: "primary",
          eventId: "test-id",
        }),
      ).rejects.toThrow("Service Unavailable");
    });
  });
});
