import path from "node:path";
import { SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import { google } from "googleapis";
import type { Database } from "@/database.types";
import { GOOGLE_CALENDAR_SCOPES } from "@/types";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

export const CONFIG = {
  baseUrl: "http://localhost:3000",
  redirectUrlDev: "http://localhost:3000/api/users/callback",
  redirectUrlProd: "",
  port: 3000,
  supabaseUrl: "https://vdwjfekcsnurtjsieojv.supabase.co",
  supabasePublicAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkd2pmZWtjc251cnRqc2llb2p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODg4ODksImV4cCI6MjA2NjI2NDg4OX0.-7ovo50UBnSHl1NO2g3XAMXZ6wU1aaCZ8EkmSJESpRc',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  openAiApiKey: process.env.OPEN_API_KEY,
  clientId: process.env.GOOGLE_CLIENT_ID,
  nodeEnv: process.env.NODE_ENV,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleApiKey: process.env.GOOGLE_API_KEY,
  telegramAccessToken: process.env.TELEGRAM_BOT_ACCESS_TOKEN,
  testEmail: process.env.TEST_EMAIL,
  devWhatsAppAccessToken: process.env.DEV_WHATS_APP_ACCESS_TOKEN,
};

export const SUPABASE = new SupabaseClient<Database>(CONFIG.supabaseUrl, CONFIG.supabaseServiceRoleKey);

export const OAUTH2CLIENT = new google.auth.OAuth2(CONFIG.clientId, CONFIG.clientSecret, CONFIG.redirectUrlDev);

export const CALENDAR = google.calendar({
  version: "v3",
  auth: OAUTH2CLIENT,
});

export const requestConfigBase = {
  sendUpdates: "all",
  supportsAttachments: true,
};

export const SCOPES = Object.values(GOOGLE_CALENDAR_SCOPES);

export const SCOPES_STRING = Object.values(GOOGLE_CALENDAR_SCOPES).join(" ");
