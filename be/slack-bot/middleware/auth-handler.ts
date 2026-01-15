import type { WebClient } from "@slack/web-api";
import validator from "validator";
import { SUPABASE } from "@/config";
import { logger } from "@/utils/logger";
import {
  getSession,
  type SlackSessionData,
  updateSession,
} from "../utils/session";
import { getSlackUserEmail } from "../utils/user-resolver";

const OTP_EXPIRY_MS = 10 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const slackUsersTable = () => (SUPABASE as any).from("slack_users");

interface SlackUserRow {
  id: string;
  slack_user_id: string;
  slack_team_id: string | null;
  slack_username: string | null;
  first_name: string | null;
  user_id: string | null;
  is_linked: boolean | null;
  last_activity_at: string | null;
  created_at: string | null;
}

interface AuthResult {
  success: boolean;
  session: SlackSessionData;
  needsAuth: boolean;
  authMessage?: string;
}

const sendEmailOtp = async (
  email: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (error) {
      if (
        error.message.includes("User not found") ||
        error.message.includes("Signups not allowed")
      ) {
        const { error: createError } = await SUPABASE.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        });
        if (createError) {
          return { success: false, error: createError.message };
        }
        return { success: true };
      }
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

const verifyEmailOtp = async (
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.verifyOtp({
      email,
      token,
      type: "email",
    });
    return error ? { success: false, error: error.message } : { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

const isOtpCode = (text: string): boolean => {
  const trimmed = text.trim();
  return (
    validator.isLength(trimmed, { min: 6, max: 6 }) &&
    validator.isNumeric(trimmed)
  );
};

const extractEmailFromSlackFormat = (text: string): string => {
  const trimmed = text.trim();

  if (trimmed.startsWith("<mailto:")) {
    const withoutPrefix = trimmed.slice(8);
    const pipeIndex = withoutPrefix.indexOf("|");
    const bracketIndex = withoutPrefix.indexOf(">");

    if (pipeIndex > 0) {
      return withoutPrefix.slice(0, pipeIndex).toLowerCase();
    }
    if (bracketIndex > 0) {
      return withoutPrefix.slice(0, bracketIndex).toLowerCase();
    }
  }

  return trimmed.toLowerCase();
};

export const handleSlackAuth = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  messageText?: string
): Promise<AuthResult> => {
  const session = getSession(slackUserId, teamId);

  try {
    const { data: slackUser, error } = await slackUsersTable()
      .select("user_id, first_name")
      .eq("slack_user_id", slackUserId)
      .single();

    if (error && error.code !== "PGRST116") {
      logger.error(`Slack Bot: Auth: DB Error: ${error.message}`);
    }

    const typedSlackUser = slackUser as {
      user_id: string | null;
      first_name: string | null;
    } | null;
    if (typedSlackUser?.user_id) {
      const { data: userData } = await SUPABASE.from("users")
        .select("email")
        .eq("id", typedSlackUser.user_id)
        .single();

      if (userData?.email) {
        updateSession(slackUserId, teamId, {
          email: userData.email,
          userId: typedSlackUser.user_id,
          pendingEmailVerification: undefined,
        });
        session.messageCount++;
        return { success: true, session, needsAuth: false };
      }
    }

    if (session.email && !session.pendingEmailVerification) {
      return { success: true, session, needsAuth: false };
    }

    if (session.pendingEmailVerification) {
      const { email: pendingEmail, expiresAt } =
        session.pendingEmailVerification;

      if (Date.now() > expiresAt) {
        updateSession(slackUserId, teamId, {
          pendingEmailVerification: undefined,
        });
        return {
          success: false,
          session,
          needsAuth: true,
          authMessage:
            "Your verification code has expired. Please enter your email again to receive a new code.",
        };
      }

      if (messageText && isOtpCode(messageText)) {
        const verification = await verifyEmailOtp(
          pendingEmail,
          messageText.trim()
        );

        if (!verification.success) {
          return {
            success: false,
            session,
            needsAuth: true,
            authMessage: `Invalid verification code. ${verification.error || ""}. Please try again or enter a different email.`,
          };
        }

        await linkSlackUser(client, slackUserId, teamId, pendingEmail, session);

        return {
          success: true,
          session,
          needsAuth: false,
          authMessage:
            "Email verified successfully! You can now use Ally to manage your calendar.",
        };
      }

      const extractedEmail = messageText
        ? extractEmailFromSlackFormat(messageText)
        : "";
      if (extractedEmail && validator.isEmail(extractedEmail)) {
        const newEmail = extractedEmail;
        const otpResult = await sendEmailOtp(newEmail);

        if (!otpResult.success) {
          return {
            success: false,
            session,
            needsAuth: true,
            authMessage: `Failed to send verification code: ${otpResult.error}`,
          };
        }

        updateSession(slackUserId, teamId, {
          pendingEmailVerification: {
            email: newEmail,
            expiresAt: Date.now() + OTP_EXPIRY_MS,
          },
        });

        return {
          success: false,
          session,
          needsAuth: true,
          authMessage: `Verification code sent to ${newEmail}. Please enter the 6-digit code.`,
        };
      }

      return {
        success: false,
        session,
        needsAuth: true,
        authMessage:
          "Please enter the 6-digit verification code from your email, or enter a different email address.",
      };
    }

    const slackEmail = await getSlackUserEmail(client, slackUserId);

    if (slackEmail) {
      const { data: existingUser } = await SUPABASE.from("users")
        .select("id, email")
        .ilike("email", slackEmail)
        .maybeSingle();

      if (existingUser) {
        await linkSlackUserDirect(
          client,
          slackUserId,
          teamId,
          slackEmail,
          existingUser.id,
          session
        );
        return { success: true, session, needsAuth: false };
      }
    }

    const extractedNewEmail = messageText
      ? extractEmailFromSlackFormat(messageText)
      : "";
    if (extractedNewEmail && validator.isEmail(extractedNewEmail)) {
      const emailToVerify = extractedNewEmail;
      const otpResult = await sendEmailOtp(emailToVerify);

      if (!otpResult.success) {
        return {
          success: false,
          session,
          needsAuth: true,
          authMessage: `Failed to send verification code: ${otpResult.error}`,
        };
      }

      updateSession(slackUserId, teamId, {
        pendingEmailVerification: {
          email: emailToVerify,
          expiresAt: Date.now() + OTP_EXPIRY_MS,
        },
      });

      return {
        success: false,
        session,
        needsAuth: true,
        authMessage: `Verification code sent to ${emailToVerify}. Please enter the 6-digit code.`,
      };
    }

    return {
      success: false,
      session,
      needsAuth: true,
      authMessage:
        "Welcome to Ally! To get started, please enter your email address. We'll send you a verification code.",
    };
  } catch (err) {
    logger.error(`Slack Bot: Auth: Unexpected error: ${err}`);
    return { success: false, session, needsAuth: false };
  }
};

const linkSlackUser = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  email: string,
  session: SlackSessionData
): Promise<void> => {
  let userId: string | null = null;

  const { data: existingUser, error: selectError } = await SUPABASE.from(
    "users"
  )
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (selectError) {
    logger.error(
      `Slack Bot: Auth: Failed to check existing user: ${selectError.message}`
    );
  }

  if (existingUser) {
    userId = existingUser.id;
    logger.info(`Slack Bot: Found existing user for ${email}`);
  } else {
    const { data: authUser } = await SUPABASE.auth.admin.listUsers();
    const matchedAuthUser = authUser?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (matchedAuthUser) {
      const { data: newUser, error: userError } = await SUPABASE.from("users")
        .insert({ id: matchedAuthUser.id, email, status: "active" })
        .select("id")
        .single();

      if (userError) {
        if (userError.code === "23505") {
          const { data: retryUser } = await SUPABASE.from("users")
            .select("id")
            .ilike("email", email)
            .maybeSingle();
          userId = retryUser?.id || matchedAuthUser.id;
        } else {
          logger.error(
            `Slack Bot: Auth: Failed to create user from auth: ${userError.message}`
          );
          return;
        }
      } else {
        userId = newUser?.id || matchedAuthUser.id;
      }
    } else {
      const { data: newUser, error: userError } = await SUPABASE.from("users")
        .insert({ email, status: "pending_verification" })
        .select("id")
        .single();

      if (userError || !newUser) {
        logger.error(
          `Slack Bot: Auth: Failed to create user: ${userError?.message}`
        );
        return;
      }
      userId = newUser.id;
    }
    logger.info(`Slack Bot: Created user record for ${email}`);
  }

  if (!userId) {
    logger.error(`Slack Bot: Auth: No user ID available for ${email}`);
    return;
  }

  await linkSlackUserDirect(
    client,
    slackUserId,
    teamId,
    email,
    userId,
    session
  );
};

