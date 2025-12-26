// Environment configuration
export { env, REDIRECT_URI } from "./env";

// Client instances
export { SUPABASE, OAUTH2CLIENT, CALENDAR, initializeOpenAI } from "./clients";

// Constants
export {
  GOOGLE_CALENDAR_SCOPES,
  SCOPES,
  SCOPES_STRING,
  REQUEST_CONFIG_BASE,
  STATUS_RESPONSE,
  ROUTES,
  PROVIDERS,
  ACTION,
  MODELS,
  CURRENT_MODEL,
  TIMEZONE,
} from "./constants";

// Legacy CONFIG object for backwards compatibility during migration
// TODO: Remove after all imports are updated to use `env`
export { env as CONFIG } from "./env";
