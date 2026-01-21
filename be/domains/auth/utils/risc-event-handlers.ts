/**
 * Google RISC Event Handlers
 *
 * Processes security events from Google's Cross-Account Protection system.
 * @see https://developers.google.com/identity/protocols/risc
 */

import { logger } from "@/lib/logger";
import { userRepository } from "@/lib/repositories/UserRepository";
import { extractGoogleSubjectId } from "./risc-jwt-verifier";
import {
  RISC_EVENT_TYPES,
  type RiscEventData,
  type RiscEventResult,
  type RiscSecurityEventToken,
} from "./risc-types";

/**
 * Processes all events in a RISC Security Event Token
 */
export async function processRiscEvents(
  payload: RiscSecurityEventToken
): Promise<RiscEventResult[]> {
  const results: RiscEventResult[] = [];
  const googleSubjectId = extractGoogleSubjectId(payload);

  logger.info(`RISC: Processing events for token jti=${payload.jti}`, {
    eventTypes: Object.keys(payload.events),
    googleSubjectId,
  });

  for (const [eventType, eventData] of Object.entries(payload.events)) {
    const result = await processRiscEvent(
      eventType,
      eventData,
      googleSubjectId
    );
    results.push(result);
  }

  return results;
}

/**
 * Processes a single RISC event
 */
async function processRiscEvent(
  eventType: string,
  eventData: RiscEventData,
  googleSubjectId: string | null
): Promise<RiscEventResult> {
  logger.info(`RISC: Processing event type: ${eventType}`, { eventData });

  switch (eventType) {
    case RISC_EVENT_TYPES.TOKENS_REVOKED:
      return handleTokensRevoked(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.TOKEN_REVOKED:
      return handleTokenRevoked(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.SESSIONS_REVOKED:
      return handleSessionsRevoked(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.ACCOUNT_DISABLED:
      return handleAccountDisabled(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.ACCOUNT_ENABLED:
      return handleAccountEnabled(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.ACCOUNT_CREDENTIAL_CHANGE_REQUIRED:
      return handleCredentialChangeRequired(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.ACCOUNT_PURGED:
      return handleAccountPurged(googleSubjectId, eventData);

    case RISC_EVENT_TYPES.VERIFICATION:
      return handleVerification(eventData);

    default:
      logger.warn(`RISC: Unknown event type: ${eventType}`);
      return {
        success: true,
        eventType,
        googleSubjectId: googleSubjectId ?? undefined,
        action: "ignored_unknown_event",
      };
  }
}

/**
 * Handles tokens-revoked event
 * Action: Immediately delete all stored OAuth Access/Refresh tokens for the user
 */
async function handleTokensRevoked(
  googleSubjectId: string | null,
  _eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: tokens-revoked event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.TOKENS_REVOKED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling tokens-revoked for Google subject: ${googleSubjectId}`
  );

  const result =
    await userRepository.revokeTokensByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.TOKENS_REVOKED,
      googleSubjectId,
      action: "failed_user_not_found",
      error: "User not found for subject ID",
    };
  }

  logger.info(
    `RISC: Successfully revoked tokens for user ${result.email} (sub: ${googleSubjectId})`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.TOKENS_REVOKED,
    googleSubjectId,
    action: "tokens_revoked",
  };
}

/**
 * Handles token-revoked event (specific token)
 * Action: Check if the token_identifier matches our stored refresh token and delete if so
 */
async function handleTokenRevoked(
  googleSubjectId: string | null,
  eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: token-revoked event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.TOKEN_REVOKED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling token-revoked for Google subject: ${googleSubjectId}`,
    {
      tokenIdentifierAlg: eventData.token_identifier_alg,
      hasTokenIdentifier: !!eventData.token_identifier,
    }
  );

  // For simplicity, we treat token-revoked the same as tokens-revoked
  // since we only store one set of tokens per user-provider combination.
  // A more sophisticated implementation could hash stored tokens and compare.
  const result =
    await userRepository.revokeTokensByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.TOKEN_REVOKED,
      googleSubjectId,
      action: "failed_user_not_found",
      error: "User not found for subject ID",
    };
  }

  logger.info(
    `RISC: Successfully revoked token for user ${result.email} (sub: ${googleSubjectId})`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.TOKEN_REVOKED,
    googleSubjectId,
    action: "token_revoked",
  };
}

/**
 * Handles sessions-revoked event
 * Action: Terminate the user's active session and force re-login
 */
async function handleSessionsRevoked(
  googleSubjectId: string | null,
  _eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: sessions-revoked event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.SESSIONS_REVOKED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling sessions-revoked for Google subject: ${googleSubjectId}`
  );

  // Revoke tokens to force re-authentication
  // Note: Since we use Supabase Auth with cookie-based sessions,
  // revoking OAuth tokens will force re-authentication on next API call
  const result =
    await userRepository.revokeTokensByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.SESSIONS_REVOKED,
      googleSubjectId,
      action: "failed_user_not_found",
      error: "User not found for subject ID",
    };
  }

  logger.info(
    `RISC: Successfully revoked session for user ${result.email} (sub: ${googleSubjectId})`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.SESSIONS_REVOKED,
    googleSubjectId,
    action: "session_revoked",
  };
}

/**
 * Handles account-disabled event
 * Action: Suspend the user account and revoke tokens
 */
async function handleAccountDisabled(
  googleSubjectId: string | null,
  eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: account-disabled event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.ACCOUNT_DISABLED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling account-disabled for Google subject: ${googleSubjectId}`,
    { reason: eventData.reason }
  );

  const result =
    await userRepository.suspendUserByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.ACCOUNT_DISABLED,
      googleSubjectId,
      action: "failed_user_not_found",
      error: "User not found for subject ID",
    };
  }

  logger.info(
    `RISC: Successfully suspended user ${result.email} (sub: ${googleSubjectId})`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.ACCOUNT_DISABLED,
    googleSubjectId,
    action: "account_suspended",
  };
}

