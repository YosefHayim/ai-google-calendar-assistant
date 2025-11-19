import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import type { calendar_v3 } from "googleapis";
import { GoogleCalendarCalendarRepository } from "@/infrastructure/repositories/GoogleCalendarCalendarRepository";
import { Calendar } from "@/domain/entities/Calendar";
import { CalendarMapper } from "@/infrastructure/repositories/mappers/CalendarMapper";

// Mock the CalendarMapper
jest.mock("@/infrastructure/repositories/mappers/CalendarMapper");

describe("GoogleCalendarCalendarRepository", () => {
  let repository: GoogleCalendarCalendarRepository;
  let mockCalendarClient: jest.Mocked<calendar_v3.Calendar>;
  let mockCalendar: Calendar;

  beforeEach(() => {
    // Create mock Calendar entity
    mockCalendar = new Calendar(
      "calendar-1",
      "Test Calendar",
      "user-123",
      {
        timeZone: "America/New_York",
        description: "Test description",
        backgroundColor: "#9fe1e7",
      },
      false,
      "owner",
    );

    // Create mock Google Calendar API client
    mockCalendarClient = {
      calendarList: {
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
      },
      calendars: {
        insert: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<calendar_v3.Calendar>;

    // Create repository instance
    repository = new GoogleCalendarCalendarRepository(mockCalendarClient);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should find calendar by ID successfully", async () => {
      const mockResponse = {
        data: {
          id: "calendar-1",
          summary: "Test Calendar",
          timeZone: "America/New_York",
        },
      };

      mockCalendarClient.calendarList.get.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.findById("calendar-1");

      expect(mockCalendarClient.calendarList.get).toHaveBeenCalledWith({
        calendarId: "calendar-1",
      });
      expect(CalendarMapper.toDomain).toHaveBeenCalledWith(mockResponse.data);
      expect(result).toBe(mockCalendar);
    });

    it("should return null when calendar data is not found", async () => {
      mockCalendarClient.calendarList.get.mockResolvedValue({ data: null } as any);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });

    it("should return null for 404 errors", async () => {
      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      const result = await repository.findById("nonexistent");

      expect(result).toBeNull();
    });

    it("should throw error for non-404 errors", async () => {
      const error: any = new Error("Server error");
      error.code = 500;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow();
    });

    it("should handle unauthorized errors", async () => {
      const error: any = new Error("Unauthorized");
      error.code = 401;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(
        /Unauthorized access in findById/,
      );
    });
  });

  describe("findByUserId", () => {
    it("should find all calendars for user", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "cal-1", summary: "Calendar 1" },
            { id: "cal-2", summary: "Calendar 2" },
          ],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([mockCalendar, mockCalendar]);

      const result = await repository.findByUserId("user-123");

      expect(mockCalendarClient.calendarList.list).toHaveBeenCalledWith({
        minAccessRole: undefined,
        showHidden: true,
      });
      expect(result).toHaveLength(2);
    });

    it("should apply minAccessRole filter", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "cal-1", summary: "Calendar 1" }],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([mockCalendar]);

      await repository.findByUserId("user-123", { minAccessRole: "writer" });

      expect(mockCalendarClient.calendarList.list).toHaveBeenCalledWith({
        minAccessRole: "writer",
        showHidden: true,
      });
    });

    it("should hide shared calendars when includeShared is false", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "cal-1", summary: "Calendar 1" }],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([mockCalendar]);

      await repository.findByUserId("user-123", { includeShared: false });

      expect(mockCalendarClient.calendarList.list).toHaveBeenCalledWith({
        minAccessRole: undefined,
        showHidden: false,
      });
    });

    it("should return empty array when no items found", async () => {
      mockCalendarClient.calendarList.list.mockResolvedValue({ data: {} } as any);

      const result = await repository.findByUserId("user-123");

      expect(result).toEqual([]);
    });

    it("should throw error on API failure", async () => {
      mockCalendarClient.calendarList.list.mockRejectedValue(new Error("API Error"));

      await expect(repository.findByUserId("user-123")).rejects.toThrow();
    });
  });

  describe("findDefaultByUserId", () => {
    it("should return default calendar if one exists", async () => {
      const defaultCal = new Calendar(
        "default-cal",
        "Default",
        "user-123",
        { timeZone: "UTC" },
        true, // isDefault
        "owner",
      );

      const mockResponse = {
        data: {
          items: [{ id: "cal-1", summary: "Calendar 1", selected: true }],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([defaultCal]);

      const result = await repository.findDefaultByUserId("user-123");

      expect(result).toBe(defaultCal);
      expect(result?.isDefault).toBe(true);
    });

    it("should fetch primary calendar if no default found", async () => {
      const nonDefaultCal = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "owner",
      );

      const mockListResponse = {
        data: {
          items: [{ id: "cal-1", summary: "Calendar 1" }],
        },
      };

      const mockPrimaryResponse = {
        data: {
          id: "primary",
          summary: "Primary Calendar",
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockListResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([nonDefaultCal]);

      mockCalendarClient.calendarList.get.mockResolvedValue(mockPrimaryResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.findDefaultByUserId("user-123");

      expect(mockCalendarClient.calendarList.get).toHaveBeenCalledWith({
        calendarId: "primary",
      });
      expect(result).toBe(mockCalendar);
    });

    it("should return null if primary calendar not found", async () => {
      mockCalendarClient.calendarList.list.mockResolvedValue({ data: { items: [] } } as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([]);

      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      const result = await repository.findDefaultByUserId("user-123");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all calendars with default limit", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "cal-1", summary: "Calendar 1" },
            { id: "cal-2", summary: "Calendar 2" },
          ],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([mockCalendar, mockCalendar]);

      const result = await repository.findAll();

      expect(mockCalendarClient.calendarList.list).toHaveBeenCalledWith({
        maxResults: 250,
      });
      expect(result).toHaveLength(2);
    });

    it("should apply custom limit", async () => {
      const mockResponse = {
        data: {
          items: [{ id: "cal-1", summary: "Calendar 1" }],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([mockCalendar]);

      await repository.findAll({ limit: 10 });

      expect(mockCalendarClient.calendarList.list).toHaveBeenCalledWith({
        maxResults: 10,
      });
    });

    it("should filter by ownerId", async () => {
      const cal1 = new Calendar("cal-1", "Cal 1", "user-1", { timeZone: "UTC" });
      const cal2 = new Calendar("cal-2", "Cal 2", "user-2", { timeZone: "UTC" });

      const mockResponse = {
        data: {
          items: [
            { id: "cal-1", summary: "Calendar 1" },
            { id: "cal-2", summary: "Calendar 2" },
          ],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([cal1, cal2]);

      const result = await repository.findAll({ ownerId: "user-1" });

      expect(result).toHaveLength(1);
      expect(result[0].ownerId).toBe("user-1");
    });

    it("should apply offset", async () => {
      const cal1 = new Calendar("cal-1", "Cal 1", "user-1", { timeZone: "UTC" });
      const cal2 = new Calendar("cal-2", "Cal 2", "user-1", { timeZone: "UTC" });
      const cal3 = new Calendar("cal-3", "Cal 3", "user-1", { timeZone: "UTC" });

      const mockResponse = {
        data: {
          items: [
            { id: "cal-1" },
            { id: "cal-2" },
            { id: "cal-3" },
          ],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([cal1, cal2, cal3]);

      const result = await repository.findAll({ offset: 1 });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("cal-2");
    });

    it("should return empty array when no items", async () => {
      mockCalendarClient.calendarList.list.mockResolvedValue({ data: {} } as any);

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("create", () => {
    it("should create calendar successfully", async () => {
      const googleCalendar = {
        summary: "New Calendar",
        timeZone: "UTC",
      };

      const mockResponse = {
        data: {
          id: "new-cal-id",
          summary: "New Calendar",
        },
      };

      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue(googleCalendar);
      mockCalendarClient.calendars.insert.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.create(mockCalendar);

      expect(CalendarMapper.toGoogleCalendar).toHaveBeenCalledWith(mockCalendar);
      expect(mockCalendarClient.calendars.insert).toHaveBeenCalledWith({
        requestBody: googleCalendar,
      });
      expect(result).toBe(mockCalendar);
    });

    it("should throw error if no data returned", async () => {
      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue({});
      mockCalendarClient.calendars.insert.mockResolvedValue({ data: null } as any);

      await expect(repository.create(mockCalendar)).rejects.toThrow(
        "Failed to create calendar: no data returned",
      );
    });

    it("should handle API errors", async () => {
      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue({});
      mockCalendarClient.calendars.insert.mockRejectedValue(new Error("API Error"));

      await expect(repository.create(mockCalendar)).rejects.toThrow();
    });
  });

  describe("update", () => {
    it("should update calendar successfully", async () => {
      const googleCalendar = {
        summary: "Updated Calendar",
      };

      const mockResponse = {
        data: {
          id: "calendar-1",
          summary: "Updated Calendar",
        },
      };

      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue(googleCalendar);
      mockCalendarClient.calendars.update.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.update(mockCalendar);

      expect(mockCalendarClient.calendars.update).toHaveBeenCalledWith({
        calendarId: "calendar-1",
        requestBody: googleCalendar,
      });
      expect(result).toBe(mockCalendar);
    });

    it("should throw specific error for 404", async () => {
      const error: any = new Error("Not found");
      error.code = 404;

      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue({});
      mockCalendarClient.calendars.update.mockRejectedValue(error);

      await expect(repository.update(mockCalendar)).rejects.toThrow(
        `Calendar not found: ${mockCalendar.id}`,
      );
    });

    it("should throw error if no data returned", async () => {
      (CalendarMapper.toGoogleCalendar as jest.Mock).mockReturnValue({});
      mockCalendarClient.calendars.update.mockResolvedValue({ data: null } as any);

      await expect(repository.update(mockCalendar)).rejects.toThrow(
        "Failed to update calendar: no data returned",
      );
    });
  });

  describe("delete", () => {
    it("should delete calendar successfully", async () => {
      mockCalendarClient.calendars.delete.mockResolvedValue({} as any);

      const result = await repository.delete("calendar-1");

      expect(mockCalendarClient.calendars.delete).toHaveBeenCalledWith({
        calendarId: "calendar-1",
      });
      expect(result).toBe(true);
    });

    it("should return false for 404 errors", async () => {
      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.calendars.delete.mockRejectedValue(error);

      const result = await repository.delete("nonexistent");

      expect(result).toBe(false);
    });

    it("should throw error for non-404 errors", async () => {
      mockCalendarClient.calendars.delete.mockRejectedValue(new Error("API Error"));

      await expect(repository.delete("calendar-1")).rejects.toThrow();
    });
  });

  describe("setAsDefault", () => {
    it("should set calendar as default successfully", async () => {
      const mockResponse = {
        data: {
          id: "calendar-1",
          summary: "Test Calendar",
          selected: true,
        },
      };

      mockCalendarClient.calendarList.update.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.setAsDefault("calendar-1", "user-123");

      expect(mockCalendarClient.calendarList.update).toHaveBeenCalledWith({
        calendarId: "calendar-1",
        requestBody: {
          selected: true,
        },
      });
      expect(result).toBe(mockCalendar);
    });

    it("should throw specific error for 404", async () => {
      const error: any = new Error("Not found");
      error.code = 404;
      mockCalendarClient.calendarList.update.mockRejectedValue(error);

      await expect(repository.setAsDefault("nonexistent", "user-123")).rejects.toThrow(
        "Calendar not found: nonexistent",
      );
    });

    it("should throw error if no data returned", async () => {
      mockCalendarClient.calendarList.update.mockResolvedValue({ data: null } as any);

      await expect(repository.setAsDefault("calendar-1", "user-123")).rejects.toThrow(
        "Failed to set calendar as default: no data returned",
      );
    });
  });

  describe("hasAccess", () => {
    it("should return true when user has access", async () => {
      const mockResponse = {
        data: {
          id: "calendar-1",
          summary: "Test Calendar",
        },
      };

      mockCalendarClient.calendarList.get.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomain as jest.Mock).mockReturnValue(mockCalendar);

      const result = await repository.hasAccess("calendar-1", "user-123");

      expect(result).toBe(true);
    });

    it("should return false when calendar not found", async () => {
      mockCalendarClient.calendarList.get.mockResolvedValue({ data: null } as any);

      const result = await repository.hasAccess("nonexistent", "user-123");

      expect(result).toBe(false);
    });

    it("should return false on errors", async () => {
      mockCalendarClient.calendarList.get.mockRejectedValue(new Error("Access denied"));

      const result = await repository.hasAccess("calendar-1", "user-123");

      expect(result).toBe(false);
    });
  });

  describe("count", () => {
    it("should return calendar count", async () => {
      const mockResponse = {
        data: {
          items: [
            { id: "cal-1" },
            { id: "cal-2" },
            { id: "cal-3" },
          ],
        },
      };

      mockCalendarClient.calendarList.list.mockResolvedValue(mockResponse as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([
        mockCalendar,
        mockCalendar,
        mockCalendar,
      ]);

      const result = await repository.count("user-123");

      expect(result).toBe(3);
    });

    it("should return 0 when no calendars", async () => {
      mockCalendarClient.calendarList.list.mockResolvedValue({ data: {} } as any);
      (CalendarMapper.toDomainArray as jest.Mock).mockReturnValue([]);

      const result = await repository.count("user-123");

      expect(result).toBe(0);
    });

    it("should throw error on API failure", async () => {
      mockCalendarClient.calendarList.list.mockRejectedValue(new Error("API Error"));

      await expect(repository.count("user-123")).rejects.toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle 400 errors", async () => {
      const error: any = new Error("Bad request");
      error.code = 400;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(/Invalid request in findById/);
    });

    it("should handle 403 errors", async () => {
      const error: any = new Error("Forbidden");
      error.code = 403;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(
        /Forbidden access in findById/,
      );
    });

    it("should handle 429 rate limit errors", async () => {
      const error: any = new Error("Too many requests");
      error.code = 429;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(
        /Rate limit exceeded in findById/,
      );
    });

    it("should handle 503 service unavailable errors", async () => {
      const error: any = new Error("Service unavailable");
      error.code = 503;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(
        /Google Calendar service unavailable in findById/,
      );
    });

    it("should handle unknown errors", async () => {
      const error: any = new Error("Unknown error");
      error.code = 999;
      mockCalendarClient.calendarList.get.mockRejectedValue(error);

      await expect(repository.findById("calendar-1")).rejects.toThrow(
        /Google Calendar API error in findById/,
      );
    });
  });
});
