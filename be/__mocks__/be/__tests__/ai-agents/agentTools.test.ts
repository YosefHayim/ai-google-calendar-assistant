import { AGENT_TOOLS } from "@/ai-agents/agentTools";

describe("Agent Tools", () => {
  describe("Tool Structure", () => {
    it("should export all required tools", () => {
      expect(AGENT_TOOLS).toHaveProperty("generate_user_cb_google_url");
      expect(AGENT_TOOLS).toHaveProperty("register_user_via_db");
      expect(AGENT_TOOLS).toHaveProperty("validate_user_db");
      expect(AGENT_TOOLS).toHaveProperty("validate_event_fields");
      expect(AGENT_TOOLS).toHaveProperty("insert_event");
      expect(AGENT_TOOLS).toHaveProperty("get_event");
      expect(AGENT_TOOLS).toHaveProperty("update_event");
      expect(AGENT_TOOLS).toHaveProperty("delete_event");
      expect(AGENT_TOOLS).toHaveProperty("calendar_type");
      expect(AGENT_TOOLS).toHaveProperty("get_user_default_timezone");
      expect(AGENT_TOOLS).toHaveProperty("get_agent_name");
      expect(AGENT_TOOLS).toHaveProperty("set_agent_name");
      expect(AGENT_TOOLS).toHaveProperty("get_user_routines");
      expect(AGENT_TOOLS).toHaveProperty("get_upcoming_predictions");
      expect(AGENT_TOOLS).toHaveProperty("suggest_optimal_time");
      expect(AGENT_TOOLS).toHaveProperty("get_routine_insights");
      expect(AGENT_TOOLS).toHaveProperty("set_user_goal");
      expect(AGENT_TOOLS).toHaveProperty("get_goal_progress");
      expect(AGENT_TOOLS).toHaveProperty("get_schedule_statistics");
    });
  });

  describe("Tool Configurations", () => {
    const toolNames = [
      { key: "generate_user_cb_google_url", name: "generate_user_cb_google_url" },
      { key: "register_user_via_db", name: "register_user_via_db" },
      { key: "validate_user_db", name: "validate_user" },
      { key: "validate_event_fields", name: "validate_event_fields" },
      { key: "insert_event", name: "insert_event" },
      { key: "get_event", name: "get_event" },
      { key: "update_event", name: "update_event" },
      { key: "delete_event", name: "delete_event" },
      { key: "calendar_type", name: "calendar_type_by_event_details" },
      { key: "get_user_default_timezone", name: "get_user_default_timezone" },
      { key: "get_agent_name", name: "get_agent_name" },
      { key: "set_agent_name", name: "set_agent_name" },
      { key: "get_user_routines", name: "get_user_routines" },
      { key: "get_upcoming_predictions", name: "get_upcoming_predictions" },
      { key: "suggest_optimal_time", name: "suggest_optimal_time" },
      { key: "get_routine_insights", name: "get_routine_insights" },
      { key: "set_user_goal", name: "set_user_goal" },
      { key: "get_goal_progress", name: "get_goal_progress" },
      { key: "get_schedule_statistics", name: "get_schedule_statistics" },
    ];

    toolNames.forEach(({ key, name }) => {
      describe(key, () => {
        it("should have correct name", () => {
          expect((AGENT_TOOLS as any)[key].name).toBe(name);
        });

        it("should have description", () => {
          expect((AGENT_TOOLS as any)[key].description).toBeDefined();
          expect(typeof (AGENT_TOOLS as any)[key].description).toBe("string");
        });

        it("should have parameters", () => {
          expect((AGENT_TOOLS as any)[key].parameters).toBeDefined();
        });
      });
    });
  });

  describe("Tool Names", () => {
    it("should have unique tool names", () => {
      const tools = Object.values(AGENT_TOOLS);
      const names = tools.map((tool) => tool.name);
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });
  });

  describe("All Tools Structure", () => {
    it("should have description for all tools", () => {
      Object.values(AGENT_TOOLS).forEach((tool) => {
        expect(tool.description).toBeDefined();
        expect(typeof tool.description).toBe("string");
        expect(tool.description.length).toBeGreaterThan(0);
      });
    });

    it("should have parameters for all tools", () => {
      Object.values(AGENT_TOOLS).forEach((tool) => {
        expect(tool.parameters).toBeDefined();
      });
    });

    it("should have name for all tools", () => {
      Object.values(AGENT_TOOLS).forEach((tool) => {
        expect(tool.name).toBeDefined();
        expect(typeof tool.name).toBe("string");
        expect(tool.name.length).toBeGreaterThan(0);
      });
    });
  });
});
