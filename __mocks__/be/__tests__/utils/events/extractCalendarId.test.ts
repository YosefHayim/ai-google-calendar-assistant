import { describe, it, expect } from "@jest/globals";
import { extractCalendarId } from "@/utils/events/extractCalendarId";
import type { Request } from "express";

describe("extractCalendarId", () => {
  it("should return calendarId from extra parameter", () => {
    const extra = { calendarId: "extra-calendar" };
    const result = extractCalendarId(null, extra, {});
    expect(result).toBe("extra-calendar");
  });

  it("should return calendarId from eventData", () => {
    const eventData = { calendarId: "event-calendar" };
    const result = extractCalendarId(null, {}, eventData);
    expect(result).toBe("event-calendar");
  });

  it("should return calendarId from query params", () => {
    const req = { query: { calendarId: "query-calendar" } } as unknown as Request;
    const result = extractCalendarId(req, {}, {});
    expect(result).toBe("query-calendar");
  });

  it("should return calendarId from request body", () => {
    const req = { body: { calendarId: "body-calendar" } } as unknown as Request;
    const result = extractCalendarId(req, {}, {});
    expect(result).toBe("body-calendar");
  });

  it("should prioritize extra over other sources", () => {
    const req = {
      query: { calendarId: "query-calendar" },
      body: { calendarId: "body-calendar" }
    } as unknown as Request;
    const extra = { calendarId: "extra-calendar" };
    const eventData = { calendarId: "event-calendar" };

    const result = extractCalendarId(req, extra, eventData);
    expect(result).toBe("extra-calendar");
  });

  it("should prioritize eventData over query and body", () => {
    const req = {
      query: { calendarId: "query-calendar" },
      body: { calendarId: "body-calendar" }
    } as unknown as Request;
    const eventData = { calendarId: "event-calendar" };

    const result = extractCalendarId(req, {}, eventData);
    expect(result).toBe("event-calendar");
  });

  it("should prioritize query over body", () => {
    const req = {
      query: { calendarId: "query-calendar" },
      body: { calendarId: "body-calendar" }
    } as unknown as Request;

    const result = extractCalendarId(req, {}, {});
    expect(result).toBe("query-calendar");
  });

  it("should return 'primary' as default when no calendarId is found", () => {
    const result = extractCalendarId(null, {}, {});
    expect(result).toBe("primary");
  });

  it("should return 'primary' when req is null", () => {
    const result = extractCalendarId(null);
    expect(result).toBe("primary");
  });

  it("should return 'primary' when all parameters are undefined", () => {
    const result = extractCalendarId(undefined, undefined, undefined);
    expect(result).toBe("primary");
  });
});
