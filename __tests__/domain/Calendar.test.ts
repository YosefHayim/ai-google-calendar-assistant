import { describe, it, expect, beforeEach } from "@jest/globals";
import { Calendar, type CalendarSettings } from "../../domain/entities/Calendar";
import { Event } from "../../domain/entities/Event";

describe("Calendar Entity", () => {
  describe("Constructor and Validation", () => {
    it("should create a valid calendar", () => {
      const settings: CalendarSettings = {
        timeZone: "America/New_York",
        description: "My personal calendar",
        backgroundColor: "#9fe1e7",
        foregroundColor: "#000000",
      };

      const calendar = new Calendar("cal-1", "Personal Calendar", "user-123", settings);

      expect(calendar.id).toBe("cal-1");
      expect(calendar.name).toBe("Personal Calendar");
      expect(calendar.ownerId).toBe("user-123");
      expect(calendar.settings.timeZone).toBe("America/New_York");
      expect(calendar.accessRole).toBe("owner");
    });

    it("should create calendar with minimal settings", () => {
      const settings: CalendarSettings = {
        timeZone: "UTC",
      };

      const calendar = new Calendar("cal-1", "Work Calendar", "user-123", settings);

      expect(calendar.id).toBe("cal-1");
      expect(calendar.settings.timeZone).toBe("UTC");
      expect(calendar.settings.description).toBeUndefined();
    });

    it("should throw error for empty ID", () => {
      const settings: CalendarSettings = { timeZone: "UTC" };

      expect(() => {
        new Calendar("", "Calendar", "user-123", settings);
      }).toThrow("Calendar ID is required");
    });

    it("should throw error for empty name", () => {
      const settings: CalendarSettings = { timeZone: "UTC" };

      expect(() => {
        new Calendar("cal-1", "", "user-123", settings);
      }).toThrow("Calendar name is required");
    });

    it("should throw error for empty owner ID", () => {
      const settings: CalendarSettings = { timeZone: "UTC" };

      expect(() => {
        new Calendar("cal-1", "Calendar", "", settings);
      }).toThrow("Calendar owner ID is required");
    });

    it("should throw error for empty timezone", () => {
      const settings: CalendarSettings = { timeZone: "" };

      expect(() => {
        new Calendar("cal-1", "Calendar", "user-123", settings);
      }).toThrow("Calendar timezone is required");
    });

    it("should throw error for invalid timezone format", () => {
      const settings: CalendarSettings = { timeZone: "Invalid/Timezone!" };

      expect(() => {
        new Calendar("cal-1", "Calendar", "user-123", settings);
      }).toThrow("Invalid timezone format");
    });

    it("should accept valid timezone formats", () => {
      const validTimezones = ["UTC", "GMT", "GMT+5", "America/New_York", "Europe/London", "Asia/Tokyo"];

      for (const tz of validTimezones) {
        const settings: CalendarSettings = { timeZone: tz };
        const calendar = new Calendar(`cal-${tz}`, "Calendar", "user-123", settings);
        expect(calendar.settings.timeZone).toBe(tz);
      }
    });

    it("should throw error for invalid background color", () => {
      const settings: CalendarSettings = {
        timeZone: "UTC",
        backgroundColor: "invalid-color",
      };

      expect(() => {
        new Calendar("cal-1", "Calendar", "user-123", settings);
      }).toThrow("Invalid background color");
    });

    it("should throw error for invalid foreground color", () => {
      const settings: CalendarSettings = {
        timeZone: "UTC",
        foregroundColor: "not-a-color",
      };

      expect(() => {
        new Calendar("cal-1", "Calendar", "user-123", settings);
      }).toThrow("Invalid foreground color");
    });

    it("should accept valid hex colors", () => {
      const settings: CalendarSettings = {
        timeZone: "UTC",
        backgroundColor: "#FF5733",
        foregroundColor: "#000000",
      };

      const calendar = new Calendar("cal-1", "Calendar", "user-123", settings);

      expect(calendar.settings.backgroundColor).toBe("#FF5733");
      expect(calendar.settings.foregroundColor).toBe("#000000");
    });

    it("should accept numeric color IDs", () => {
      const settings: CalendarSettings = {
        timeZone: "UTC",
        backgroundColor: "1",
        foregroundColor: "24",
      };

      const calendar = new Calendar("cal-1", "Calendar", "user-123", settings);

      expect(calendar.settings.backgroundColor).toBe("1");
      expect(calendar.settings.foregroundColor).toBe("24");
    });
  });

  describe("Access Control", () => {
    it("should identify owner correctly", () => {
      const calendar = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "owner",
      );

      expect(calendar.isOwner()).toBe(true);
      expect(calendar.canWrite()).toBe(true);
      expect(calendar.isReadOnly()).toBe(false);
    });

    it("should identify writer correctly", () => {
      const calendar = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "writer",
      );

      expect(calendar.isOwner()).toBe(false);
      expect(calendar.canWrite()).toBe(true);
      expect(calendar.isReadOnly()).toBe(false);
    });

    it("should identify reader correctly", () => {
      const calendar = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "reader",
      );

      expect(calendar.isOwner()).toBe(false);
      expect(calendar.canWrite()).toBe(false);
      expect(calendar.isReadOnly()).toBe(true);
    });

    it("should identify freeBusyReader correctly", () => {
      const calendar = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "freeBusyReader",
      );

      expect(calendar.isOwner()).toBe(false);
      expect(calendar.canWrite()).toBe(false);
      expect(calendar.isReadOnly()).toBe(true);
    });
  });

  describe("Calendar Updates", () => {
    let calendar: Calendar;

    beforeEach(() => {
      calendar = new Calendar("cal-1", "Original Name", "user-123", { timeZone: "UTC" });
    });

    it("should update calendar name", () => {
      calendar.updateName("Updated Name");

      expect(calendar.name).toBe("Updated Name");
      expect(calendar.updatedAt).toBeDefined();
    });

    it("should throw error when updating name to empty string", () => {
      expect(() => {
        calendar.updateName("");
      }).toThrow("Calendar name cannot be empty");
    });

    it("should update calendar description", () => {
      calendar.updateDescription("New description");

      expect(calendar.settings.description).toBe("New description");
      expect(calendar.updatedAt).toBeDefined();
    });

    it("should update calendar timezone", () => {
      calendar.updateTimeZone("America/Los_Angeles");

      expect(calendar.settings.timeZone).toBe("America/Los_Angeles");
      expect(calendar.updatedAt).toBeDefined();
    });

    it("should throw error for invalid timezone when updating", () => {
      expect(() => {
        calendar.updateTimeZone("Invalid/Zone!");
      }).toThrow("Invalid timezone format");
    });

    it("should update calendar colors", () => {
      calendar.updateColors("#FF5733", "#FFFFFF");

      expect(calendar.settings.backgroundColor).toBe("#FF5733");
      expect(calendar.settings.foregroundColor).toBe("#FFFFFF");
      expect(calendar.updatedAt).toBeDefined();
    });

    it("should update only background color", () => {
      calendar.updateColors("#FF5733");

      expect(calendar.settings.backgroundColor).toBe("#FF5733");
      expect(calendar.updatedAt).toBeDefined();
    });

    it("should throw error for invalid background color when updating", () => {
      expect(() => {
        calendar.updateColors("invalid");
      }).toThrow("Invalid background color");
    });

    it("should throw error for invalid foreground color when updating", () => {
      expect(() => {
        calendar.updateColors(undefined, "invalid");
      }).toThrow("Invalid foreground color");
    });
  });

  describe("Event Validation", () => {
    let calendar: Calendar;
    let event: Event;

    beforeEach(() => {
      calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "UTC" });
      event = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
      );
    });

    it("should allow adding event to writable calendar", () => {
      expect(() => {
        calendar.validateEventAddition(event);
      }).not.toThrow();
    });

    it("should throw error when adding event to read-only calendar", () => {
      const readOnlyCalendar = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        { timeZone: "UTC" },
        false,
        "reader",
      );

      expect(() => {
        readOnlyCalendar.validateEventAddition(event);
      }).toThrow("Cannot add event to read-only calendar");
    });

    it("should throw error when adding cancelled event", () => {
      const cancelledEvent = new Event(
        "event-1",
        "Meeting",
        { dateTime: "2024-12-01T10:00:00Z" },
        { dateTime: "2024-12-01T11:00:00Z" },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        "cancelled",
      );

      expect(() => {
        calendar.validateEventAddition(cancelledEvent);
      }).toThrow("Cannot add cancelled event to calendar");
    });
  });

  describe("Calendar Cloning", () => {
    it("should clone calendar with new ID and owner", () => {
      const original = new Calendar(
        "cal-1",
        "Personal Calendar",
        "user-123",
        {
          timeZone: "America/New_York",
          description: "My calendar",
          backgroundColor: "#FF5733",
        },
        true,
      );

      const cloned = original.clone("cal-2", "user-456");

      expect(cloned.id).toBe("cal-2");
      expect(cloned.ownerId).toBe("user-456");
      expect(cloned.name).toBe(original.name);
      expect(cloned.settings.timeZone).toBe(original.settings.timeZone);
      expect(cloned.isDefault).toBe(false); // Clone is never default
      expect(cloned.accessRole).toBe("owner"); // Clone owner gets full access
    });

    it("should deep copy settings when cloning", () => {
      const original = new Calendar("cal-1", "Calendar", "user-123", {
        timeZone: "UTC",
        description: "Original",
      });

      const cloned = original.clone("cal-2", "user-456");

      cloned.updateDescription("Updated");

      expect(original.settings.description).toBe("Original");
      expect(cloned.settings.description).toBe("Updated");
    });
  });

  describe("Serialization", () => {
    it("should convert to plain object", () => {
      const settings: CalendarSettings = {
        timeZone: "America/New_York",
        description: "Calendar description",
        backgroundColor: "#FF5733",
      };

      const calendar = new Calendar("cal-1", "My Calendar", "user-123", settings, true);

      const obj = calendar.toObject();

      expect(obj.id).toBe("cal-1");
      expect(obj.name).toBe("My Calendar");
      expect(obj.ownerId).toBe("user-123");
      expect(obj.settings.timeZone).toBe("America/New_York");
      expect(obj.isDefault).toBe(true);
    });

    it("should create from plain object", () => {
      const obj = {
        id: "cal-1",
        name: "My Calendar",
        ownerId: "user-123",
        settings: {
          timeZone: "UTC",
          description: "Description",
        },
        isDefault: false,
        accessRole: "writer" as const,
      };

      const calendar = Calendar.fromObject(obj);

      expect(calendar.id).toBe("cal-1");
      expect(calendar.name).toBe("My Calendar");
      expect(calendar.ownerId).toBe("user-123");
      expect(calendar.settings.timeZone).toBe("UTC");
      expect(calendar.accessRole).toBe("writer");
    });

    it("should round-trip through serialization", () => {
      const original = new Calendar(
        "cal-1",
        "Calendar",
        "user-123",
        {
          timeZone: "America/New_York",
          description: "Test calendar",
        },
        true,
      );

      const obj = original.toObject();
      const restored = Calendar.fromObject(obj);

      expect(restored.id).toBe(original.id);
      expect(restored.name).toBe(original.name);
      expect(restored.ownerId).toBe(original.ownerId);
      expect(restored.settings).toEqual(original.settings);
      expect(restored.isDefault).toBe(original.isDefault);
    });
  });

  describe("Default Calendar", () => {
    it("should create default calendar", () => {
      const calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "UTC" }, true);

      expect(calendar.isDefault).toBe(true);
    });

    it("should create non-default calendar", () => {
      const calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "UTC" }, false);

      expect(calendar.isDefault).toBe(false);
    });

    it("should default isDefault to false if not specified", () => {
      const calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "UTC" });

      expect(calendar.isDefault).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("should handle calendar with minimal settings", () => {
      const calendar = new Calendar("cal-1", "Minimal", "user-123", { timeZone: "UTC" });

      expect(calendar.settings.description).toBeUndefined();
      expect(calendar.settings.backgroundColor).toBeUndefined();
      expect(calendar.settings.foregroundColor).toBeUndefined();
      expect(calendar.settings.location).toBeUndefined();
    });

    it("should handle calendar with all settings", () => {
      const settings: CalendarSettings = {
        timeZone: "America/New_York",
        description: "Full description",
        backgroundColor: "#FF5733",
        foregroundColor: "#FFFFFF",
        location: "New York, NY",
      };

      const calendar = new Calendar("cal-1", "Full Calendar", "user-123", settings);

      expect(calendar.settings.description).toBe("Full description");
      expect(calendar.settings.backgroundColor).toBe("#FF5733");
      expect(calendar.settings.foregroundColor).toBe("#FFFFFF");
      expect(calendar.settings.location).toBe("New York, NY");
    });

    it("should preserve immutable fields", () => {
      const calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "UTC" });

      // ID and ownerId should be readonly (compile-time only)
      // Verify they are set correctly and don't have setters
      expect(calendar.id).toBe("cal-1");
      expect(calendar.ownerId).toBe("user-123");

      // Verify these are the values from constructor
      const obj = calendar.toObject();
      expect(obj.id).toBe("cal-1");
      expect(obj.ownerId).toBe("user-123");
    });

    it("should handle timezone with offset", () => {
      const calendar = new Calendar("cal-1", "Calendar", "user-123", { timeZone: "GMT+5" });

      expect(calendar.settings.timeZone).toBe("GMT+5");
    });
  });
});
