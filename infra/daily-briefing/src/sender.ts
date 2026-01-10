import type { SQSEvent, SQSBatchResponse, SQSBatchItemFailure } from "aws-lambda";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { google, type calendar_v3 } from "googleapis";
import { Resend } from "resend";
import { buildBriefingEmailHtml, buildBriefingEmailText } from "./email-template";

interface BriefingQueueMessage {
  userId: string;
  email: string;
  timezone: string;
  scheduledTime: string;
  date: string;
}

interface OAuthTokens {
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expiry_date?: number;
  token_type?: string;
  scope?: string;
}

interface UserData {
  id: string;
  email: string;
  display_name?: string;
  first_name?: string;
  preferences?: Record<string, unknown>;
}

const resend = new Resend(process.env.RESEND_API_KEY!);

function getSupabase(): SupabaseClient {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

function createOAuth2Client() {
  return new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Get user tokens from database
 */
async function getUserTokens(supabase: SupabaseClient, userId: string): Promise<OAuthTokens | null> {
  const { data, error } = await supabase
    .from("oauth_tokens")
    .select("access_token, refresh_token, id_token, expires_at, token_type, scope")
    .eq("user_id", userId)
    .eq("provider", "google")
    .eq("is_valid", true)
    .single();

  if (error || !data) {
    console.error(`No valid tokens found for user ${userId}:`, error);
    return null;
  }

  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    id_token: data.id_token,
    expiry_date: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
    token_type: data.token_type,
    scope: data.scope,
  };
}

/**
 * Get user data from database
 */
async function getUserData(supabase: SupabaseClient, userId: string): Promise<UserData | null> {
  const { data, error } = await supabase.from("users").select("id, email, display_name, first_name, preferences").eq("id", userId).single();

  if (error || !data) {
    console.error(`User not found ${userId}:`, error);
    return null;
  }

  return data;
}

/**
 * Update user's daily_briefing lastSentDate
 */
async function updateLastSentDate(supabase: SupabaseClient, userId: string, date: string): Promise<void> {
  // Get current preferences
  const { data: user, error: fetchError } = await supabase.from("users").select("preferences").eq("id", userId).single();

  if (fetchError || !user) {
    console.error(`Failed to fetch preferences for user ${userId}:`, fetchError);
    return;
  }

  const preferences = user.preferences || {};
  const dailyBriefing = ((preferences as Record<string, unknown>).daily_briefing as Record<string, unknown>) || {};

  // Update lastSentDate
  const updatedPreferences = {
    ...preferences,
    daily_briefing: {
      ...dailyBriefing,
      lastSentDate: date,
    },
  };

  const { error: updateError } = await supabase.from("users").update({ preferences: updatedPreferences }).eq("id", userId);

  if (updateError) {
    console.error(`Failed to update lastSentDate for user ${userId}:`, updateError);
  }
}

/**
 * Fetch calendar events for today
 */
async function fetchTodayEvents(tokens: OAuthTokens, timezone: string, date: string): Promise<calendar_v3.Schema$Event[]> {
  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: oauth2Client });

  // Calculate start and end of day in user's timezone
  const startOfDay = new Date(`${date}T00:00:00`);
  const endOfDay = new Date(`${date}T23:59:59`);

  // Convert to ISO strings with timezone consideration
  const timeMin = new Date(startOfDay.toLocaleString("en-US", { timeZone: timezone })).toISOString();
  const timeMax = new Date(endOfDay.toLocaleString("en-US", { timeZone: timezone })).toISOString();

  try {
    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: "startTime",
      maxResults: 50,
    });

    return response.data.items || [];
  } catch (error) {
    console.error("Error fetching calendar events:", error);

    // Check if token needs refresh
    if ((error as { code?: number }).code === 401) {
      console.log("Token expired, attempting refresh...");

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(credentials);

        const retryResponse = await calendar.events.list({
          calendarId: "primary",
          timeMin,
          timeMax,
          singleEvents: true,
          orderBy: "startTime",
          maxResults: 50,
        });

        return retryResponse.data.items || [];
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        throw refreshError;
      }
    }

    throw error;
  }
}

/**
 * Send the daily briefing email
 */
async function sendBriefingEmail(
  email: string,
  firstName: string | undefined,
  events: calendar_v3.Schema$Event[],
  timezone: string,
  date: string
): Promise<void> {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: timezone,
  });

  const subject = `Your Schedule for ${formattedDate}`;
  const html = buildBriefingEmailHtml(events, timezone, date, firstName);
  const text = buildBriefingEmailText(events, timezone, date, firstName);

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject,
    html,
    text,
  });
}

/**
 * Process a single user's daily briefing
 */
async function processUserBriefing(supabase: SupabaseClient, message: BriefingQueueMessage): Promise<void> {
  const { userId, email, timezone, date } = message;

  console.log(`Processing briefing for user ${userId}`);

  // Get user data
  const userData = await getUserData(supabase, userId);
  if (!userData) {
    console.warn(`User ${userId} not found, skipping`);
    return;
  }

  // Get tokens
  const tokens = await getUserTokens(supabase, userId);
  if (!tokens) {
    console.warn(`No valid tokens for user ${userId}, skipping`);
    return;
  }

  // Fetch today's events
  const events = await fetchTodayEvents(tokens, timezone, date);
  console.log(`Found ${events.length} events for user ${userId}`);

  // Send email
  await sendBriefingEmail(email, userData.first_name || userData.display_name?.split(" ")[0], events, timezone, date);

  // Update lastSentDate
  await updateLastSentDate(supabase, userId, date);

  console.log(`Successfully sent briefing to ${email}`);
}

/**
 * Lambda handler - processes SQS messages
 */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  console.log(`Processing ${event.Records.length} messages`);

  const supabase = getSupabase();
  const failures: SQSBatchItemFailure[] = [];

  for (const record of event.Records) {
    try {
      const message: BriefingQueueMessage = JSON.parse(record.body);
      await processUserBriefing(supabase, message);
    } catch (error) {
      console.error(`Failed to process message ${record.messageId}:`, error);
      failures.push({ itemIdentifier: record.messageId });
    }
  }

  console.log(`Processed ${event.Records.length - failures.length} successfully, ${failures.length} failed`);

  return { batchItemFailures: failures };
}
