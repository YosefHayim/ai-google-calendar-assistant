import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { handleGetEvents } from "@/utils/events/handlers/getEvents";
import type { calendar_v3 } from "googleapis";

jest.mock("@/utils/events/transformEvent");

import { transformEventList } from "@/utils/events/transformEvent";

const mockTransformEventList = transformEventList as jest.MockedFunction<
  typeof transformEventList
>;

describe("handleGetEvents", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get events and return raw data", async () => {
    const mockList = jest.fn().mockResolvedValue({
      data: {
        items: [
          {
            id: "event-1",
            summary: "Event 1",
          },
          {
            id: "event-2",
            summary: "Event 2",
          },
        ],
      },
    });

    const calendarEvents = {
      list: mockList,
    } as unknown as calendar_v3.Resource$Events;

    const result = await handleGetEvents(calendarEvents);

    expect(result).toHaveProperty("items");
    expect((result as calendar_v3.Schema$Events).items).toHaveLength(2);
    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "primary" })
    );
  });

  it("should transform events when customFlag is true", async () => {
    const mockList = jest.fn().mockResolvedValue({
      data: {
        items: [{ id: "event-1", summary: "Event 1" }],
      },
    });

    const calendarEvents = {
      list: mockList,
    } as unknown as calendar_v3.Resource$Events;

    mockTransformEventList.mockReturnValue({
      totalNumberOfEventsFound: 1,
      totalEventsFound: [
        {
          eventId: "event-1",
          summary: "Event 1",
          description: null,
          location: null,
          durationOfEvent: null,
          start: null,
          end: null,
        },
      ],
    });

    const result = await handleGetEvents(calendarEvents, null, {
      customEvents: true,
    });

    expect(mockTransformEventList).toHaveBeenCalled();
    expect(result).toHaveProperty("totalNumberOfEventsFound");
    expect(result).toHaveProperty("totalEventsFound");
  });

  it("should use calendarId from extra", async () => {
    const mockList = jest.fn().mockResolvedValue({ data: { items: [] } });

    const calendarEvents = {
      list: mockList,
    } as unknown as calendar_v3.Resource$Events;

    await handleGetEvents(calendarEvents, null, {
      calendarId: "test-calendar",
    });

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ calendarId: "test-calendar" })
    );
  });

  it("should handle empty items array", async () => {
    const mockList = jest.fn().mockResolvedValue({ data: {} });

    const calendarEvents = {
      list: mockList,
    } as unknown as calendar_v3.Resource$Events;

    mockTransformEventList.mockReturnValue({
      totalNumberOfEventsFound: 0,
      totalEventsFound: [],
    });

    const result = await handleGetEvents(calendarEvents, null, {
      customEvents: true,
    });

    expect(mockTransformEventList).toHaveBeenCalledWith([]);
  });

  it("should pass through query parameters", async () => {
    const mockList = jest.fn().mockResolvedValue({ data: { items: [] } });

    const calendarEvents = {
      list: mockList,
    } as unknown as calendar_v3.Resource$Events;

    const req = {
      query: { timeMin: "2024-01-01T00:00:00Z" },
    } as any;

    await handleGetEvents(calendarEvents, req);

    expect(mockList).toHaveBeenCalledWith(
      expect.objectContaining({ timeMin: "2024-01-01T00:00:00Z" })
    );
  });
});
