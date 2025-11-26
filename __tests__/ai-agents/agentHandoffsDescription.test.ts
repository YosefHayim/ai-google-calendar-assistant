import { AGENT_HANDOFFS } from "@/ai-agents/agentHandoffsDescription";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

describe("Agent Handoffs Description", () => {
  describe("Structure", () => {
    it("should export all required handoff descriptions", () => {
      expect(AGENT_HANDOFFS).toHaveProperty("generateUserCbGoogleUrl");
      expect(AGENT_HANDOFFS).toHaveProperty("registerUserViaDb");
      expect(AGENT_HANDOFFS).toHaveProperty("validateUserAuth");
      expect(AGENT_HANDOFFS).toHaveProperty("prepareEventAgent");
      expect(AGENT_HANDOFFS).toHaveProperty("insertEvent");
      expect(AGENT_HANDOFFS).toHaveProperty("getEventByIdOrName");
      expect(AGENT_HANDOFFS).toHaveProperty("updateEventByIdOrName");
      expect(AGENT_HANDOFFS).toHaveProperty("deleteEventByIdOrName");
      expect(AGENT_HANDOFFS).toHaveProperty("analysesCalendarTypeByEventInformation");
    });
  });

  describe("Recommended Prompt Prefix", () => {
    it("all handoff descriptions should start with RECOMMENDED_PROMPT_PREFIX", () => {
      Object.values(AGENT_HANDOFFS).forEach((description) => {
        expect(description).toContain(RECOMMENDED_PROMPT_PREFIX);
        expect(description.startsWith(RECOMMENDED_PROMPT_PREFIX)).toBe(true);
      });
    });
  });

  describe("Handoff Content", () => {
    describe("generateUserCbGoogleUrl", () => {
      it("should contain OAuth-related content", () => {
        expect(AGENT_HANDOFFS.generateUserCbGoogleUrl).toContain("OAuth");
        expect(AGENT_HANDOFFS.generateUserCbGoogleUrl).toContain("URL");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_HANDOFFS.generateUserCbGoogleUrl).toContain("## Persona");
        expect(AGENT_HANDOFFS.generateUserCbGoogleUrl).toContain("## Standards");
      });
    });

    describe("registerUserViaDb", () => {
      it("should contain user registration content", () => {
        expect(AGENT_HANDOFFS.registerUserViaDb).toContain("user");
        expect(AGENT_HANDOFFS.registerUserViaDb).toContain("registration");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_HANDOFFS.registerUserViaDb).toContain("## Persona");
        expect(AGENT_HANDOFFS.registerUserViaDb).toContain("## Standards");
      });
    });

    describe("validateUserAuth", () => {
      it("should contain authentication content", () => {
        expect(AGENT_HANDOFFS.validateUserAuth).toContain("auth");
        expect(AGENT_HANDOFFS.validateUserAuth).toContain("user");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_HANDOFFS.validateUserAuth).toContain("## Persona");
        expect(AGENT_HANDOFFS.validateUserAuth).toContain("## Standards");
      });
    });

    describe("prepareEventAgent", () => {
      it("should contain event preparation content", () => {
        expect(AGENT_HANDOFFS.prepareEventAgent).toContain("event");
        expect(AGENT_HANDOFFS.prepareEventAgent).toContain("prepare");
        expect(AGENT_HANDOFFS.prepareEventAgent).toContain("normalize");
        expect(AGENT_HANDOFFS.prepareEventAgent).toContain("validate");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.prepareEventAgent).toContain("## Persona");
      });
    });

    describe("insertEvent", () => {
      it("should contain event insertion content", () => {
        expect(AGENT_HANDOFFS.insertEvent).toContain("event");
        expect(AGENT_HANDOFFS.insertEvent).toContain("insert");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.insertEvent).toContain("## Persona");
      });
    });

    describe("getEventByIdOrName", () => {
      it("should contain event retrieval content", () => {
        expect(AGENT_HANDOFFS.getEventByIdOrName).toContain("event");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.getEventByIdOrName).toContain("## Persona");
      });
    });

    describe("updateEventByIdOrName", () => {
      it("should contain event update content", () => {
        expect(AGENT_HANDOFFS.updateEventByIdOrName).toContain("event");
        expect(AGENT_HANDOFFS.updateEventByIdOrName).toContain("update");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.updateEventByIdOrName).toContain("## Persona");
      });
    });

    describe("deleteEventByIdOrName", () => {
      it("should contain event deletion content", () => {
        expect(AGENT_HANDOFFS.deleteEventByIdOrName).toContain("event");
        expect(AGENT_HANDOFFS.deleteEventByIdOrName).toContain("delet");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.deleteEventByIdOrName).toContain("## Persona");
      });
    });

    describe("analysesCalendarTypeByEventInformation", () => {
      it("should contain calendar type analysis content", () => {
        expect(AGENT_HANDOFFS.analysesCalendarTypeByEventInformation).toContain("calendar");
      });

      it("should contain persona section", () => {
        expect(AGENT_HANDOFFS.analysesCalendarTypeByEventInformation).toContain("## Persona");
      });
    });
  });

  describe("All Handoff Descriptions Quality", () => {
    it("all handoff descriptions should be strings", () => {
      Object.values(AGENT_HANDOFFS).forEach((description) => {
        expect(typeof description).toBe("string");
      });
    });

    it("all handoff descriptions should be non-empty", () => {
      Object.values(AGENT_HANDOFFS).forEach((description) => {
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it("all handoff descriptions should be substantial (at least 100 chars)", () => {
      Object.values(AGENT_HANDOFFS).forEach((description) => {
        expect(description.length).toBeGreaterThan(100);
      });
    });

    it("all handoff descriptions should contain markdown headers", () => {
      Object.values(AGENT_HANDOFFS).forEach((description) => {
        expect(description).toMatch(/##/);
      });
    });
  });
});
