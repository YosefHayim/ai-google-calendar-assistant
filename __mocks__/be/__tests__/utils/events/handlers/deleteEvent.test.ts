import { describe, it, expect, jest } from "@jest/globals";
import { handleDeleteEvent } from "@/utils/events/handlers/deleteEvent";
import type { calendar_v3 } from "googleapis";

describe("handleDeleteEvent", () => {
  it("should delete an event", async () => {
    const mockDelete = jest.fn().mockResolvedValue({ data: undefined });

    const calendarEvents = {
      delete: mockDelete,
    } as unknown as calendar_v3.Resource$Events;

    const eventData = { id: "event-123" };

    await handleDeleteEvent(calendarEvents, eventData);

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({
        eventId: "event-123",
        calendarId: "primary",
      })
    );
  });

  it("should use calendarId from extra", async () => {
    const mockDelete = jest.fn().mockResolvedValue({ data: undefined });

    const calendarEvents = {
      delete: mockDelete,
    } as unknown as calendar_v3.Resource$Events;

    await handleDeleteEvent(
      calendarEvents,
      { id: "event-123" },
      null,
      { calendarId: "test-calendar" }
    );

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "test-calendar" })
    );
  });

  it("should handle empty event ID", async () => {
    const mockDelete = jest.fn().mockResolvedValue({ data: undefined });

    const calendarEvents = {
      delete: mockDelete,
    } as unknown as calendar_v3.Resource$Events;

    await handleDeleteEvent(calendarEvents, {});

    expect(mockDelete).toHaveBeenCalledWith(
      expect.objectContaining({ eventId: "" })
    );
  });

  it("should return response data", async () => {
    const mockDelete = jest.fn().mockResolvedValue({ data: "deleted" });

    const calendarEvents = {
      delete: mockDelete,
    } as unknown as calendar_v3.Resource$Events;

    const result = await handleDeleteEvent(calendarEvents, { id: "event-123" });

    expect(result).toBe("deleted");
  });
});
