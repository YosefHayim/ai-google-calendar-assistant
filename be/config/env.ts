import dotenv from "dotenv"
import path from "node:path"

// Only load .env file in development - in production, env vars are injected by the platform
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../.env") })
}

// ============================================================================
// Hardcoded Constants (Non-Secrets)
// ============================================================================

const CONSTANTS = {
  // Supabase
  SUPABASE_URL: "https://vdwjfekcsnurtjsieojv.supabase.co",

  // Google OAuth
  GOOGLE_CLIENT_ID: "633918377873-vvlgvie0ksenm5jcvs3c74vhb17rdqsn.apps.googleusercontent.com",

  // LiveKit
  LIVEKIT_WS_URL: "wss://ai-google-calendar-project-mljh2s1n.livekit.cloud",

  // LemonSqueezy
  LEMONSQUEEZY_STORE_ID: "270009",
  LEMONSQUEEZY_VARIANTS: {
    starter: { monthly: "1204847", yearly: "1204888" },
    pro: { monthly: "1204856", yearly: "1204874" },
    executive: { monthly: "1204865", yearly: "1204889" },
    credits: "1204898",
  },

  // URLs (Production)
  PROD_BACKEND_URL: "https://api.askally.io",
  PROD_FRONTEND_URL: "https://askally.io",

  // Defaults
  DEFAULT_PORT: 3000,
  DEFAULT_HOST: "localhost",
  WHATSAPP_API_VERSION: "v22.0",
} as const

// ============================================================================
// Validation - Only secrets need to be in .env
// ============================================================================

const REQUIRED_SECRETS = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "OPEN_API_KEY",
  "GOOGLE_CLIENT_SECRET",
] as const

const missing = REQUIRED_SECRETS.filter((key) => !process.env[key])
if (missing.length > 0) {
  throw new Error(`Missing required secret environment variables: ${missing.join(", ")}`)
}

// ============================================================================
// Helper to get optional env vars with type safety
// ============================================================================

const getOptional = (key: string): string | undefined => process.env[key] || undefined
const getRequired = (key: string): string => process.env[key]!

// ============================================================================
// Environment Detection
// ============================================================================

const nodeEnv = process.env.NODE_ENV ?? "development"

export const isDev = nodeEnv === "development" || nodeEnv === "dev"
export const isProd = nodeEnv === "production"
export const isTest = nodeEnv === "test"

// ============================================================================
// Server Configuration
// ============================================================================

const port = Number(process.env.PORT) || CONSTANTS.DEFAULT_PORT

const server = {
  nodeEnv,
  port,
  host: process.env.HOST ?? CONSTANTS.DEFAULT_HOST,
  get baseUrl(): string {
    // In production, use hardcoded URL. In dev, use localhost.
    if (isProd) {
      return CONSTANTS.PROD_BACKEND_URL
    }
    const url = process.env.BASE_URL ?? `http://${this.host}:${this.port}`
    return url.replace(/\/+$/, "")
  },
} as const

// ============================================================================
// URLs Configuration
// ============================================================================

const urls = {
  get api(): string {
    return server.baseUrl
  },
  get authCallback(): string {
    return `${server.baseUrl}/api/users/callback`
  },
  get frontend(): string {
    // In production, use hardcoded URL. In dev, use localhost.
    if (isProd) {
      return CONSTANTS.PROD_FRONTEND_URL
    }
    const url = process.env.FRONTEND_URL ?? "http://localhost:4000"
    return url.replace(/\/+$/, "")
  },
} as const

// ============================================================================
// Supabase Configuration
// ============================================================================

const supabase = {
  url: CONSTANTS.SUPABASE_URL,
  serviceRoleKey: getRequired("SUPABASE_SERVICE_ROLE_KEY"),
} as const

// ============================================================================
// Google Configuration
// ============================================================================

const google = {
  clientId: CONSTANTS.GOOGLE_CLIENT_ID,
  clientSecret: getRequired("GOOGLE_CLIENT_SECRET"),
  apiKey: getOptional("GOOGLE_API_KEY"),
} as const

// ============================================================================
// OpenAI Configuration
// ============================================================================

const openai = {
  apiKey: getRequired("OPEN_API_KEY"),
} as const

// ============================================================================
// LiveKit Configuration
// ============================================================================

const livekit = {
  wsUrl: CONSTANTS.LIVEKIT_WS_URL,
  apiKey: getOptional("LIVEKIT_API_KEY"),
  apiSecret: getOptional("LIVEKIT_API_SECRET"),
  get isEnabled(): boolean {
    return !!(this.apiKey && this.apiSecret)
  },
} as const

// ============================================================================
// LemonSqueezy Configuration
// ============================================================================

const lemonSqueezy = {
  apiKey: getOptional("LEMONSQUEEZY_API_KEY"),
  storeId: CONSTANTS.LEMONSQUEEZY_STORE_ID,
  webhookSecret: getOptional("LEMONSQUEEZY_WEBHOOK_SECRET"),
  variants: CONSTANTS.LEMONSQUEEZY_VARIANTS,
  get isEnabled(): boolean {
    return !!this.apiKey
  },
} as const

// ============================================================================
// Integrations Configuration
// ============================================================================

const integrations = {
  telegram: {
    accessToken: getOptional("TELEGRAM_BOT_ACCESS_TOKEN"),
    get isEnabled(): boolean {
      return !!this.accessToken
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
      return !!(this.phoneNumberId && this.accessToken && this.verifyToken)
    },
    get baseUrl(): string {
      return `https://graph.facebook.com/${this.apiVersion}`
    },
  },
} as const

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
      return !!(this.url && this.username && this.apiToken)
    },
  },
  confluence: {
    url: getOptional("CONFLUENCE_URL"),
    username: getOptional("CONFLUENCE_USERNAME"),
    apiToken: getOptional("CONFLUENCE_API_TOKEN"),
    get isEnabled(): boolean {
      return !!(this.url && this.username && this.apiToken)
    },
  },
} as const

// ============================================================================
// Resend Email Configuration
// ============================================================================

const resend = {
  apiKey: getOptional("RESEND_API_KEY"),
  webhookSecret: getOptional("RESEND_WEBHOOK_SECRET"),
  fromEmail: getOptional("RESEND_FROM_EMAIL") ?? "onboarding@resend.dev",
  supportEmail: getOptional("SUPPORT_EMAIL") ?? "support@ally.sh",
  storeInboundAttachments: process.env.STORE_INBOUND_ATTACHMENTS === "true",
  get isEnabled(): boolean {
    return !!this.apiKey
  },
} as const

// ============================================================================
// Testing Configuration
// ============================================================================

const testing = {
  testEmail: getOptional("TEST_EMAIL"),
} as const

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
  livekit,
  lemonSqueezy,
  integrations,
  atlassian,
  resend,
  testing,

  // Legacy flat accessors (for backwards compatibility)
  supabaseUrl: supabase.url,
  supabaseServiceRoleKey: supabase.serviceRoleKey,
  googleClientId: google.clientId,
  googleClientSecret: google.clientSecret,
  googleApiKey: google.apiKey,
  openAiApiKey: openai.apiKey,
  telegramAccessToken: integrations.telegram.accessToken,
  testEmail: testing.testEmail,
} as const

// ============================================================================
// Backwards Compatibility Exports
// ============================================================================

export const REDIRECT_URI = urls.authCallback
