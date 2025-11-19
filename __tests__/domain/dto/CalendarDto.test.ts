import { describe, it, expect } from "@jest/globals";
import { isCalendarDto } from "@/domain/dto/CalendarDto";

describe("CalendarDto", () => {
  describe("isCalendarDto", () => {
    it("should return true for valid CalendarDto", () => {
      const validDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {
          timeZone: "America/New_York",
          defaultVisibility: "default" as const,
        },
        isDefault: true,
        accessRole: "owner" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(isCalendarDto(validDto)).toBe(true);
    });

    it("should return true for valid CalendarDto without optional fields", () => {
      const validDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: false,
        accessRole: "reader" as const,
      };

      expect(isCalendarDto(validDto)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isCalendarDto(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isCalendarDto(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isCalendarDto("string")).toBe(false);
      expect(isCalendarDto(123)).toBe(false);
      expect(isCalendarDto(true)).toBe(false);
    });

    it("should return false when id is missing", () => {
      const invalidDto = {
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when name is missing", () => {
      const invalidDto = {
        id: "cal-123",
        ownerId: "user-456",
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when ownerId is missing", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when settings is missing", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when isDefault is missing", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when accessRole is missing", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: true,
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when id is not a string", () => {
      const invalidDto = {
        id: 123,
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when name is not a string", () => {
      const invalidDto = {
        id: "cal-123",
        name: 123,
        ownerId: "user-456",
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when ownerId is not a string", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: 123,
        settings: {},
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when settings is not an object", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: "invalid",
        isDefault: true,
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when isDefault is not a boolean", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: "true",
        accessRole: "owner",
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });

    it("should return false when accessRole is not a string", () => {
      const invalidDto = {
        id: "cal-123",
        name: "My Calendar",
        ownerId: "user-456",
        settings: {},
        isDefault: true,
        accessRole: 123,
      };

      expect(isCalendarDto(invalidDto)).toBe(false);
    });
  });
});
