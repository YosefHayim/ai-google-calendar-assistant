import { Agent } from "@openai/agents"
import { CURRENT_MODEL, MODELS } from "@/config"
import { HANDOFF_DESCRIPTIONS } from "./agent-handoff-descriptions"
import { AGENT_INSTRUCTIONS } from "./agents-instructions"
import { calendarSafetyGuardrail } from "./guardrails"
import { AGENT_TOOLS, DIRECT_TOOLS } from "./tool-registry"

// Model tiers for different agent complexity levels
const FAST_MODEL = MODELS.GPT_4_1_NANO // Simple tool-calling agents (fast, cheap)
const MEDIUM_MODEL = MODELS.GPT_4_1_MINI // Multi-tool orchestration
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
  // EVENT OPERATION AGENTS
  // ═══════════════════════════════════════════════════════════════════════════
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
}

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
    tools: [
      AGENT_TOOLS.get_event,
      AGENTS.updateEvent.asTool({ toolName: "update_event" }),
      DIRECT_TOOLS.check_conflicts_all_calendars,
    ],
  }),
  deleteEventHandoff: new Agent({
    name: "delete_event_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: AGENT_INSTRUCTIONS.deleteEventHandoff,
    tools: [
      AGENT_TOOLS.get_event,
      AGENTS.deleteEvent.asTool({ toolName: "delete_event" }),
    ],
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
}

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL, // Needs smarter model for intent understanding
  modelSettings: { parallelToolCalls: true },
  instructions: AGENT_INSTRUCTIONS.orchestrator,
  tools: [
    HANDOFF_AGENTS.createEventHandoff.asTool({
      toolName: "create_event_handoff",
    }),
    DIRECT_TOOLS.get_event_direct, // Direct event retrieval - preserves auth context
    DIRECT_TOOLS.summarize_events, // Cheap summarization of raw event JSON
    HANDOFF_AGENTS.updateEventHandoff.asTool({
      toolName: "update_event_handoff",
    }),
    HANDOFF_AGENTS.deleteEventHandoff.asTool({
      toolName: "delete_event_handoff",
    }),
    HANDOFF_AGENTS.registerUserHandoff.asTool({
      toolName: "register_user_handoff",
    }),
    AGENTS.generateGoogleAuthUrl.asTool({
      toolName: "generate_google_auth_url",
    }),
    DIRECT_TOOLS.update_user_brain, // Adaptive memory - save permanent preferences
  ],
  inputGuardrails: [calendarSafetyGuardrail],
})
