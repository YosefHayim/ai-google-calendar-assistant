import { describe, it, expect, jest } from "@jest/globals";
import { handleInsertEvent } from "@/utils/events/handlers/insertEvent";
import type { calendar_v3 } from "googleapis";
import type { Request } from "express";

describe("handleInsertEvent", () => {
  it("should insert an event", async () => {
    const mockInsert = jest.fn().mockResolvedValue({
      data: {
        id: "event-123",
        summary: "Test Event",
      },
    });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    const eventData: calendar_v3.Schema$Event = {
      summary: "Test Event",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = await handleInsertEvent(calendarEvents, eventData);

    expect(result.id).toBe("event-123");
    expect(mockInsert).toHaveBeenCalled();
  });

  it("should use calendarId from extra", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    await handleInsertEvent(calendarEvents, {}, null, {
      calendarId: "test-calendar",
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "test-calendar" })
    );
  });

  it("should remove calendarId and email from request body", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    const eventData = {
      summary: "Test",
      calendarId: "should-be-removed",
      email: "should-be-removed@example.com",
    } as calendar_v3.Schema$Event & { calendarId?: string; email?: string };

    await handleInsertEvent(calendarEvents, eventData);

    const callArgs = mockInsert.mock.calls[0][0] as Record<string, unknown>;
    expect(callArgs.requestBody).not.toHaveProperty("calendarId");
    expect(callArgs.requestBody).not.toHaveProperty("email");
    expect((callArgs.requestBody as Record<string, unknown>).summary).toBe("Test");
  });

  it("should use primary calendar as default", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    await handleInsertEvent(calendarEvents, {});

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "primary" })
    );
  });

  it("should handle undefined eventData", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    await handleInsertEvent(calendarEvents, undefined);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "primary" })
    );
  });

  it("should handle null eventData", async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      insert: mockInsert,
    } as unknown as calendar_v3.Resource$Events;

    await handleInsertEvent(calendarEvents, undefined, null, undefined);

    expect(mockInsert).toHaveBeenCalled();
  });
});
