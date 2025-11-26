import { AGENTS, HANDS_OFF_AGENTS, QUICK_RESPONSE_AGENT, ORCHESTRATOR_AGENT } from "@/ai-agents/agents";
import { Agent } from "@openai/agents";

describe("AI Agents Configuration", () => {
  describe("AGENTS", () => {
    describe("generateUserCbGoogleUrl", () => {
      it("should be properly configured", () => {
        expect(AGENTS.generateUserCbGoogleUrl).toBeInstanceOf(Agent);
        expect(AGENTS.generateUserCbGoogleUrl.name).toBe("generate_user_cb_google_url_agent");
        expect(AGENTS.generateUserCbGoogleUrl.instructions).toBeDefined();
        expect(AGENTS.generateUserCbGoogleUrl.model).toBeDefined();
        expect(AGENTS.generateUserCbGoogleUrl.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.generateUserCbGoogleUrl.tools).toHaveLength(1);
      });
    });

    describe("registerUserViaDb", () => {
      it("should be properly configured", () => {
        expect(AGENTS.registerUserViaDb).toBeInstanceOf(Agent);
        expect(AGENTS.registerUserViaDb.name).toBe("register_user_via_db_agent");
        expect(AGENTS.registerUserViaDb.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.registerUserViaDb.tools).toHaveLength(1);
      });
    });

    describe("validateUserAuth", () => {
      it("should be properly configured", () => {
        expect(AGENTS.validateUserAuth).toBeInstanceOf(Agent);
        expect(AGENTS.validateUserAuth.name).toBe("validate_user_db_agent");
        expect(AGENTS.validateUserAuth.model).toBeDefined();
        expect(AGENTS.validateUserAuth.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.validateUserAuth.tools).toHaveLength(1);
      });
    });

    describe("prepareEventAgent", () => {
      it("should be properly configured", () => {
        expect(AGENTS.prepareEventAgent).toBeInstanceOf(Agent);
        expect(AGENTS.prepareEventAgent.name).toBe("prepare_event_agent");
        expect(AGENTS.prepareEventAgent.model).toBeDefined();
        expect(AGENTS.prepareEventAgent.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools (2 tools: timezone and validation)", () => {
        expect(AGENTS.prepareEventAgent.tools).toHaveLength(2);
      });
    });

    describe("insertEvent", () => {
      it("should be properly configured", () => {
        expect(AGENTS.insertEvent).toBeInstanceOf(Agent);
        expect(AGENTS.insertEvent.name).toBe("insert_event_agent");
        expect(AGENTS.insertEvent.model).toBeDefined();
        expect(AGENTS.insertEvent.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.insertEvent.tools).toHaveLength(1);
      });
    });

    describe("getEventByIdOrName", () => {
      it("should be properly configured", () => {
        expect(AGENTS.getEventByIdOrName).toBeInstanceOf(Agent);
        expect(AGENTS.getEventByIdOrName.name).toBe("get_event_by_name_agent");
        expect(AGENTS.getEventByIdOrName.model).toBeDefined();
        expect(AGENTS.getEventByIdOrName.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.getEventByIdOrName.tools).toHaveLength(1);
      });
    });

    describe("updateEventByIdOrName", () => {
      it("should be properly configured", () => {
        expect(AGENTS.updateEventByIdOrName).toBeInstanceOf(Agent);
        expect(AGENTS.updateEventByIdOrName.name).toBe("update_event_by_id_agent");
        expect(AGENTS.updateEventByIdOrName.model).toBeDefined();
        expect(AGENTS.updateEventByIdOrName.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.updateEventByIdOrName.tools).toHaveLength(1);
      });
    });

    describe("deleteEventByIdOrName", () => {
      it("should be properly configured", () => {
        expect(AGENTS.deleteEventByIdOrName).toBeInstanceOf(Agent);
        expect(AGENTS.deleteEventByIdOrName.name).toBe("delete_event_by_id_agent");
        expect(AGENTS.deleteEventByIdOrName.model).toBeDefined();
        expect(AGENTS.deleteEventByIdOrName.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.deleteEventByIdOrName.tools).toHaveLength(1);
      });
    });

    describe("analysesCalendarTypeByEventInformation", () => {
      it("should be properly configured", () => {
        expect(AGENTS.analysesCalendarTypeByEventInformation).toBeInstanceOf(Agent);
        expect(AGENTS.analysesCalendarTypeByEventInformation.name).toBe("analyses_calendar_type_by_event_agent");
        expect(AGENTS.analysesCalendarTypeByEventInformation.model).toBeDefined();
        expect(AGENTS.analysesCalendarTypeByEventInformation.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools", () => {
        expect(AGENTS.analysesCalendarTypeByEventInformation.tools).toHaveLength(1);
      });
    });

  });

  describe("HANDS_OFF_AGENTS", () => {
    describe("insertEventHandOffAgent", () => {
      it("should be properly configured", () => {
        expect(HANDS_OFF_AGENTS.insertEventHandOffAgent).toBeInstanceOf(Agent);
        expect(HANDS_OFF_AGENTS.insertEventHandOffAgent.name).toBe("insert_event_handoff_agent");
        expect(HANDS_OFF_AGENTS.insertEventHandOffAgent.model).toBeDefined();
        expect(HANDS_OFF_AGENTS.insertEventHandOffAgent.modelSettings).toEqual({ parallelToolCalls: true });
      });

      it("should have correct tools (3 tools: prepare_event, calendar_type_by_event_details, insert_event)", () => {
        expect(HANDS_OFF_AGENTS.insertEventHandOffAgent.tools).toHaveLength(3);
      });
    });

    describe("updateEventOrEventsHandOffAgent", () => {
      it("should be properly configured", () => {
        expect(HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent).toBeInstanceOf(Agent);
        expect(HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.name).toBe("update_event_handoff_agent");
        expect(HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.model).toBeDefined();
        expect(HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.modelSettings).toEqual({ toolChoice: "required" });
      });

      it("should have correct tools (2 tools)", () => {
        expect(HANDS_OFF_AGENTS.updateEventOrEventsHandOffAgent.tools).toHaveLength(2);
      });
    });

    describe("deleteEventOrEventsHandOffAgent", () => {
      it("should be properly configured", () => {
        expect(HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent).toBeInstanceOf(Agent);
        expect(HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent.name).toBe("delete_event_handoff_agent");
        expect(HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent.model).toBeDefined();
      });

      it("should have correct tools (2 tools)", () => {
        expect(HANDS_OFF_AGENTS.deleteEventOrEventsHandOffAgent.tools).toHaveLength(2);
      });
    });

  });

  describe("QUICK_RESPONSE_AGENT", () => {
    it("should be properly configured", () => {
      expect(QUICK_RESPONSE_AGENT).toBeInstanceOf(Agent);
      expect(QUICK_RESPONSE_AGENT.name).toBe("quick_response_agent");
      expect(QUICK_RESPONSE_AGENT.model).toBe("gpt-4o-mini");
    });

    it("should have no tools (text-only responses)", () => {
      expect(QUICK_RESPONSE_AGENT.tools).toBeUndefined();
    });
  });

  describe("ORCHESTRATOR_AGENT", () => {
    it("should be properly configured", () => {
      expect(ORCHESTRATOR_AGENT).toBeInstanceOf(Agent);
      expect(ORCHESTRATOR_AGENT.name).toBe("calendar_orchestrator_agent");
      expect(ORCHESTRATOR_AGENT.model).toBeDefined();
      expect(ORCHESTRATOR_AGENT.modelSettings).toEqual({ parallelToolCalls: true });
    });

    it("should have all required tools", () => {
      // 3 handoff agents + 1 get_event (direct) + 1 validate_user_auth (direct) + 1 generateUserCbGoogleUrl + 8 routine/statistics tools
      expect(ORCHESTRATOR_AGENT.tools).toHaveLength(14);
    });

    it("should include all handoff agents and direct tools", () => {
      const toolNames = ORCHESTRATOR_AGENT.tools?.map((t: any) => t.name) || [];
      expect(toolNames).toContain("insert_event_handoff_agent");
      expect(toolNames).toContain("get_event");
      expect(toolNames).toContain("update_event_handoff_agent");
      expect(toolNames).toContain("delete_event_handoff_agent");
      expect(toolNames).toContain("validate_user_auth");
    });

    it("should include routine and statistics tools", () => {
      const toolNames = ORCHESTRATOR_AGENT.tools?.map((t: any) => t.name) || [];
      expect(toolNames).toContain("get_agent_name");
      expect(toolNames).toContain("set_agent_name");
      expect(toolNames).toContain("get_user_routines");
      expect(toolNames).toContain("get_upcoming_predictions");
      expect(toolNames).toContain("suggest_optimal_time");
      expect(toolNames).toContain("get_routine_insights");
      expect(toolNames).toContain("set_user_goal");
      expect(toolNames).toContain("get_goal_progress");
      expect(toolNames).toContain("get_schedule_statistics");
    });
  });

  describe("Agent Names", () => {
    it("should have unique agent names", () => {
      const allAgents = [
        ...Object.values(AGENTS),
        ...Object.values(HANDS_OFF_AGENTS),
        QUICK_RESPONSE_AGENT,
        ORCHESTRATOR_AGENT,
      ];

      const names = allAgents.map((agent) => agent.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });
});
