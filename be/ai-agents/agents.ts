import { Agent } from "@openai/agents";
import { CURRENT_MODEL } from "@/config";
import { HANDOFF_DESCRIPTIONS } from "./agent-handoff-descriptions";
import { AGENT_INSTRUCTIONS } from "./agents-instructions";
import { AGENT_TOOLS } from "./tool-registry";



export const AGENTS = {
  generateGoogleAuthUrl: new Agent({
    name: "generate_google_auth_url_agent",
    instructions: AGENT_INSTRUCTIONS.generateGoogleAuthUrl,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.generateGoogleAuthUrl,
    tools: [AGENT_TOOLS.generate_google_auth_url],
  }),
  registerUser: new Agent({
    name: "register_user_agent",
    instructions: AGENT_INSTRUCTIONS.registerUser,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.registerUser,
    tools: [AGENT_TOOLS.register_user_via_db],
  }),
  validateUser: new Agent({
    name: "validate_user_agent",
    instructions: AGENT_INSTRUCTIONS.validateUser,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.validateUser,
    tools: [AGENT_TOOLS.validate_user_db],
  }),
  validateEventData: new Agent({
    name: "validate_event_data_agent",
    instructions: AGENT_INSTRUCTIONS.validateEventData,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.validateEventData,
    tools: [AGENT_TOOLS.validate_event_fields],
  }),
  createEvent: new Agent({
    name: "create_event_agent",
    instructions: AGENT_INSTRUCTIONS.createEvent,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.createEvent,
    tools: [AGENT_TOOLS.insert_event],
  }),
  retrieveEvent: new Agent({
    instructions: AGENT_INSTRUCTIONS.retrieveEvent,
    name: "retrieve_event_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.retrieveEvent,
    tools: [AGENT_TOOLS.get_event],
  }),
  updateEvent: new Agent({
    instructions: AGENT_INSTRUCTIONS.updateEvent,
    name: "update_event_agent",
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.updateEvent,
    tools: [AGENT_TOOLS.update_event],
  }),
  deleteEvent: new Agent({
    name: "delete_event_agent",
    instructions: AGENT_INSTRUCTIONS.deleteEvent,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.deleteEvent,
    tools: [AGENT_TOOLS.delete_event],
  }),
  selectCalendar: new Agent({
    name: "select_calendar_agent",
    instructions: AGENT_INSTRUCTIONS.selectCalendar,
    model: CURRENT_MODEL,
    modelSettings: { toolChoice: "required" },
    handoffDescription: HANDOFF_DESCRIPTIONS.selectCalendar,
    tools: [AGENT_TOOLS.select_calendar],
  }),
  parseEventText: new Agent({
    name: "parse_event_text_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.parseEventText,
  }),
  getUserDefaultTimeZone: new Agent({
    name: "get_user_default_timezone_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.getUserDefaultTimeZone,
    tools: [AGENT_TOOLS.get_user_default_timezone],
  }),
};

export const HANDOFF_AGENTS = {
  createEventHandoff: new Agent({
    name: "create_event_handoff_agent",
    model: CURRENT_MODEL,
    modelSettings: { parallelToolCalls: true },
    instructions: AGENT_INSTRUCTIONS.createEventHandoff,
    tools: [
      AGENTS.parseEventText.asTool({ toolName: "parse_event_text" }),
      AGENTS.getUserDefaultTimeZone.asTool({ toolName: "get_user_default_timezone" }),
      AGENTS.validateEventData.asTool({ toolName: "validate_event_data" }),
      AGENTS.selectCalendar.asTool({ toolName: "select_calendar" }),
      AGENTS.createEvent.asTool({ toolName: "create_event" }),
    ],
  }),
  updateEventHandoff: new Agent({
    name: "update_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.updateEventHandoff,
    modelSettings: { toolChoice: "required" },
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" }), AGENTS.updateEvent.asTool({ toolName: "update_event" })],
  }),
  deleteEventHandoff: new Agent({
    name: "delete_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.deleteEventHandoff,
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" }), AGENTS.deleteEvent.asTool({ toolName: "delete_event" })],
  }),
  retrieveEventHandoff: new Agent({
    name: "retrieve_event_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.retrieveEventHandoff,
    tools: [AGENTS.retrieveEvent.asTool({ toolName: "retrieve_event" })],
  }),
  registerUserHandoff: new Agent({
    name: "register_user_handoff_agent",
    model: CURRENT_MODEL,
    instructions: AGENT_INSTRUCTIONS.registerUserHandoff,
    tools: [AGENTS.validateUser.asTool({ toolName: "validate_user" })],
  }),
};

export const ORCHESTRATOR_AGENT = new Agent({
  name: "calendar_orchestrator_agent",
  model: CURRENT_MODEL,
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
