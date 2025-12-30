import { AGENT_TOOLS, DIRECT_TOOLS } from "./tool-registry";
import { CURRENT_MODEL, MODELS } from "@/config";

import { AGENT_INSTRUCTIONS } from "./agents-instructions";
import { Agent } from "@openai/agents";
import { HANDOFF_DESCRIPTIONS } from "./agent-handoff-descriptions";

// Model tiers for different agent complexity levels
const FAST_MODEL = MODELS.GPT_4_1_NANO; // Simple tool-calling agents (fast, cheap)
const MEDIUM_MODEL = MODELS.GPT_4_1_MINI; // Multi-tool orchestration
// CURRENT_MODEL (GPT_5_MINI) used for complex reasoning/NLP

export const AGENTS = {
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE AGENTS - Still used in handoff flows
  // ═══════════════════════════════════════════════════════════════════════════
  generateGoogleAuthUrl: new Agent({
    name: "generate_google_auth_url_agent",
    instructions: AGENT_INSTRUCTIONS.generateGoogleAuthUrl,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.generateGoogleAuthUrl,
    tools: [AGENT_TOOLS.generate_google_auth_url],
  }),
  registerUser: new Agent({
    name: "register_user_agent",
    instructions: AGENT_INSTRUCTIONS.registerUser,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.registerUser,
    tools: [AGENT_TOOLS.register_user_via_db],
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPRECATED AGENTS - Bypassed by DIRECT_TOOLS for performance
  // These are kept for backwards compatibility but no longer used in handoffs.
  // Use DIRECT_TOOLS.validate_user_direct instead.
  // ═══════════════════════════════════════════════════════════════════════════
  /** @deprecated Use DIRECT_TOOLS.validate_user_direct instead */
  validateUser: new Agent({
    name: "validate_user_agent",
    instructions: AGENT_INSTRUCTIONS.validateUser,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.validateUser,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  /** @deprecated Use DIRECT_TOOLS.pre_create_validation instead */
  validateEventData: new Agent({
    name: "validate_event_data_agent",
    instructions: AGENT_INSTRUCTIONS.validateEventData,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.validateEventData,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  // ═══════════════════════════════════════════════════════════════════════════
  // ACTIVE AGENTS - Core event operations (still require LLM for validation)
  // ═══════════════════════════════════════════════════════════════════════════
  /** @deprecated Use DIRECT_TOOLS.insert_event_direct instead - avoids AI defaulting to placeholder emails */
  createEvent: new Agent({
    name: "create_event_agent",
    instructions: AGENT_INSTRUCTIONS.createEvent,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.createEvent,
    tools: [AGENT_TOOLS.insert_event],
  }),
  retrieveEvent: new Agent({
    instructions: AGENT_INSTRUCTIONS.retrieveEvent,
    name: "retrieve_event_agent",
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.retrieveEvent,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEvent: new Agent({
    instructions: AGENT_INSTRUCTIONS.updateEvent,
    name: "update_event_agent",
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.updateEvent,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEvent: new Agent({
    name: "delete_event_agent",
    instructions: AGENT_INSTRUCTIONS.deleteEvent,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.deleteEvent,
    tools: [AGENT_TOOLS.delete_event],
  }),
  /** Active: Required for natural language parsing */
  parseEventText: new Agent({
    name: "parse_event_text_agent",
    model: CURRENT_MODEL, // Needs smarter model for NLP
    instructions: AGENT_INSTRUCTIONS.parseEventText,
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DEPRECATED AGENTS - Bypassed by DIRECT_TOOLS for performance
  // ═══════════════════════════════════════════════════════════════════════════
  /** @deprecated Use DIRECT_TOOLS.select_calendar_direct instead */
  selectCalendar: new Agent({
    name: "select_calendar_agent",
    instructions: AGENT_INSTRUCTIONS.selectCalendar,
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.selectCalendar,
    tools: [AGENT_TOOLS.select_calendar],
  }),
  /** @deprecated Use DIRECT_TOOLS.check_conflicts_direct instead */
  checkConflicts: new Agent({
    name: "check_conflicts_agent",
    model: FAST_MODEL,
    instructions: AGENT_INSTRUCTIONS.checkConflicts,
    tools: [AGENT_TOOLS.check_conflicts],
  }),
};

export const HANDOFF_AGENTS = {
  createEventHandoff: new Agent({
    name: "create_event_handoff_agent",
    model: MEDIUM_MODEL, // Multi-tool orchestration
    modelSettings: { parallelToolCalls: true },
    instructions: AGENT_INSTRUCTIONS.createEventHandoff,
    tools: [
      // LLM-required: natural language parsing
      AGENTS.parseEventText.asTool({ toolName: "parse_event_text" }),
      // DIRECT TOOLS: bypass AI agents for faster execution
      DIRECT_TOOLS.pre_create_validation, // Combines: validate_user + get_timezone + select_calendar + check_conflicts
      DIRECT_TOOLS.insert_event_direct, // Direct event insertion - no AI overhead
    ],
  }),
  updateEventHandoff: new Agent({
    name: "update_event_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: AGENT_INSTRUCTIONS.updateEventHandoff,
    modelSettings: { toolChoice: "required" },
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" }), AGENTS.updateEvent.asTool({ toolName: "update_event" })],
  }),
  deleteEventHandoff: new Agent({
    name: "delete_event_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: AGENT_INSTRUCTIONS.deleteEventHandoff,
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" }), AGENTS.deleteEvent.asTool({ toolName: "delete_event" })],
  }),
  retrieveEventHandoff: new Agent({
    name: "retrieve_event_handoff_agent",
    model: FAST_MODEL, // Simple pass-through
    instructions: AGENT_INSTRUCTIONS.retrieveEventHandoff,
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" })],
  }),
  registerUserHandoff: new Agent({
    name: "register_user_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: AGENT_INSTRUCTIONS.registerUserHandoff,
    tools: [
      DIRECT_TOOLS.validate_user_direct, // Direct DB call, no AI overhead
      AGENTS.registerUser.asTool({ toolName: "register_user" }), // Needed for actual registration
    ],
  }),
};

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL, // Needs smarter model for intent understanding
  modelSettings: { parallelToolCalls: true },
  instructions: AGENT_INSTRUCTIONS.orchestrator,
  tools: [
    HANDOFF_AGENTS.createEventHandoff.asTool({ toolName: "create_event_handoff" }),
    HANDOFF_AGENTS.retrieveEventHandoff.asTool({ toolName: "retrieve_event_handoff" }),
    HANDOFF_AGENTS.updateEventHandoff.asTool({ toolName: "update_event_handoff" }),
    HANDOFF_AGENTS.deleteEventHandoff.asTool({ toolName: "delete_event_handoff" }),
    HANDOFF_AGENTS.registerUserHandoff.asTool({ toolName: "register_user_handoff" }),
    AGENTS.generateGoogleAuthUrl.asTool({ toolName: "generate_google_auth_url" }),
  ],
});
