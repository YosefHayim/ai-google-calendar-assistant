import calendarController from "@/controllers/calendarController";
import { ACTION, STATUS_RESPONSE } from "@/types";
import { fetchCredentialsByEmail } from "@/utils/getUserCalendarTokens";
import { eventsHandler } from "@/utils/handleEvents";
import { initCalendarWithUserTokensAndUpdateTokens } from "@/utils/initCalendarWithUserTokens";
import { updateCalenderCategories } from "@/utils/updateCalendarCategories";
import sendResponse from "@/utils/sendResponse";
import { validateTokens } from "@/utils/auth/validateTokens";

jest.mock("@/utils/getUserCalendarTokens");
jest.mock("@/utils/handleEvents");
jest.mock("@/utils/initCalendarWithUserTokens");
jest.mock("@/utils/updateCalendarCategories");
jest.mock("@/utils/sendResponse");
jest.mock("@/utils/auth/validateTokens");

describe("Calendar Controller", () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: {
        id: "user123",
        email: "test@example.com",
      },
      params: {},
      query: {},
      body: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    // Mock validateTokens to return valid tokens by default
    (validateTokens as jest.Mock).mockReturnValue({
      isValid: true,
      requiresReAuth: false,
      status: "valid",
      message: "Tokens are valid and can be used.",
      isAccessTokenExpired: false,
      isRefreshTokenExpired: false,
      accessTokenTimeRemaining: 3600000,
      refreshTokenTimeRemaining: 604800000,
    });
  });

  describe("Controller Structure", () => {
    it("should export all required methods", () => {
      expect(calendarController).toHaveProperty("calendarOverview");
      expect(calendarController).toHaveProperty("getAllCalendars");
      expect(calendarController).toHaveProperty("getAllEvents");
      expect(calendarController).toHaveProperty("createEvent");
      expect(calendarController).toHaveProperty("updateEvent");
      expect(calendarController).toHaveProperty("deleteEvent");
      expect(calendarController).toHaveProperty("getSpecificEvent");
      expect(calendarController).toHaveProperty("getAllFilteredEvents");
      expect(calendarController).toHaveProperty("getCalendarColors");
      expect(calendarController).toHaveProperty("getCalendarTimezone");
    });

    it("all methods should be functions", () => {
      Object.values(calendarController).forEach((method) => {
        expect(typeof method).toBe("function");
      });
    });
  });

  describe("getAllCalendars", () => {
    it("should fetch and return all calendars successfully", async () => {
      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockCalendarList = {
        data: {
          items: [
            {
              summary: "Work Calendar",
              id: "cal1",
              colorId: "1",
              accessRole: "owner",
              timeZone: "Asia/Jerusalem",
              defaultReminders: [],
            },
            {
              summary: "Personal Calendar",
              id: "cal2",
              colorId: "2",
              accessRole: "owner",
              timeZone: "Asia/Jerusalem",
              defaultReminders: [],
            },
          ],
        },
      };

      const mockCalendar = {
        calendarList: {
          list: jest.fn().mockResolvedValue(mockCalendarList),
        },
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);
      (initCalendarWithUserTokensAndUpdateTokens as jest.Mock).mockResolvedValue(mockCalendar);
      (updateCalenderCategories as jest.Mock).mockResolvedValue(true);

      await calendarController.getAllCalendars(mockReq, mockRes);

      expect(fetchCredentialsByEmail).toHaveBeenCalledWith("test@example.com");
      expect(initCalendarWithUserTokensAndUpdateTokens).toHaveBeenCalledWith(mockTokenData);
      expect(updateCalenderCategories).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        "Successfully received all calendars",
        expect.arrayContaining([
          expect.objectContaining({
            calendarName: "Work Calendar",
            calendarId: "cal1",
          }),
        ])
      );
    });

    it("should return not found if credentials are missing", async () => {
      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(null);

      await calendarController.getAllCalendars(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.NOT_FOUND,
        "User credentials not found in order to retrieve all calendars."
      );
    });
  });

  describe("getCalendarColors", () => {
    it("should fetch and return calendar colors", async () => {
      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockColors = {
        data: {
          event: { "1": { background: "#a4bdfc" } },
        },
      };

      const mockCalendar = {
        colors: {
          get: jest.fn().mockResolvedValue(mockColors),
        },
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);
      (initCalendarWithUserTokensAndUpdateTokens as jest.Mock).mockResolvedValue(mockCalendar);

      await calendarController.getCalendarColors(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        "Successfully received calendar colors",
        mockColors.data
      );
    });
  });

  describe("getCalendarTimezone", () => {
    it("should fetch and return calendar timezone", async () => {
      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockTimezone = {
        data: { value: "Asia/Jerusalem" },
      };

      const mockCalendar = {
        settings: {
          get: jest.fn().mockResolvedValue(mockTimezone),
        },
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);
      (initCalendarWithUserTokensAndUpdateTokens as jest.Mock).mockResolvedValue(mockCalendar);

      await calendarController.getCalendarTimezone(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        "Successfully received calendar timezone",
        mockTimezone.data
      );
    });
  });

  describe("getSpecificEvent", () => {
    it("should fetch specific event by ID", async () => {
      mockReq.params.eventId = "event123";

      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockEvent = {
        data: {
          id: "event123",
          summary: "Test Event",
        },
      };

      const mockCalendar = {
        events: {
          get: jest.fn().mockResolvedValue(mockEvent),
        },
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);
      (initCalendarWithUserTokensAndUpdateTokens as jest.Mock).mockResolvedValue(mockCalendar);

      await calendarController.getSpecificEvent(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Event retrieved successfully", mockEvent.data);
    });

    it("should return bad request if eventId is missing", async () => {
      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);

      await calendarController.getSpecificEvent(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.BAD_REQUEST,
        "Event ID is required in order to get specific event."
      );
    });

    it("should return not found if credentials are missing", async () => {
      mockReq.params.eventId = "event123";
      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(null);

      await calendarController.getSpecificEvent(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.NOT_FOUND, "User token not found.");
    });
  });

  describe("getAllEvents", () => {
    it("should fetch all events", async () => {
      const mockEvents = [
        { id: "event1", summary: "Event 1" },
        { id: "event2", summary: "Event 2" },
      ];

      (eventsHandler as jest.Mock).mockResolvedValue(mockEvents);

      await calendarController.getAllEvents(mockReq, mockRes);

      expect(eventsHandler).toHaveBeenCalledWith(mockReq, ACTION.GET);
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all events", mockEvents);
    });
  });

  describe("getAllFilteredEvents", () => {
    it("should fetch filtered events", async () => {
      mockReq.query = { timeMin: "2025-01-01", timeMax: "2025-01-31" };

      const mockEvents = [{ id: "event1", summary: "Event 1" }];

      (eventsHandler as jest.Mock).mockResolvedValue(mockEvents);

      await calendarController.getAllFilteredEvents(mockReq, mockRes);

      expect(eventsHandler).toHaveBeenCalledWith(mockReq, ACTION.GET, undefined, mockReq.query);
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Successfully retrieved all filtered events", mockEvents);
    });
  });

  describe("createEvent", () => {
    it("should create new event", async () => {
      mockReq.body = {
        summary: "New Event",
        start: { dateTime: "2025-01-01T10:00:00Z" },
        end: { dateTime: "2025-01-01T11:00:00Z" },
        email: "test@example.com",
        calendarId: "primary",
      };

      const mockCreatedEvent = {
        id: "newEvent123",
        summary: "New Event",
      };

      (eventsHandler as jest.Mock).mockResolvedValue(mockCreatedEvent);

      await calendarController.createEvent(mockReq, mockRes);

      expect(eventsHandler).toHaveBeenCalledWith(mockReq, ACTION.INSERT, mockReq.body, {
        calendarId: "primary",
        email: "test@example.com",
      });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.CREATED, "Event created successfully", mockCreatedEvent);
    });
  });

  describe("updateEvent", () => {
    it("should update existing event", async () => {
      mockReq.params.eventId = "event123";
      mockReq.body = {
        summary: "Updated Event",
      };

      const mockUpdatedEvent = {
        id: "event123",
        summary: "Updated Event",
      };

      (eventsHandler as jest.Mock).mockResolvedValue(mockUpdatedEvent);

      await calendarController.updateEvent(mockReq, mockRes);

      expect(eventsHandler).toHaveBeenCalledWith(mockReq, ACTION.UPDATE, {
        id: "event123",
        summary: "Updated Event",
      });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Event updated successfully", mockUpdatedEvent);
    });

    it("should return bad request if eventId is missing", async () => {
      await calendarController.updateEvent(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.BAD_REQUEST,
        "Event ID is required in order to update event."
      );
    });
  });

  describe("deleteEvent", () => {
    it("should delete existing event", async () => {
      mockReq.params.eventId = "event123";

      const mockDeletedEvent = {
        id: "event123",
      };

      (eventsHandler as jest.Mock).mockResolvedValue(mockDeletedEvent);

      await calendarController.deleteEvent(mockReq, mockRes);

      expect(eventsHandler).toHaveBeenCalledWith(mockReq, ACTION.DELETE, { id: "event123" });
      expect(sendResponse).toHaveBeenCalledWith(mockRes, STATUS_RESPONSE.SUCCESS, "Event deleted successfully", mockDeletedEvent);
    });

    it("should return bad request if eventId is missing", async () => {
      await calendarController.deleteEvent(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.BAD_REQUEST,
        "Event ID is required in order to delete event."
      );
    });
  });

  describe("calendarOverview", () => {
    it("should fetch calendar overview", async () => {
      const mockTokenData = {
        access_token: "access_token",
        refresh_token: "refresh_token",
      };

      const mockOverview = {
        data: {
          summary: "Primary Calendar",
          id: "primary",
        },
      };

      const mockCalendar = {
        calendars: {
          get: jest.fn().mockResolvedValue(mockOverview),
        },
      };

      (fetchCredentialsByEmail as jest.Mock).mockResolvedValue(mockTokenData);
      (initCalendarWithUserTokensAndUpdateTokens as jest.Mock).mockResolvedValue(mockCalendar);

      await calendarController.calendarOverview(mockReq, mockRes);

      expect(sendResponse).toHaveBeenCalledWith(
        mockRes,
        STATUS_RESPONSE.SUCCESS,
        "Successfully received calendar overview",
        mockOverview.data
      );
    });
  });
});
