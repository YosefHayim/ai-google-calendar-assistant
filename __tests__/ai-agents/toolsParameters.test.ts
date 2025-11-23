import { PARAMETERS_TOOLS } from "@/ai-agents/toolsParameters";
import { z } from "zod";

describe("Tools Parameters", () => {
  describe("Structure", () => {
    it("should export all required parameter schemas", () => {
      expect(PARAMETERS_TOOLS).toHaveProperty("generateUserCbGoogleUrlParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("registerUserParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("validateUserDbParametersToRegisterUser");
      expect(PARAMETERS_TOOLS).toHaveProperty("validateUserDbParameter");
      expect(PARAMETERS_TOOLS).toHaveProperty("getUserDefaultTimeZone");
      expect(PARAMETERS_TOOLS).toHaveProperty("getEventParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("getCalendarTypesByEventParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("insertEventParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("updateEventParameters");
      expect(PARAMETERS_TOOLS).toHaveProperty("deleteEventParameter");
      expect(PARAMETERS_TOOLS).toHaveProperty("normalizedEventParams");
      expect(PARAMETERS_TOOLS).toHaveProperty("getAgentName");
      expect(PARAMETERS_TOOLS).toHaveProperty("setAgentName");
      expect(PARAMETERS_TOOLS).toHaveProperty("get_user_routines");
      expect(PARAMETERS_TOOLS).toHaveProperty("get_upcoming_predictions");
      expect(PARAMETERS_TOOLS).toHaveProperty("suggest_optimal_time");
      expect(PARAMETERS_TOOLS).toHaveProperty("get_routine_insights");
      expect(PARAMETERS_TOOLS).toHaveProperty("set_user_goal");
      expect(PARAMETERS_TOOLS).toHaveProperty("get_goal_progress");
      expect(PARAMETERS_TOOLS).toHaveProperty("get_schedule_statistics");
    });

    it("all parameters should be Zod schemas", () => {
      Object.values(PARAMETERS_TOOLS).forEach((param) => {
        expect(param).toBeInstanceOf(z.ZodType);
      });
    });
  });

  describe("generateUserCbGoogleUrlParameters", () => {
    it("should be an empty object schema", () => {
      const result = PARAMETERS_TOOLS.generateUserCbGoogleUrlParameters.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should accept empty object", () => {
      const result = PARAMETERS_TOOLS.generateUserCbGoogleUrlParameters.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({});
      }
    });
  });

  describe("registerUserParameters", () => {
    it("should validate correct email and password", () => {
      const result = PARAMETERS_TOOLS.registerUserParameters.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = PARAMETERS_TOOLS.registerUserParameters.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password too short", () => {
      const result = PARAMETERS_TOOLS.registerUserParameters.safeParse({
        email: "test@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password too long", () => {
      const result = PARAMETERS_TOOLS.registerUserParameters.safeParse({
        email: "test@example.com",
        password: "a".repeat(73),
      });
      expect(result.success).toBe(false);
    });

    it("should accept password within valid range", () => {
      const result = PARAMETERS_TOOLS.registerUserParameters.safeParse({
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("validateUserDbParameter", () => {
    it("should validate correct email", () => {
      const result = PARAMETERS_TOOLS.validateUserDbParameter.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = PARAMETERS_TOOLS.validateUserDbParameter.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getUserDefaultTimeZone", () => {
    it("should validate correct email", () => {
      const result = PARAMETERS_TOOLS.getUserDefaultTimeZone.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = PARAMETERS_TOOLS.getUserDefaultTimeZone.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("getEventParameters", () => {
    it("should validate with required email", () => {
      const result = PARAMETERS_TOOLS.getEventParameters.safeParse({
        email: "test@example.com",
        timeMin: null,
        q: null,
        customEvents: null,
      });
      expect(result.success).toBe(true);
    });

    it("should validate with optional parameters", () => {
      const result = PARAMETERS_TOOLS.getEventParameters.safeParse({
        email: "test@example.com",
        timeMin: "2025-01-01T00:00:00Z",
        q: "meeting",
        customEvents: true,
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = PARAMETERS_TOOLS.getEventParameters.safeParse({
        email: "invalid-email",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("insertEventParameters", () => {
    it("should validate complete event data", () => {
      const result = PARAMETERS_TOOLS.insertEventParameters.safeParse({
        email: "test@example.com",
        summary: "Test Event",
        description: "Test Description",
        location: "Test Location",
        calendarId: "primary",
        start: {
          dateTime: "2025-01-01T10:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
        end: {
          dateTime: "2025-01-01T11:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should handle missing optional fields", () => {
      const result = PARAMETERS_TOOLS.insertEventParameters.safeParse({
        email: "test@example.com",
        summary: "Test Event",
        start: {
          dateTime: "2025-01-01T10:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
        end: {
          dateTime: "2025-01-01T11:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
      });
      expect(result.success).toBe(true);
    });
  });

  describe("updateEventParameters", () => {
    it("should validate with eventId", () => {
      const result = PARAMETERS_TOOLS.updateEventParameters.safeParse({
        email: "test@example.com",
        eventId: "event123",
        summary: "Updated Event",
        calendarId: "primary",
        start: {
          dateTime: "2025-01-01T10:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
        end: {
          dateTime: "2025-01-01T11:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
      });
      expect(result.success).toBe(true);
    });

    it("should accept empty string for eventId due to coercion", () => {
      const result = PARAMETERS_TOOLS.updateEventParameters.safeParse({
        email: "test@example.com",
        eventId: "",
        summary: "Updated Event",
        start: {
          dateTime: "2025-01-01T10:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
        end: {
          dateTime: "2025-01-01T11:00:00Z",
          timeZone: "Asia/Jerusalem",
          date: null,
        },
      });
      // Zod coercion allows empty strings
      expect(result.success).toBe(true);
    });
  });

  describe("deleteEventParameter", () => {
    it("should validate with eventId and email", () => {
      const result = PARAMETERS_TOOLS.deleteEventParameter.safeParse({
        email: "test@example.com",
        eventId: "event123",
      });
      expect(result.success).toBe(true);
    });

    it("should handle validation for both fields", () => {
      const validResult = PARAMETERS_TOOLS.deleteEventParameter.safeParse({
        email: "test@example.com",
        eventId: "event123",
      });
      expect(validResult.success).toBe(true);

      const invalidEmailResult = PARAMETERS_TOOLS.deleteEventParameter.safeParse({
        email: "invalid-email",
        eventId: "event123",
      });
      expect(invalidEmailResult.success).toBe(false);
    });
  });

  describe("getAgentName", () => {
    it("should validate with email and chatId", () => {
      const result = PARAMETERS_TOOLS.getAgentName.safeParse({
        email: "test@example.com",
        chatId: 123456,
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing chatId", () => {
      const result = PARAMETERS_TOOLS.getAgentName.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(false);
    });

    it("should coerce string chatId to number", () => {
      const result = PARAMETERS_TOOLS.getAgentName.safeParse({
        email: "test@example.com",
        chatId: "123456",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.chatId).toBe("number");
      }
    });
  });

  describe("setAgentName", () => {
    it("should validate with email, chatId, and agentName", () => {
      const result = PARAMETERS_TOOLS.setAgentName.safeParse({
        email: "test@example.com",
        chatId: 123456,
        agentName: "Sarah",
      });
      expect(result.success).toBe(true);
    });

    it("should trim and validate agentName", () => {
      const validResult = PARAMETERS_TOOLS.setAgentName.safeParse({
        email: "test@example.com",
        chatId: 123456,
        agentName: "Sarah",
      });
      expect(validResult.success).toBe(true);

      const whitespaceOnlyResult = PARAMETERS_TOOLS.setAgentName.safeParse({
        email: "test@example.com",
        chatId: 123456,
        agentName: "   ",
      });
      // Should fail because whitespace-only gets trimmed to empty string
      expect(whitespaceOnlyResult.success).toBe(false);
    });
  });

  describe("get_user_routines", () => {
    it("should validate with email only", () => {
      const result = PARAMETERS_TOOLS.get_user_routines.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with routineType", () => {
      const result = PARAMETERS_TOOLS.get_user_routines.safeParse({
        email: "test@example.com",
        routineType: "daily",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid routineType", () => {
      const result = PARAMETERS_TOOLS.get_user_routines.safeParse({
        email: "test@example.com",
        routineType: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("get_upcoming_predictions", () => {
    it("should validate with email only", () => {
      const result = PARAMETERS_TOOLS.get_upcoming_predictions.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with daysAhead", () => {
      const result = PARAMETERS_TOOLS.get_upcoming_predictions.safeParse({
        email: "test@example.com",
        daysAhead: 14,
      });
      expect(result.success).toBe(true);
    });

    it("should reject daysAhead too large", () => {
      const result = PARAMETERS_TOOLS.get_upcoming_predictions.safeParse({
        email: "test@example.com",
        daysAhead: 31,
      });
      expect(result.success).toBe(false);
    });

    it("should reject daysAhead too small", () => {
      const result = PARAMETERS_TOOLS.get_upcoming_predictions.safeParse({
        email: "test@example.com",
        daysAhead: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("suggest_optimal_time", () => {
    it("should validate with required parameters", () => {
      const result = PARAMETERS_TOOLS.suggest_optimal_time.safeParse({
        email: "test@example.com",
        eventDuration: 60,
      });
      expect(result.success).toBe(true);
    });

    it("should validate with optional preferredTime", () => {
      const result = PARAMETERS_TOOLS.suggest_optimal_time.safeParse({
        email: "test@example.com",
        eventDuration: 60,
        preferredTime: "2025-01-01T10:00:00Z",
      });
      expect(result.success).toBe(true);
    });

    it("should reject duration too short", () => {
      const result = PARAMETERS_TOOLS.suggest_optimal_time.safeParse({
        email: "test@example.com",
        eventDuration: 10,
      });
      expect(result.success).toBe(false);
    });

    it("should reject duration too long", () => {
      const result = PARAMETERS_TOOLS.suggest_optimal_time.safeParse({
        email: "test@example.com",
        eventDuration: 500,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("get_routine_insights", () => {
    it("should validate with email only", () => {
      const result = PARAMETERS_TOOLS.get_routine_insights.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("set_user_goal", () => {
    it("should validate with required parameters", () => {
      const result = PARAMETERS_TOOLS.set_user_goal.safeParse({
        email: "test@example.com",
        goalType: "gym",
        target: 3,
      });
      expect(result.success).toBe(true);
    });

    it("should validate with all parameters", () => {
      const result = PARAMETERS_TOOLS.set_user_goal.safeParse({
        email: "test@example.com",
        goalType: "gym",
        target: 3,
        current: 1,
        deadline: "2025-12-31T23:59:59Z",
        description: "Go to gym 3 times a week",
      });
      expect(result.success).toBe(true);
    });

    it("should reject missing target", () => {
      const result = PARAMETERS_TOOLS.set_user_goal.safeParse({
        email: "test@example.com",
        goalType: "gym",
      });
      expect(result.success).toBe(false);
    });

    it("should reject target less than 1", () => {
      const result = PARAMETERS_TOOLS.set_user_goal.safeParse({
        email: "test@example.com",
        goalType: "gym",
        target: 0,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("get_goal_progress", () => {
    it("should validate with email only", () => {
      const result = PARAMETERS_TOOLS.get_goal_progress.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with goalType", () => {
      const result = PARAMETERS_TOOLS.get_goal_progress.safeParse({
        email: "test@example.com",
        goalType: "gym",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("get_schedule_statistics", () => {
    it("should validate with email only", () => {
      const result = PARAMETERS_TOOLS.get_schedule_statistics.safeParse({
        email: "test@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("should validate with all parameters", () => {
      const result = PARAMETERS_TOOLS.get_schedule_statistics.safeParse({
        email: "test@example.com",
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-01-31T23:59:59Z",
        periodType: "daily",
        statisticsType: "basic",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid periodType", () => {
      const result = PARAMETERS_TOOLS.get_schedule_statistics.safeParse({
        email: "test@example.com",
        periodType: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid statisticsType", () => {
      const result = PARAMETERS_TOOLS.get_schedule_statistics.safeParse({
        email: "test@example.com",
        statisticsType: "invalid",
      });
      expect(result.success).toBe(false);
    });
  });
});
