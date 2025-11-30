import { describe, it, expect } from "@jest/globals";
import { isUserDto } from "@/domain/dto/UserDto";

describe("UserDto", () => {
  describe("isUserDto", () => {
    it("should return true for valid UserDto", () => {
      const validDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {
          firstName: "John",
          lastName: "Doe",
        },
        preferences: {
          timezone: "America/New_York",
          language: "en",
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
      };

      expect(isUserDto(validDto)).toBe(true);
    });

    it("should return true for valid UserDto without optional fields", () => {
      const validDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {},
        preferences: {},
        isActive: false,
      };

      expect(isUserDto(validDto)).toBe(true);
    });

    it("should return false for null", () => {
      expect(isUserDto(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isUserDto(undefined)).toBe(false);
    });

    it("should return false for non-object types", () => {
      expect(isUserDto("string")).toBe(false);
      expect(isUserDto(123)).toBe(false);
      expect(isUserDto(true)).toBe(false);
    });

    it("should return false when id is missing", () => {
      const invalidDto = {
        email: "test@example.com",
        profile: {},
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when email is missing", () => {
      const invalidDto = {
        id: "user-123",
        profile: {},
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when profile is missing", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when preferences is missing", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when isActive is missing", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {},
        preferences: {},
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when id is not a string", () => {
      const invalidDto = {
        id: 123,
        email: "test@example.com",
        profile: {},
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when email is not a string", () => {
      const invalidDto = {
        id: "user-123",
        email: 123,
        profile: {},
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when profile is not an object", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        profile: "invalid",
        preferences: {},
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when preferences is not an object", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {},
        preferences: "invalid",
        isActive: true,
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });

    it("should return false when isActive is not a boolean", () => {
      const invalidDto = {
        id: "user-123",
        email: "test@example.com",
        profile: {},
        preferences: {},
        isActive: "true",
      };

      expect(isUserDto(invalidDto)).toBe(false);
    });
  });
});
