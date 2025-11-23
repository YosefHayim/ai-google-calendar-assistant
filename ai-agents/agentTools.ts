import { EXECUTION_TOOLS } from "./toolsExecution";
import { PARAMETERS_TOOLS } from "./toolsParameters";
import { TOOLS_DESCRIPTION } from "./toolsDescription";
import { tool } from "@openai/agents";

export const AGENT_TOOLS = {
  generate_user_cb_google_url: tool({
    name: "generate_user_cb_google_url",
    description: TOOLS_DESCRIPTION.generateUserCbGoogleUrlDescription,
    parameters: PARAMETERS_TOOLS.generateUserCbGoogleUrlParameters,
    execute: EXECUTION_TOOLS.generateUserCbGoogleUrl,
    errorFunction: (_, error) => {
      return `generate_user_cb_google_url: ${error}`;
    },
  }),
  register_user_via_db: tool({
    name: "register_user_via_db",
    description: TOOLS_DESCRIPTION.registerUserViaDb,
    parameters: PARAMETERS_TOOLS.registerUserParameters,
    execute: EXECUTION_TOOLS.registerUser,
    errorFunction: (_, error) => {
      return `register_user_via_db: ${error}`;
    },
  }),
  validate_user_db: tool({
    name: "validate_user",
    description: TOOLS_DESCRIPTION.validateUser,
    parameters: PARAMETERS_TOOLS.validateUserDbParameter,
    execute: EXECUTION_TOOLS.validateUser,
    errorFunction: (_, error) => {
      return `validate_user: ${error}`;
    },
  }),
  validate_event_fields: tool({
    name: "validate_event_fields",
    description: TOOLS_DESCRIPTION.validateEventFields,
    parameters: PARAMETERS_TOOLS.normalizedEventParams,
    execute: EXECUTION_TOOLS.validateEventFields,
    errorFunction: (_, error) => {
      return `validate_event_fields: ${error}`;
    },
  }),
  insert_event: tool({
    name: "insert_event",
    description: TOOLS_DESCRIPTION.insertEvent,
    parameters: PARAMETERS_TOOLS.insertEventParameters,
    execute: EXECUTION_TOOLS.insertEvent,
    errorFunction: (_, error) => {
      return `insert_event: ${error}`;
    },
  }),
  get_event: tool({
    name: "get_event",
    description: TOOLS_DESCRIPTION.getEvent,
    parameters: PARAMETERS_TOOLS.getEventParameters,
    execute: EXECUTION_TOOLS.getEvent,
    errorFunction: (_, error) => {
      return `get_event: ${error}`;
    },
  }),
  update_event: tool({
    name: "update_event",
    description: TOOLS_DESCRIPTION.updateEvent,
    parameters: PARAMETERS_TOOLS.updateEventParameters,
    execute: EXECUTION_TOOLS.updateEvent,
    errorFunction: (_, error) => {
      return `update_event: ${error}`;
    },
  }),
  delete_event: tool({
    name: "delete_event",
    description: TOOLS_DESCRIPTION.deleteEvent,
    parameters: PARAMETERS_TOOLS.deleteEventParameter,
    execute: EXECUTION_TOOLS.deleteEvent,
    errorFunction: (_, error) => {
      return `delete_event: ${error}`;
    },
  }),
  calendar_type: tool({
    name: "calendar_type_by_event_details",
    description: TOOLS_DESCRIPTION.getCalendarTypesByEventDetails,
    parameters: PARAMETERS_TOOLS.getCalendarTypesByEventParameters,
    execute: EXECUTION_TOOLS.getCalendarTypesByEventDetails,
    errorFunction: (_, error) => {
      return `calendar_type: ${error}`;
    },
  }),
  get_user_default_timezone: tool({
    name: "get_user_default_timezone",
    description: TOOLS_DESCRIPTION.getUserDefaultTimeZone,
    parameters: PARAMETERS_TOOLS.getUserDefaultTimeZone,
    execute: EXECUTION_TOOLS.getUserDefaultTimeZone,
    errorFunction: (_, error) => {
      return `get_user_default_timezone: ${error}`;
    },
  }),
  get_agent_name: tool({
    name: "get_agent_name",
    description: TOOLS_DESCRIPTION.getAgentName,
    parameters: PARAMETERS_TOOLS.getAgentName,
    execute: EXECUTION_TOOLS.getAgentName,
    errorFunction: (_, error) => {
      return `get_agent_name: ${error}`;
    },
  }),
  set_agent_name: tool({
    name: "set_agent_name",
    description: TOOLS_DESCRIPTION.setAgentName,
    parameters: PARAMETERS_TOOLS.setAgentName,
    execute: EXECUTION_TOOLS.setAgentName,
    errorFunction: (_, error) => {
      return `set_agent_name: ${error}`;
    },
  }),
};
