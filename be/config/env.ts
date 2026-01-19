// ============================================================================
// CONSTANTS (Non-Secrets - All hardcoded values)
// ============================================================================

const CONSTANTS = {
  // Supabase
  SUPABASE_URL: "https://vdwjfekcsnurtjsieojv.supabase.co",

  // Google OAuth
  GOOGLE_CLIENT_ID:
    "633918377873-vvlgvie0ksenm5jcvs3c74vhb17rdqsn.apps.googleusercontent.com",

  // URLs (Production)
  PROD_BACKEND_URL: "https://be.askally.io",
  PROD_FRONTEND_URL: "https://askally.io",

  // Slack
  SLACK_APP_ID: "A0A87Q52742",
  SLACK_CLIENT_ID: "10273441014227.10279821075138",

  // LemonSqueezy (public IDs)
  LEMONSQUEEZY_STORE_ID: "270009",
  LEMONSQUEEZY_VARIANTS: {
    STARTER_MONTHLY: "1204847",
    STARTER_YEARLY: "1204888",
    PRO_MONTHLY: "1204856",
    PRO_YEARLY: "1204874",
    EXECUTIVE_MONTHLY: "1204865",
    EXECUTIVE_YEARLY: "1204889",
    CREDITS: "1204898",
  },

  // PostHog (public key - designed to be client-exposed)
  POSTHOG_API_KEY: "phc_BzQm2gxcxiK0a5IiF2IbDPGDPmoRFrlBSe1vv9HQSHu",
  POSTHOG_HOST: "https://us.i.posthog.com",

  // Email addresses (not secrets)
  RESEND_FROM_EMAIL: "hello@askally.io",
  SUPPORT_EMAIL: "support@askally.io",

  // Server defaults
  DEV_PORT: 3000,
  PROD_PORT: 8080,
  DEFAULT_HOST: "localhost",
  WHATSAPP_API_VERSION: "v24.0",
} as const;

// ============================================================================
// REQUIRED SECRETS (Must be in .env file)
// ============================================================================

const REQUIRED_SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPEN_API_KEY",
  "GOOGLE_CLIENT_SECRET",
] as const;

// ============================================================================
// ENVIRONMENT SETUP
// ============================================================================

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env file only in development - production uses injected env vars
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") });
}

// ============================================================================
// VALIDATION (Check for required secrets)
// ============================================================================

const missingSecrets = REQUIRED_SECRETS.filter((key) => !process.env[key]);
if (missingSecrets.length > 0) {
  throw new Error(
    `Missing required secret environment variables: ${missingSecrets.join(", ")}`
  );
}

// ============================================================================
// HELPER FUNCTIONS (Type-safe environment variable access)
// ============================================================================

const getOptional = (key: string): string | undefined =>
  process.env[key] || undefined;

const getRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not set`);
  }
  return value;
};

// ============================================================================
// ENVIRONMENT DETECTION (Based on NODE_ENV and PORT)
// ============================================================================

/**
 * Environment detection strategy:
 * - Use PORT to detect environment: 3000 = local dev, 8080 = production (App Runner)
 * - This is more reliable than NODE_ENV which may not be set
 * - Falls back to NODE_ENV if PORT matches neither
 */
const port = Number(process.env.PORT) || CONSTANTS.DEV_PORT;
const nodeEnv = process.env.NODE_ENV || "development";

// Port-based detection: 3000 = dev, 8080 = prod
const isDevPort = port === CONSTANTS.DEV_PORT;
const isProdPort = port === CONSTANTS.PROD_PORT;

export const isDev = isDevPort && !isProdPort && nodeEnv !== "production";
export const isProd =
  isProdPort || nodeEnv === "production" || !isDevPort;

// ============================================================================
// SERVER CONFIGURATION
// ============================================================================

const server = {
  nodeEnv,
  port,
  host: process.env.HOST ?? CONSTANTS.DEFAULT_HOST,
  get baseUrl(): string {
    if (isProd) {
      return CONSTANTS.PROD_BACKEND_URL.replace(/\/+$/, "");
    }
    const url = process.env.BASE_URL ?? `http://${this.host}:${this.port}`;
    return url.replace(/\/+$/, "");
  },
} as const;

// ============================================================================
// URL CONFIGURATIONS
// ============================================================================

const urls = {
  get api(): string {
    return server.baseUrl;
  },
  get authCallback(): string {
    return `${server.baseUrl}/api/users/callback`;
  },
  get frontend(): string {
    if (isProd) {
      return CONSTANTS.PROD_FRONTEND_URL;
    }
    const url = process.env.FRONTEND_URL ?? "http://localhost:4000";
    return url.replace(/\/+$/, "");
  },
} as const;

// ============================================================================
// SERVICE CONFIGURATIONS
// ============================================================================

const supabase = {
  url: CONSTANTS.SUPABASE_URL,
  serviceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY"),
} as const;

