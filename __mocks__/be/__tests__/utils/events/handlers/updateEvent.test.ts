import { describe, it, expect, jest } from "@jest/globals";
import { handleUpdateEvent } from "@/utils/events/handlers/updateEvent";
import type { calendar_v3 } from "googleapis";

describe("handleUpdateEvent", () => {
  it("should update an event", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({
      data: {
        id: "event-123",
        summary: "Updated Event",
      },
    });

    const calendarEvents = {
      update: mockUpdate,
    } as unknown as calendar_v3.Resource$Events;

    const eventData: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Updated Event",
    };

    const result = await handleUpdateEvent(calendarEvents, eventData);

    expect(result.summary).toBe("Updated Event");
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "event-123",
        calendarId: "primary",
        requestBody: eventData,
      })
    );
  });

  it("should use calendarId from extra", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      update: mockUpdate,
    } as unknown as calendar_v3.Resource$Events;

    await handleUpdateEvent(
      calendarEvents,
      { id: "event-123" },
      null,
      { calendarId: "test-calendar" }
    );

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "test-calendar" })
    );
  });

  it("should handle empty event ID", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      update: mockUpdate,
    } as unknown as calendar_v3.Resource$Events;

    await handleUpdateEvent(calendarEvents, {});

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "" })
    );
  });

  it("should pass through request body", async () => {
    const mockUpdate = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      update: mockUpdate,
    } as unknown as calendar_v3.Resource$Events;

    const eventData: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Updated",
      description: "Updated description",
    };

    await handleUpdateEvent(calendarEvents, eventData);

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ requestBody: eventData })
    );
  });
});
