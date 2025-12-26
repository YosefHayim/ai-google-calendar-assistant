import { tool } from "@openai/agents";
import { TOOLS_DESCRIPTION } from "./tool-descriptions";
import { EXECUTION_TOOLS } from "./tool-execution";
import { PARAMETERS_TOOLS } from "./tool-schemas";

export const AGENT_TOOLS = {
  generate_google_auth_url: tool({
    name: "generate_google_auth_url",
    description: TOOLS_DESCRIPTION.generateGoogleAuthUrlDescription,
    parameters: PARAMETERS_TOOLS.generateGoogleAuthUrlParameters,
    execute: EXECUTION_TOOLS.generateGoogleAuthUrl,
    errorFunction: (_, error) => {
      return `generate_google_auth_url: ${error}`;
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
  select_calendar: tool({
    name: "select_calendar_by_event_details",
    description: TOOLS_DESCRIPTION.selectCalendarByEventDetails,
    parameters: PARAMETERS_TOOLS.selectCalendarParameters,
    execute: EXECUTION_TOOLS.selectCalendarByEventDetails,
    errorFunction: (_, error) => {
      return `select_calendar: ${error}`;
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
};