const google = {
  clientId: CONSTANTS.GOOGLE_CLIENT_ID,
  clientSecret: getRequired("GOOGLE_CLIENT_SECRET"),
  apiKey: getOptional("GOOGLE_API_KEY"),
} as const;

const openai = {
  apiKey: getRequired("OPEN_API_KEY"),
} as const;

const lemonSqueezy = {
  apiKey: getOptional("LEMONSQUEEZY_API_KEY"),
  storeId: CONSTANTS.LEMONSQUEEZY_STORE_ID,
  webhookSecret: getOptional("LEMONSQUEEZY_WEBHOOK_SECRET"),
  variants: CONSTANTS.LEMONSQUEEZY_VARIANTS,
  get isEnabled(): boolean {
    return !!this.apiKey;
  },
} as const;


const posthog = {
  apiKey: CONSTANTS.POSTHOG_API_KEY,
  host: CONSTANTS.POSTHOG_HOST,
  get isEnabled(): boolean {
    return !!this.apiKey;
  },
} as const;

const resend = {
  apiKey: getOptional("RESEND_API_KEY"),
  webhookSecret: getOptional("RESEND_WEBHOOK_SECRET"),
  fromEmail: CONSTANTS.RESEND_FROM_EMAIL,
  supportEmail: CONSTANTS.SUPPORT_EMAIL,
  storeInboundAttachments: process.env.STORE_INBOUND_ATTACHMENTS === "true",
  get isEnabled(): boolean {
    return !!this.apiKey;
  },
} as const;

// ============================================================================
// INTEGRATION CONFIGURATIONS
// ============================================================================

const integrations = {
  telegram: {
    accessToken: getOptional("TELEGRAM_BOT_ACCESS_TOKEN"),
    // Always use webhook mode in production for reliability with App Runner
    // Long-polling fails with auto-scaling (duplicate bots) and idle timeouts
    get useWebhook(): boolean {
      return isProd;
    },
    get isEnabled(): boolean {
      return !!this.accessToken;
    },
  },
  whatsapp: {
    phoneNumberId: getOptional("WHATSAPP_PHONE_NUMBER_ID"),
    businessAccountId: getOptional("WHATSAPP_BUSINESS_ACCOUNT_ID"),
    accessToken: getOptional("WHATSAPP_ACCESS_TOKEN"),
    verifyToken: getOptional("WHATSAPP_VERIFY_TOKEN"),
    appSecret: getOptional("WHATSAPP_APP_SECRET"),
    apiVersion: CONSTANTS.WHATSAPP_API_VERSION,
    get isEnabled(): boolean {
      return !!(this.phoneNumberId && this.accessToken && this.verifyToken);
    },
    get baseUrl(): string {
      return `https://graph.facebook.com/${this.apiVersion}`;
    },
    get isFullyConfigured(): boolean {
      return !!(
        this.phoneNumberId &&
        this.businessAccountId &&
        this.accessToken &&
        this.verifyToken &&
        this.appSecret
      );
    },
  },
  slack: {
    appId: CONSTANTS.SLACK_APP_ID,
    clientId: CONSTANTS.SLACK_CLIENT_ID,
    clientSecret: getOptional("SLACK_CLIENT_SECRET"),
    signingSecret: getOptional("SLACK_SIGNING_SECRET"),
    botToken: getOptional("SLACK_BOT_TOKEN"),
    get isEnabled(): boolean {
      return !!(this.botToken && this.signingSecret);
    },
  },
} as const;

// ============================================================================
// ATLASSIAN CONFIGURATIONS (Jira/Confluence - Optional)
// ============================================================================

const atlassian = {
  jira: {
    url: getOptional("JIRA_URL"),
    username: getOptional("JIRA_USERNAME"),
    apiToken: getOptional("JIRA_API_TOKEN"),
    projectsFilter: getOptional("JIRA_PROJECTS_FILTER")
      ?.split(",")
      .map((s) => s.trim()),
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
// TESTING CONFIGURATION
// ============================================================================

// ============================================================================
// MAIN EXPORT OBJECT
// ============================================================================

export const env = {
  // Environment detection
  nodeEnv: server.nodeEnv,
  isDev,
  isProd,

  // Server
  port: server.port,
  host: server.host,
  baseUrl: server.baseUrl,

  // URLs
  urls,

  // Core services
  server,
  supabase,
  google,
  openai,

  // Optional services
  lemonSqueezy,
  posthog,
  resend,

  // Integrations
  integrations,
  atlassian,


  // Legacy flat accessors (for backwards compatibility)
  supabaseUrl: supabase.url,
  supabaseServiceRoleKey: supabase.serviceRoleKey,
  googleClientId: google.clientId,
  googleClientSecret: google.clientSecret,
  googleApiKey: google.apiKey,
  openAiApiKey: openai.apiKey,
  telegramAccessToken: integrations.telegram.accessToken,
} 

// ============================================================================
// BACKWARDS COMPATIBILITY EXPORTS
// ============================================================================

export const REDIRECT_URI = urls.authCallback;
