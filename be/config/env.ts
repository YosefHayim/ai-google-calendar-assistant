import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const REQUIRED_ENV_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'OPEN_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT) || 3000,
  baseUrl: process.env.BASE_URL ?? 'http://localhost:3000',

  // Supabase
  supabaseUrl: 'https://vdwjfekcsnurtjsieojv.supabase.co',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',

  // Google
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
  googleApiKey: process.env.GOOGLE_API_KEY ?? '',

  // OpenAI
  openAiApiKey: process.env.OPEN_API_KEY ?? '',

  // Integrations
  telegramAccessToken: process.env.TELEGRAM_BOT_ACCESS_TOKEN ?? '',
  devWhatsAppAccessToken: process.env.DEV_WHATS_APP_ACCESS_TOKEN ?? '',
  testEmail: process.env.TEST_EMAIL ?? '',
} as const

export const REDIRECT_URI =
  env.nodeEnv === 'prod'
    ? `${env.supabaseUrl}/auth/v1/callback`
    : `${env.baseUrl}/api/users/callback`