/**
 * Handles account-enabled event
 * Action: Log the event (user may need to re-authenticate)
 */
async function handleAccountEnabled(
  googleSubjectId: string | null,
  _eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.warn("RISC: account-enabled event missing subject ID");
    return {
      success: true,
      eventType: RISC_EVENT_TYPES.ACCOUNT_ENABLED,
      action: "logged_no_action",
    };
  }

  logger.info(
    `RISC: Account re-enabled for Google subject: ${googleSubjectId}. User may need to re-authenticate.`
  );

  // We don't automatically unsuspend - user should re-authenticate
  return {
    success: true,
    eventType: RISC_EVENT_TYPES.ACCOUNT_ENABLED,
    googleSubjectId,
    action: "logged_account_enabled",
  };
}

/**
 * Handles account-credential-change-required event
 * Action: Revoke tokens and force re-authentication
 */
async function handleCredentialChangeRequired(
  googleSubjectId: string | null,
  _eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: credential-change-required event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.ACCOUNT_CREDENTIAL_CHANGE_REQUIRED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling credential-change-required for Google subject: ${googleSubjectId}`
  );

  // Revoke tokens to force re-authentication after credential change
  const result =
    await userRepository.revokeTokensByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.ACCOUNT_CREDENTIAL_CHANGE_REQUIRED,
      googleSubjectId,
      action: "failed_user_not_found",
      error: "User not found for subject ID",
    };
  }

  logger.info(
    `RISC: Revoked tokens due to credential change requirement for ${result.email}`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.ACCOUNT_CREDENTIAL_CHANGE_REQUIRED,
    googleSubjectId,
    action: "tokens_revoked_credential_change",
  };
}

/**
 * Handles account-purged event
 * Action: Revoke tokens (account data cleanup could be added if needed)
 */
async function handleAccountPurged(
  googleSubjectId: string | null,
  _eventData: RiscEventData
): Promise<RiscEventResult> {
  if (!googleSubjectId) {
    logger.error("RISC: account-purged event missing subject ID");
    return {
      success: false,
      eventType: RISC_EVENT_TYPES.ACCOUNT_PURGED,
      action: "failed_no_subject_id",
      error: "Missing subject ID in event",
    };
  }

  logger.info(
    `RISC: Handling account-purged for Google subject: ${googleSubjectId}`
  );

  // Revoke tokens - we don't delete user data, just invalidate Google connection
  const result =
    await userRepository.revokeTokensByGoogleSubjectId(googleSubjectId);

  if (!result.success) {
    // User may not exist in our system - log but consider success
    logger.info(
      `RISC: No user found for purged Google account (sub: ${googleSubjectId})`
    );
    return {
      success: true,
      eventType: RISC_EVENT_TYPES.ACCOUNT_PURGED,
      googleSubjectId,
      action: "no_action_user_not_found",
    };
  }

  logger.info(
    `RISC: Revoked tokens for purged Google account of user ${result.email}`
  );

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.ACCOUNT_PURGED,
    googleSubjectId,
    action: "tokens_revoked_account_purged",
  };
}

/**
 * Handles verification event (test event)
 * Action: Log receipt of verification event
 */
async function handleVerification(
  eventData: RiscEventData
): Promise<RiscEventResult> {
  logger.info("RISC: Received verification event", { eventData });

  return {
    success: true,
    eventType: RISC_EVENT_TYPES.VERIFICATION,
    action: "verification_acknowledged",
  };
}
