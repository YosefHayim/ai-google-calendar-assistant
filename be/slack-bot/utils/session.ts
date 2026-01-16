import type { SupportedLocale } from "@/telegram-bot/i18n";

export type SlackSessionData = {
  slackUserId: string;
  slackTeamId: string;
  email?: string;
  userId?: string;
  firstName?: string;
  username?: string;
  codeLang?: SupportedLocale;
  messageCount: number;
  lastProcessedTs?: string;
  isProcessing: boolean;
  pendingConfirmation?: {
    eventData: unknown;
    conflictingEvents: unknown[];
  };
  pendingEmailVerification?: {
    email: string;
    expiresAt: number;
  };
  lastActivity: number;
};

const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const sessions = new Map<string, SlackSessionData>();

const getSessionKey = (slackUserId: string, teamId: string): string =>
  `${teamId}:${slackUserId}`;

export const getSession = (
  slackUserId: string,
  teamId: string
): SlackSessionData => {
  const key = getSessionKey(slackUserId, teamId);
  let session = sessions.get(key);

  if (!session) {
    session = {
      slackUserId,
      slackTeamId: teamId,
      messageCount: 0,
      isProcessing: false,
      lastActivity: Date.now(),
    };
    sessions.set(key, session);
  }

  session.lastActivity = Date.now();
  return session;
};

export const updateSession = (
  slackUserId: string,
  teamId: string,
  updates: Partial<SlackSessionData>
): SlackSessionData => {
  const session = getSession(slackUserId, teamId);
  Object.assign(session, updates, { lastActivity: Date.now() });
  return session;
};

export const resetSession = (slackUserId: string, teamId: string): void => {
  const session = getSession(slackUserId, teamId);
  session.isProcessing = false;
  session.pendingConfirmation = undefined;
  session.lastActivity = Date.now();
};

export const isDuplicateMessage = (
  slackUserId: string,
  teamId: string,
  ts: string
): boolean => {
  const session = getSession(slackUserId, teamId);
  if (session.lastProcessedTs === ts) {
    return true;
  }
  session.lastProcessedTs = ts;
  return false;
};

export const cleanupExpiredSessions = (): void => {
  const now = Date.now();
  for (const [key, session] of sessions.entries()) {
    if (now - session.lastActivity > SESSION_TTL_MS) {
      sessions.delete(key);
    }
  }
};

setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