const linkSlackUserDirect = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  email: string,
  userId: string,
  session: SlackSessionData
): Promise<void> => {
  try {
    const userInfo = await client.users.info({ user: slackUserId });
    const profile = userInfo.user?.profile;

    const { data: existingSlackUser, error: selectError } =
      await slackUsersTable()
        .select("id")
        .eq("slack_user_id", slackUserId)
        .maybeSingle();

    if (selectError) {
      logger.error(
        `Slack Bot: Failed to check existing slack user: ${selectError.message}`
      );
    }

    const typedExistingSlackUser = existingSlackUser as { id: string } | null;
    if (typedExistingSlackUser) {
      const { error: updateError } = await slackUsersTable()
        .update({
          user_id: userId,
          slack_team_id: teamId,
          slack_username: profile?.display_name || profile?.real_name,
          first_name: profile?.first_name,
          is_linked: true,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", typedExistingSlackUser.id);

      if (updateError) {
        logger.error(
          `Slack Bot: Failed to update slack user: ${updateError.message}`
        );
        return;
      }
      logger.info(`Slack Bot: Updated slack_users for ${slackUserId}`);
    } else {
      const { error: insertError } = await slackUsersTable().insert({
        slack_user_id: slackUserId,
        slack_team_id: teamId,
        slack_username: profile?.display_name || profile?.real_name,
        first_name: profile?.first_name,
        user_id: userId,
        is_linked: true,
      });

      if (insertError) {
        logger.error(
          `Slack Bot: Failed to insert slack user: ${insertError.message}`
        );
        return;
      }
      logger.info(
        `Slack Bot: Inserted new slack_users record for ${slackUserId}`
      );
    }

    updateSession(slackUserId, teamId, {
      email,
      userId,
      firstName: profile?.first_name,
      username: profile?.display_name || profile?.real_name,
      pendingEmailVerification: undefined,
    });
  } catch (error) {
    logger.error(`Slack Bot: Failed to link user: ${error}`);
  }
};
