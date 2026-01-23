import { Agent } from "@openai/agents"
import { CURRENT_MODEL, MODELS } from "@/config/constants/ai"
import { HANDOFF_DESCRIPTIONS } from "./agent-handoff-descriptions"
import { AGENT_INSTRUCTIONS } from "./agents-instructions"
import { calendarSafetyGuardrail } from "./guardrails"
import { getAgentPromptSync } from "./registry/agent-registry-service"
import { AGENT_TOOLS, DIRECT_TOOLS } from "./tool-registry"

const FAST_MODEL = MODELS.GPT_4_1_NANO
const MEDIUM_MODEL = MODELS.GPT_4_1_MINI

function getPrompt(
  agentId: string,
  fallbackKey: keyof typeof AGENT_INSTRUCTIONS
): string {
  return getAgentPromptSync(agentId) || AGENT_INSTRUCTIONS[fallbackKey]
}

export const AGENTS = {
  generateGoogleAuthUrl: new Agent({
    name: "generate_google_auth_url_agent",
    instructions: getPrompt(
      "generate_google_auth_url_agent",
      "generateGoogleAuthUrl"
    ),
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.generateGoogleAuthUrl,
    tools: [AGENT_TOOLS.generate_google_auth_url],
  }),
  registerUser: new Agent({
    name: "register_user_agent",
    instructions: getPrompt("register_user_agent", "registerUser"),
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.registerUser,
    tools: [AGENT_TOOLS.register_user_via_db],
  }),
  updateEvent: new Agent({
    instructions: getPrompt("update_event_agent", "updateEvent"),
    name: "update_event_agent",
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.updateEvent,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEvent: new Agent({
    name: "delete_event_agent",
    instructions: getPrompt("delete_event_agent", "deleteEvent"),
    model: FAST_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.deleteEvent,
    tools: [AGENT_TOOLS.delete_event],
  }),
  parseEventText: new Agent({
    name: "parse_event_text_agent",
    model: CURRENT_MODEL,
    instructions: getPrompt("parse_event_text_agent", "parseEventText"),
  }),
}

export const HANDOFF_AGENTS = {
  createEventHandoff: new Agent({
    name: "create_event_handoff_agent",
    model: MEDIUM_MODEL,
    modelSettings: { parallelToolCalls: true },
    instructions: getPrompt("create_event_handoff_agent", "createEventHandoff"),
    tools: [
      AGENTS.parseEventText.asTool({ toolName: "parse_event_text" }),
      DIRECT_TOOLS.pre_create_validation,
      DIRECT_TOOLS.insert_event_direct,
    ],
  }),
  updateEventHandoff: new Agent({
    name: "update_event_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: getPrompt("update_event_handoff_agent", "updateEventHandoff"),
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
    instructions: getPrompt("delete_event_handoff_agent", "deleteEventHandoff"),
    tools: [
      AGENT_TOOLS.get_event,
      AGENTS.deleteEvent.asTool({ toolName: "delete_event" }),
    ],
  }),
  registerUserHandoff: new Agent({
    name: "register_user_handoff_agent",
    model: MEDIUM_MODEL,
    instructions: getPrompt(
      "register_user_handoff_agent",
      "registerUserHandoff"
    ),
    tools: [
      DIRECT_TOOLS.validate_user_direct,
      AGENTS.registerUser.asTool({ toolName: "register_user" }),
    ],
  }),
}

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL,
  modelSettings: { parallelToolCalls: true },
  instructions: getPrompt("calendar_orchestrator_agent", "orchestrator"),
  tools: [
    HANDOFF_AGENTS.createEventHandoff.asTool({
      toolName: "create_event_handoff",
    }),
    DIRECT_TOOLS.get_event_direct,
    DIRECT_TOOLS.summarize_events,
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
    DIRECT_TOOLS.update_user_brain,
  ],
  inputGuardrails: [calendarSafetyGuardrail],
})
