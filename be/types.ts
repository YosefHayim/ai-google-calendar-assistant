import type { AGENTS, AGENT_TOOLS } from "@/ai-agents";

import type { User } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";

export type EventParametersProps = {
  summary?: string | null | undefined;
  description?: string | null | undefined;
  start?: calendar_v3.Schema$EventDateTime | undefined;
  end?: calendar_v3.Schema$EventDateTime | undefined;
};

export type UpdateCalendarCategoriesProps = {
  calendarName: string | null | undefined;
  calendarId: string | null | undefined;
  calendarColorForEvents: string | null | undefined;
  accessRole: string | null | undefined;
  timeZoneForCalendar: string | null | undefined;
  defaultReminders: calendar_v3.Schema$EventReminder[] | undefined;
};

export type AuthedRequest = Request & { user: User };

export type GoogleIdTokenPayloadProps = {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash?: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
};

export type PendingConflictConfirmation = {
  eventData: {
    summary: string;
    start: { dateTime?: string; date?: string; timeZone?: string };
    end: { dateTime?: string; date?: string; timeZone?: string };
    calendarId: string;
    calendarName: string;
    email: string;
    location?: string;
    description?: string;
  };
  conflictingEvents: Array<{
    id: string;
    summary: string;
    start: string;
    end: string;
    calendarName: string;
  }>;
};

export type PendingEmailChange = {
  newEmail: string;
  expiresAt: number;
};

export type SessionData = {
  chatId: number;
  firstName: string | undefined;
  username: string | undefined;
  userId: number;
  codeLang: string | undefined;
  messageCount: number;
  email: string | undefined;
  lastProcessedMsgId: number;
  agentActive: boolean;
  isProcessing: boolean;
  pendingConfirmation?: PendingConflictConfirmation;
  googleTokens?: TokensProps;
  // Email verification state for Telegram
  pendingEmailVerification?: {
    email: string;
    expiresAt: number;
  };
  // Session expiry tracking (24h TTL)
  lastActivity: number;
  // Email change flow state
  pendingEmailChange?: PendingEmailChange;
  // Flag for awaiting new email input
  awaitingEmailChange?: boolean;
};

export type TokensProps = {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string;
  token_type?: string | null;
  id_token?: string | null;
  expiry_date?: number | null;
  refresh_token_expires_in?: number | null;
  email?: string | null;
  timezone?: string | null;
  is_active?: boolean | null;
};

export type userAndAiMessageProps = {
  role: "user" | "assistant";
  content: string | undefined;
};

export type TOOLS = keyof typeof AGENT_TOOLS;
export type AGENTS_LIST = keyof typeof AGENTS;
