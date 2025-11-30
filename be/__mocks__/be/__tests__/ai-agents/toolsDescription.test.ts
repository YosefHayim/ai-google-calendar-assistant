import { TOOLS_DESCRIPTION } from "@/ai-agents/toolsDescription";

describe("Tools Description", () => {
  describe("Structure", () => {
    it("should export all required tool descriptions", () => {
      expect(TOOLS_DESCRIPTION).toHaveProperty("generateUserCbGoogleUrlDescription");
      expect(TOOLS_DESCRIPTION).toHaveProperty("registerUserViaDb");
      expect(TOOLS_DESCRIPTION).toHaveProperty("validateUser");
      expect(TOOLS_DESCRIPTION).toHaveProperty("validateEventFields");
      expect(TOOLS_DESCRIPTION).toHaveProperty("insertEvent");
      expect(TOOLS_DESCRIPTION).toHaveProperty("getEvent");
      expect(TOOLS_DESCRIPTION).toHaveProperty("updateEvent");
      expect(TOOLS_DESCRIPTION).toHaveProperty("deleteEvent");
      expect(TOOLS_DESCRIPTION).toHaveProperty("getCalendarTypesByEventDetails");
      expect(TOOLS_DESCRIPTION).toHaveProperty("getUserDefaultTimeZone");
      expect(TOOLS_DESCRIPTION).toHaveProperty("getAgentName");
      expect(TOOLS_DESCRIPTION).toHaveProperty("setAgentName");
      expect(TOOLS_DESCRIPTION).toHaveProperty("get_user_routines");
      expect(TOOLS_DESCRIPTION).toHaveProperty("get_upcoming_predictions");
      expect(TOOLS_DESCRIPTION).toHaveProperty("suggest_optimal_time");
      expect(TOOLS_DESCRIPTION).toHaveProperty("get_routine_insights");
      expect(TOOLS_DESCRIPTION).toHaveProperty("set_user_goal");
      expect(TOOLS_DESCRIPTION).toHaveProperty("get_goal_progress");
      expect(TOOLS_DESCRIPTION).toHaveProperty("get_schedule_statistics");
    });
  });

  describe("Description Content", () => {
    it("generateUserCbGoogleUrlDescription should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.generateUserCbGoogleUrlDescription).toBeDefined();
      expect(TOOLS_DESCRIPTION.generateUserCbGoogleUrlDescription.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.generateUserCbGoogleUrlDescription).toContain("OAuth");
      expect(TOOLS_DESCRIPTION.generateUserCbGoogleUrlDescription).toContain("URL");
    });

    it("registerUserViaDb should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.registerUserViaDb).toBeDefined();
      expect(TOOLS_DESCRIPTION.registerUserViaDb.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.registerUserViaDb).toContain("email");
      expect(TOOLS_DESCRIPTION.registerUserViaDb).toContain("password");
    });

    it("validateUser should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.validateUser).toBeDefined();
      expect(TOOLS_DESCRIPTION.validateUser.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.validateUser).toContain("email");
    });

    it("validateEventFields should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.validateEventFields).toBeDefined();
      expect(TOOLS_DESCRIPTION.validateEventFields.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.validateEventFields).toContain("event");
    });

    it("insertEvent should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.insertEvent).toBeDefined();
      expect(TOOLS_DESCRIPTION.insertEvent.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.insertEvent).toContain("event");
    });

    it("getEvent should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.getEvent).toBeDefined();
      expect(TOOLS_DESCRIPTION.getEvent.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.getEvent).toContain("email");
    });

    it("updateEvent should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.updateEvent).toBeDefined();
      expect(TOOLS_DESCRIPTION.updateEvent.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.updateEvent).toContain("event");
    });

    it("deleteEvent should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.deleteEvent).toBeDefined();
      expect(TOOLS_DESCRIPTION.deleteEvent.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.deleteEvent).toContain("event");
    });

    it("getCalendarTypesByEventDetails should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.getCalendarTypesByEventDetails).toBeDefined();
      expect(TOOLS_DESCRIPTION.getCalendarTypesByEventDetails.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.getCalendarTypesByEventDetails).toContain("calendar");
    });

    it("getUserDefaultTimeZone should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.getUserDefaultTimeZone).toBeDefined();
      expect(TOOLS_DESCRIPTION.getUserDefaultTimeZone.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.getUserDefaultTimeZone).toContain("timezone");
    });

    it("getAgentName should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.getAgentName).toBeDefined();
      expect(TOOLS_DESCRIPTION.getAgentName.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.getAgentName).toContain("agent");
    });

    it("setAgentName should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.setAgentName).toBeDefined();
      expect(TOOLS_DESCRIPTION.setAgentName.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.setAgentName).toContain("agent");
    });

    it("get_user_routines should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.get_user_routines).toBeDefined();
      expect(TOOLS_DESCRIPTION.get_user_routines.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.get_user_routines).toContain("routine");
    });

    it("get_upcoming_predictions should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.get_upcoming_predictions).toBeDefined();
      expect(TOOLS_DESCRIPTION.get_upcoming_predictions.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.get_upcoming_predictions).toContain("predict");
    });

    it("suggest_optimal_time should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.suggest_optimal_time).toBeDefined();
      expect(TOOLS_DESCRIPTION.suggest_optimal_time.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.suggest_optimal_time).toContain("time");
    });

    it("get_routine_insights should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.get_routine_insights).toBeDefined();
      expect(TOOLS_DESCRIPTION.get_routine_insights.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.get_routine_insights).toContain("routine");
    });

    it("set_user_goal should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.set_user_goal).toBeDefined();
      expect(TOOLS_DESCRIPTION.set_user_goal.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.set_user_goal).toContain("goal");
    });

    it("get_goal_progress should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.get_goal_progress).toBeDefined();
      expect(TOOLS_DESCRIPTION.get_goal_progress.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.get_goal_progress).toContain("goal");
    });

    it("get_schedule_statistics should be defined and non-empty", () => {
      expect(TOOLS_DESCRIPTION.get_schedule_statistics).toBeDefined();
      expect(TOOLS_DESCRIPTION.get_schedule_statistics.length).toBeGreaterThan(0);
      expect(TOOLS_DESCRIPTION.get_schedule_statistics).toContain("statistics");
    });
  });

  describe("All Descriptions Quality", () => {
    it("all descriptions should be strings", () => {
      Object.values(TOOLS_DESCRIPTION).forEach((description) => {
        expect(typeof description).toBe("string");
      });
    });

    it("all descriptions should be non-empty", () => {
      Object.values(TOOLS_DESCRIPTION).forEach((description) => {
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it("all descriptions should be reasonable length (at least 20 chars)", () => {
      Object.values(TOOLS_DESCRIPTION).forEach((description) => {
        expect(description.length).toBeGreaterThan(20);
      });
    });
  });
});
