import { AGENT_INSTRUCTIONS } from "@/ai-agents/agentInstructions";
import { RECOMMENDED_PROMPT_PREFIX } from "@openai/agents-core/extensions";

describe("Agent Instructions", () => {
  describe("Structure", () => {
    it("should export all required agent instructions", () => {
      expect(AGENT_INSTRUCTIONS).toHaveProperty("generateUserCbGoogleUrl");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("registerUserViaDb");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("validateUserAuth");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("insertEvent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("getEventByIdOrName");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("updateEventByIdOrName");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("deleteEventByIdOrName");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("analysesCalendarTypeByEventInformation");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("prepareEventAgent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("insertEventHandOffAgent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("updateEventByIdOrNameHandOffAgent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("deleteEventByIdOrNameHandOffAgent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("orchestratorAgent");
      expect(AGENT_INSTRUCTIONS).toHaveProperty("quickResponseAgent");
    });
  });

  describe("Recommended Prompt Prefix", () => {
    it("all instructions should start with RECOMMENDED_PROMPT_PREFIX", () => {
      Object.values(AGENT_INSTRUCTIONS).forEach((instruction) => {
        expect(instruction).toContain(RECOMMENDED_PROMPT_PREFIX);
        expect(instruction.startsWith(RECOMMENDED_PROMPT_PREFIX)).toBe(true);
      });
    });
  });

  describe("Instruction Content", () => {
    describe("generateUserCbGoogleUrl", () => {
      it("should contain OAuth-related content", () => {
        expect(AGENT_INSTRUCTIONS.generateUserCbGoogleUrl).toContain("OAuth");
        expect(AGENT_INSTRUCTIONS.generateUserCbGoogleUrl).toContain("URL");
        expect(AGENT_INSTRUCTIONS.generateUserCbGoogleUrl).toContain("Google");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.generateUserCbGoogleUrl).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.generateUserCbGoogleUrl).toContain("## Standards");
      });
    });

    describe("registerUserViaDb", () => {
      it("should contain user registration content", () => {
        expect(AGENT_INSTRUCTIONS.registerUserViaDb).toContain("user");
        expect(AGENT_INSTRUCTIONS.registerUserViaDb).toContain("email");
        expect(AGENT_INSTRUCTIONS.registerUserViaDb).toContain("registration");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.registerUserViaDb).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.registerUserViaDb).toContain("## Standards");
      });
    });

    describe("validateUserAuth", () => {
      it("should contain authentication content", () => {
        expect(AGENT_INSTRUCTIONS.validateUserAuth).toContain("auth");
        expect(AGENT_INSTRUCTIONS.validateUserAuth).toContain("user");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.validateUserAuth).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.validateUserAuth).toContain("## Standards");
      });
    });

    describe("prepareEventAgent", () => {
      it("should contain event preparation content", () => {
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("event");
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("prepare");
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("normalize");
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("validate");
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("timezone");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.prepareEventAgent).toContain("## Standards");
      });
    });

    describe("insertEvent", () => {
      it("should contain event insertion content", () => {
        expect(AGENT_INSTRUCTIONS.insertEvent).toContain("event");
        expect(AGENT_INSTRUCTIONS.insertEvent).toContain("insert");
        expect(AGENT_INSTRUCTIONS.insertEvent).toContain("Calendar");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.insertEvent).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.insertEvent).toContain("## Standards");
      });
    });

    describe("orchestratorAgent", () => {
      it("should contain orchestration content", () => {
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("assistant");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("calendar");
      });

      it("should contain persona and standards sections", () => {
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("## Persona");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("## Standards");
      });

      it("should mention handoff agents and direct tools", () => {
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("insert_event_handoff_agent");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_event");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("update_event_handoff_agent");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("delete_event_handoff_agent");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("validate_user_auth");
      });

      it("should mention routine and statistics tools", () => {
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_user_routines");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_upcoming_predictions");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("suggest_optimal_time");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_routine_insights");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("set_user_goal");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_goal_progress");
      });

      it("should mention agent name functionality", () => {
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("get_agent_name");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("set_agent_name");
        expect(AGENT_INSTRUCTIONS.orchestratorAgent).toContain("agent name");
      });
    });

    describe("quickResponseAgent", () => {
      it("should contain quick response content", () => {
        expect(AGENT_INSTRUCTIONS.quickResponseAgent).toContain("quick");
        expect(AGENT_INSTRUCTIONS.quickResponseAgent).toContain("acknowledge");
      });

      it("should contain persona section", () => {
        expect(AGENT_INSTRUCTIONS.quickResponseAgent).toContain("## Persona");
      });

      it("should mention no tools needed", () => {
        expect(AGENT_INSTRUCTIONS.quickResponseAgent).toContain("brief");
      });
    });
  });

  describe("Handoff Agent Instructions", () => {
    it("insertEventHandOffAgent should mention orchestration", () => {
      expect(AGENT_INSTRUCTIONS.insertEventHandOffAgent).toContain("orchestrat");
      expect(AGENT_INSTRUCTIONS.insertEventHandOffAgent).toContain("event");
      expect(AGENT_INSTRUCTIONS.insertEventHandOffAgent).toContain("insert");
    });

    it("updateEventByIdOrNameHandOffAgent should mention updates", () => {
      expect(AGENT_INSTRUCTIONS.updateEventByIdOrNameHandOffAgent).toContain("update");
      expect(AGENT_INSTRUCTIONS.updateEventByIdOrNameHandOffAgent).toContain("event");
    });

    it("deleteEventByIdOrNameHandOffAgent should mention deletion", () => {
      expect(AGENT_INSTRUCTIONS.deleteEventByIdOrNameHandOffAgent).toContain("delet");
      expect(AGENT_INSTRUCTIONS.deleteEventByIdOrNameHandOffAgent).toContain("event");
    });
  });

  describe("All Instructions Quality", () => {
    it("all instructions should be strings", () => {
      Object.values(AGENT_INSTRUCTIONS).forEach((instruction) => {
        expect(typeof instruction).toBe("string");
      });
    });

    it("all instructions should be non-empty", () => {
      Object.values(AGENT_INSTRUCTIONS).forEach((instruction) => {
        expect(instruction.length).toBeGreaterThan(0);
      });
    });

    it("all instructions should be substantial (at least 100 chars)", () => {
      Object.values(AGENT_INSTRUCTIONS).forEach((instruction) => {
        expect(instruction.length).toBeGreaterThan(100);
      });
    });

    it("all instructions should contain markdown headers", () => {
      Object.values(AGENT_INSTRUCTIONS).forEach((instruction) => {
        expect(instruction).toMatch(/##/);
      });
    });
  });
});
