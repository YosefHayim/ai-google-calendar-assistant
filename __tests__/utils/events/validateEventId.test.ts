import { describe, it, expect } from "@jest/globals";
import { validateEventId } from "@/utils/events/validateEventId";
import { ACTION } from "@/types";

describe("validateEventId", () => {
  it("should throw error for UPDATE action without event ID", () => {
    expect(() => validateEventId(ACTION.UPDATE, {})).toThrow(
      "Event ID is required for update or delete action"
    );
  });

  it("should throw error for DELETE action without event ID", () => {
    expect(() => validateEventId(ACTION.DELETE, {})).toThrow(
      "Event ID is required for update or delete action"
    );
  });

  it("should not throw error for UPDATE action with event ID", () => {
    expect(() => validateEventId(ACTION.UPDATE, { id: "event-123" })).not.toThrow();
  });

  it("should not throw error for DELETE action with event ID", () => {
    expect(() => validateEventId(ACTION.DELETE, { id: "event-123" })).not.toThrow();
  });

  it("should not throw error for LIST action without event ID", () => {
    expect(() => validateEventId(ACTION.LIST, {})).not.toThrow();
  });

  it("should not throw error for INSERT action without event ID", () => {
    expect(() => validateEventId(ACTION.INSERT, {})).not.toThrow();
  });

  it("should not throw error when action is undefined", () => {
    expect(() => validateEventId(undefined, {})).not.toThrow();
  });

  it("should not throw error when eventData is undefined", () => {
    expect(() => validateEventId(ACTION.LIST, undefined)).not.toThrow();
  });

  it("should handle null event ID as missing", () => {
    expect(() => validateEventId(ACTION.UPDATE, { id: null as unknown as string })).toThrow(
      "Event ID is required for update or delete action"
    );
  });

  it("should handle undefined event ID as missing", () => {
    expect(() => validateEventId(ACTION.DELETE, { id: undefined })).toThrow(
      "Event ID is required for update or delete action"
    );
  });
});
