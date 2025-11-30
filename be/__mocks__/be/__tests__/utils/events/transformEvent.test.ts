import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { transformEvent, transformEventList } from "@/utils/events/transformEvent";
import type { calendar_v3 } from "googleapis";

// Mock the dependencies
jest.mock("@/utils/formatDate");
jest.mock("@/utils/getEventDurationString");

import formatDate from "@/utils/formatDate";
import { getEventDurationString } from "@/utils/getEventDurationString";

const mockFormatDate = formatDate as jest.MockedFunction<typeof formatDate>;
const mockGetEventDurationString = getEventDurationString as jest.MockedFunction<typeof getEventDurationString>;

describe("transformEvent", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDate.mockReturnValue("Formatted Date");
    mockGetEventDurationString.mockReturnValue("2 hours");
  });

  it("should transform a complete Google Calendar event", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Team Meeting",
      description: "Weekly sync",
      location: "Conference Room A",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = transformEvent(event);

    expect(result.eventId).toBe("event-123");
    expect(result.summary).toBe("Team Meeting");
    expect(result.description).toBe("Weekly sync");
    expect(result.location).toBe("Conference Room A");
    expect(result.durationOfEvent).toBe("2 hours");
    expect(result.start).toBe("Formatted Date");
    expect(result.end).toBe("Formatted Date");
  });

  it("should handle event without ID", () => {
    const event: calendar_v3.Schema$Event = {
      summary: "Meeting",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = transformEvent(event);

    expect(result.eventId).toBe("No ID");
  });

  it("should handle event without summary", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = transformEvent(event);

    expect(result.summary).toBe("Untitled Event");
  });

  it("should handle event without description", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Meeting",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = transformEvent(event);

    expect(result.description).toBeNull();
  });

  it("should handle event without location", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Meeting",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    };

    const result = transformEvent(event);

    expect(result.location).toBeNull();
  });

  it("should use date instead of dateTime when available", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "All Day Event",
      start: { date: "2024-01-15" },
      end: { date: "2024-01-16" },
    };

    const result = transformEvent(event);

    expect(mockGetEventDurationString).toHaveBeenCalledWith("2024-01-15", "2024-01-16");
  });

  it("should handle missing start and end dates", () => {
    const event: calendar_v3.Schema$Event = {
      id: "event-123",
      summary: "Meeting",
      start: {},
      end: {},
    };

    mockFormatDate.mockReturnValue(null);

    const result = transformEvent(event);

    expect(result.start).toBeNull();
    expect(result.end).toBeNull();
    expect(result.durationOfEvent).toBeNull();
  });
});

describe("transformEventList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatDate.mockReturnValue("Formatted Date");
    mockGetEventDurationString.mockReturnValue("2 hours");
  });

  it("should transform a list of events", () => {
    const events: calendar_v3.Schema$Event[] = [
      {
        id: "event-1",
        summary: "Meeting 1",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      },
      {
        id: "event-2",
        summary: "Meeting 2",
        start: { dateTime: "2024-01-16T10:00:00Z" },
        end: { dateTime: "2024-01-16T11:00:00Z" },
      },
    ];

    const result = transformEventList(events);

    expect(result.totalNumberOfEventsFound).toBe(2);
    expect(result.totalEventsFound).toHaveLength(2);
    // Events should be reversed
    expect(result.totalEventsFound[0].eventId).toBe("event-2");
    expect(result.totalEventsFound[1].eventId).toBe("event-1");
  });

  it("should handle empty event list", () => {
    const result = transformEventList([]);

    expect(result.totalNumberOfEventsFound).toBe(0);
    expect(result.totalEventsFound).toHaveLength(0);
  });

  it("should reverse the order of events", () => {
    const events: calendar_v3.Schema$Event[] = [
      {
        id: "event-1",
        summary: "First",
        start: { dateTime: "2024-01-15T10:00:00Z" },
        end: { dateTime: "2024-01-15T11:00:00Z" },
      },
      {
        id: "event-2",
        summary: "Second",
        start: { dateTime: "2024-01-16T10:00:00Z" },
        end: { dateTime: "2024-01-16T11:00:00Z" },
      },
      {
        id: "event-3",
        summary: "Third",
        start: { dateTime: "2024-01-17T10:00:00Z" },
        end: { dateTime: "2024-01-17T11:00:00Z" },
      },
    ];

    const result = transformEventList(events);

    expect(result.totalEventsFound[0].summary).toBe("Third");
    expect(result.totalEventsFound[1].summary).toBe("Second");
    expect(result.totalEventsFound[2].summary).toBe("First");
  });
});
