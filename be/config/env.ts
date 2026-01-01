import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ============================================================================
// Validation
// ============================================================================

const REQUIRED_ENV_VARS = [
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPEN_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
] as const;

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}

// ============================================================================
// Helper to get optional env vars with type safety
// ============================================================================

const getOptional = (key: string): string | undefined => process.env[key] || undefined;
const getRequired = (key: string): string => process.env[key]!;

// ============================================================================
// Environment Detection
// ============================================================================

const nodeEnv = process.env.NODE_ENV ?? "development";

export const isDev = nodeEnv === "development";
export const isProd = nodeEnv === "production";
export const isTest = nodeEnv === "test";

// ============================================================================
// Server Configuration
// ============================================================================

const DEFAULT_PORT = 3000;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const server = {
  nodeEnv,
  port,
  host: process.env.HOST ?? "localhost",
  get baseUrl(): string {
    return process.env.BASE_URL ?? `http://${this.host}:${this.port}`;
  },
} as const;

// ============================================================================
// URLs Configuration
// ============================================================================

const urls = {
  get api(): string {
    return server.baseUrl;
  },
  get authCallback(): string {
    return `${server.baseUrl}/auth/v1/callback`;
  },
  frontend: process.env.FRONTEND_URL ?? "http://localhost:5173",
} as const;

// ============================================================================
// Supabase Configuration
// ============================================================================

const supabase = {
  url: getRequired("SUPABASE_URL"),
  serviceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY"),
} as const;

// ============================================================================
// Google Configuration
// ============================================================================

const google = {
  clientId: getRequired("GOOGLE_CLIENT_ID"),
  clientSecret: getRequired("GOOGLE_CLIENT_SECRET"),
  apiKey: getOptional("GOOGLE_API_KEY"),
} as const;

// ============================================================================
// OpenAI Configuration
// ============================================================================

const openai = {
  apiKey: getRequired("OPEN_API_KEY"),
} as const;

// ============================================================================
// Integrations Configuration
// ============================================================================

const integrations = {
  telegram: {
    accessToken: getOptional("TELEGRAM_BOT_ACCESS_TOKEN"),
    get isEnabled(): boolean {
      return !!this.accessToken;
    },
  },
  whatsapp: {
    accessToken: getOptional("DEV_WHATS_APP_ACCESS_TOKEN"),
    get isEnabled(): boolean {
      return !!this.accessToken;
    },
  },
} as const;

// ============================================================================
// Jira/Confluence Configuration (optional)
// ============================================================================

const atlassian = {
  jira: {
    url: getOptional("JIRA_URL"),
    username: getOptional("JIRA_USERNAME"),
    apiToken: getOptional("JIRA_API_TOKEN"),
    projectsFilter: getOptional("JIRA_PROJECTS_FILTER")?.split(",").map((s) => s.trim()),
    get isEnabled(): boolean {
      return !!(this.url && this.username && this.apiToken);
    },
  },
  confluence: {
    url: getOptional("CONFLUENCE_URL"),
    username: getOptional("CONFLUENCE_USERNAME"),
    apiToken: getOptional("CONFLUENCE_API_TOKEN"),
    get isEnabled(): boolean {
      return !!(this.url && this.username && this.apiToken);
    },
  },
} as const;

// ============================================================================
// Testing Configuration
// ============================================================================

const testing = {
  testEmail: getOptional("TEST_EMAIL"),
} as const;

// ============================================================================
// Exported Configuration Object
// ============================================================================

export const env = {
  // Environment detection
  nodeEnv: server.nodeEnv,
  isDev,
  isProd,
  isTest,

  // Server
  port: server.port,
  host: server.host,
  baseUrl: server.baseUrl,

  // URLs (for easy access)
  urls,

  // Services (grouped)
  server,
  supabase,
  google,
  openai,
  integrations,
  atlassian,
  testing,

  // Legacy flat accessors (for backwards compatibility)
  // TODO: Migrate usages to grouped accessors (e.g., env.supabase.url)
  supabaseUrl: supabase.url,
  supabaseServiceRoleKey: supabase.serviceRoleKey,
  googleClientId: google.clientId,
  googleClientSecret: google.clientSecret,
  googleApiKey: google.apiKey,
  openAiApiKey: openai.apiKey,
  telegramAccessToken: integrations.telegram.accessToken,
  devWhatsAppAccessToken: integrations.whatsapp.accessToken,
  testEmail: testing.testEmail,
} as const;

// ============================================================================
// Backwards Compatibility Exports
// ============================================================================

export const REDIRECT_URI = urls.authCallback;
