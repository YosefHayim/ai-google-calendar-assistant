import { describe, it, expect } from "@jest/globals";
import { normalizeListParams } from "@/utils/events/normalizeListParams";
import type { Request } from "express";

describe("normalizeListParams", () => {
  it("should return default list params when no inputs provided", () => {
    const result = normalizeListParams(null, {});

    expect(result.listParams.calendarId).toBe("primary");
    expect(result.listParams.maxResults).toBe(2499);
    expect(result.listParams.prettyPrint).toBe(true);
    expect(result.customFlag).toBe(false);
  });

  it("should extract customEvents flag", () => {
    const extra = { customEvents: true };
    const result = normalizeListParams(null, extra);

    expect(result.customFlag).toBe(true);
  });

  it("should use calendarId from extra", () => {
    const extra = { calendarId: "test-calendar" };
    const result = normalizeListParams(null, extra);

    expect(result.listParams.calendarId).toBe("test-calendar");
  });

  it("should merge request body params", () => {
    const req = {
      body: { calendarId: "body-calendar", timeMin: "2024-01-01T00:00:00Z" }
    } as unknown as Request;

    const result = normalizeListParams(req, {});

    expect(result.listParams.calendarId).toBe("body-calendar");
    expect(result.listParams.timeMin).toBe("2024-01-01T00:00:00Z");
  });

  it("should merge request query params", () => {
    const req = {
      query: { calendarId: "query-calendar", maxResults: "100" }
    } as unknown as Request;

    const result = normalizeListParams(req, {});

    expect(result.listParams.calendarId).toBe("query-calendar");
    expect(result.listParams.maxResults).toBe("100");
  });

  it("should prioritize query over body and extra params", () => {
    const req = {
      body: { calendarId: "body-calendar" },
      query: { calendarId: "query-calendar" }
    } as unknown as Request;
    const extra = { calendarId: "extra-calendar" };

    const result = normalizeListParams(req, extra);

    expect(result.listParams.calendarId).toBe("query-calendar");
  });

  it("should omit email from listParams", () => {
    const extra = { email: "test@example.com", calendarId: "test-calendar" };
    const result = normalizeListParams(null, extra);

    expect(result.listParams).not.toHaveProperty("email");
  });

  it("should omit customEvents from listParams", () => {
    const extra = { customEvents: true, calendarId: "test-calendar" };
    const result = normalizeListParams(null, extra);

    expect(result.listParams).not.toHaveProperty("customEvents");
  });

  it("should remove falsy q parameter", () => {
    const extra = { q: "" };
    const result = normalizeListParams(null, extra);

    expect(result.listParams.q).toBeUndefined();
  });

  it("should keep truthy q parameter", () => {
    const extra = { q: "search term" };
    const result = normalizeListParams(null, extra);

    expect(result.listParams.q).toBe("search term");
  });

  it("should handle null request", () => {
    const result = normalizeListParams(null, {});

    expect(result.listParams.calendarId).toBe("primary");
  });

  it("should handle customEvents as string 'true'", () => {
    const extra = { customEvents: "true" };
    const result = normalizeListParams(null, extra);

    expect(result.customFlag).toBe(true);
  });

  it("should handle customEvents as falsy value", () => {
    const extra = { customEvents: false };
    const result = normalizeListParams(null, extra);

    expect(result.customFlag).toBe(false);
  });
});
