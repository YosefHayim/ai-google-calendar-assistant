import dotenv from "dotenv";
import path from "node:path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const REQUIRED_ENV_VARS = ["SUPABASE_SERVICE_ROLE_KEY", "OPEN_API_KEY", "GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] as const;

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT) || 3000,
  baseUrl: process.env.BASE_URL ?? "http://localhost:3000",

  // Supabase
  supabaseUrl: process.env.SUPABASE_URL ?? "https://vdwjfekcsnurtjsieojv.supabase.co",
  supabaseAnonKey:
    process.env.SUPABASE_ANON_KEY ??
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkd2pmZWtjc251cnRqc2llb2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg4ODksImV4cCI6MjA2NjI2NDg4OX0.-7ovo50UBnSHl1NO2g3XAMXZ6wU1aaCZ8EkmSJESpRc",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  // Google
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  googleApiKey: process.env.GOOGLE_API_KEY ?? "",

  // OpenAI
  openAiApiKey: process.env.OPEN_API_KEY ?? "",

  // Integrations
  telegramAccessToken: process.env.TELEGRAM_BOT_ACCESS_TOKEN ?? "",
  devWhatsAppAccessToken: process.env.DEV_WHATS_APP_ACCESS_TOKEN ?? "",
  testEmail: process.env.TEST_EMAIL ?? "",
} as const;

export const REDIRECT_URI = env.nodeEnv === "prod" ? `${env.supabaseUrl}/auth/v1/callback` : `${env.baseUrl}/api/users/callback`;
