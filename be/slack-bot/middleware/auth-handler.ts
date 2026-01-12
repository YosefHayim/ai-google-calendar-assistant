import type { WebClient } from "@slack/web-api"
import { SUPABASE } from "@/config"
import { logger } from "@/utils/logger"
import { getSession, updateSession, type SlackSessionData } from "../utils/session"
import { getSlackUserEmail } from "../utils/user-resolver"
import validator from "validator"

const OTP_EXPIRY_MS = 10 * 60 * 1000

interface AuthResult {
  success: boolean
  session: SlackSessionData
  needsAuth: boolean
  authMessage?: string
}

const sendEmailOtp = async (email: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    })

    if (error) {
      if (error.message.includes("User not found") || error.message.includes("Signups not allowed")) {
        const { error: createError } = await SUPABASE.auth.signInWithOtp({
          email,
          options: { shouldCreateUser: true },
        })
        if (createError) {
          return { success: false, error: createError.message }
        }
        return { success: true }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

const verifyEmailOtp = async (
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await SUPABASE.auth.verifyOtp({
      email,
      token,
      type: "email",
    })
    return error ? { success: false, error: error.message } : { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

const isOtpCode = (text: string): boolean => {
  const trimmed = text.trim()
  return validator.isLength(trimmed, { min: 6, max: 6 }) && validator.isNumeric(trimmed)
}

export const handleSlackAuth = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  messageText?: string
): Promise<AuthResult> => {
  const session = getSession(slackUserId, teamId)

  try {
    const { data: slackUser, error } = await SUPABASE
      .from("slack_users")
      .select("user_id, first_name")
      .eq("slack_user_id", slackUserId)
      .single()

    if (error && error.code !== "PGRST116") {
      logger.error(`Slack Bot: Auth: DB Error: ${error.message}`)
    }

    if (slackUser?.user_id) {
      const { data: userData } = await SUPABASE
        .from("users")
        .select("email")
        .eq("id", slackUser.user_id)
        .single()

      if (userData?.email) {
        updateSession(slackUserId, teamId, {
          email: userData.email,
          userId: slackUser.user_id,
          pendingEmailVerification: undefined,
        })
        session.messageCount++
        return { success: true, session, needsAuth: false }
      }
    }

    if (session.email && !session.pendingEmailVerification) {
      return { success: true, session, needsAuth: false }
    }

    if (session.pendingEmailVerification) {
      const { email: pendingEmail, expiresAt } = session.pendingEmailVerification

      if (Date.now() > expiresAt) {
        updateSession(slackUserId, teamId, { pendingEmailVerification: undefined })
        return {
          success: false,
          session,
          needsAuth: true,
          authMessage: "Your verification code has expired. Please enter your email again to receive a new code.",
        }
      }

      if (messageText && isOtpCode(messageText)) {
        const verification = await verifyEmailOtp(pendingEmail, messageText.trim())

        if (!verification.success) {
          return {
            success: false,
            session,
            needsAuth: true,
            authMessage: `Invalid verification code. ${verification.error || ""}. Please try again or enter a different email.`,
          }
        }

        await linkSlackUser(client, slackUserId, teamId, pendingEmail, session)

        return {
          success: true,
          session,
          needsAuth: false,
          authMessage: "Email verified successfully! You can now use Ally to manage your calendar.",
        }
      }

      if (messageText && validator.isEmail(messageText)) {
        const newEmail = messageText.toLowerCase().trim()
        const otpResult = await sendEmailOtp(newEmail)

        if (!otpResult.success) {
          return {
            success: false,
            session,
            needsAuth: true,
            authMessage: `Failed to send verification code: ${otpResult.error}`,
          }
        }

        updateSession(slackUserId, teamId, {
          pendingEmailVerification: { email: newEmail, expiresAt: Date.now() + OTP_EXPIRY_MS },
        })

        return {
          success: false,
          session,
          needsAuth: true,
          authMessage: `Verification code sent to ${newEmail}. Please enter the 6-digit code.`,
        }
      }

      return {
        success: false,
        session,
        needsAuth: true,
        authMessage: "Please enter the 6-digit verification code from your email, or enter a different email address.",
      }
    }

    const slackEmail = await getSlackUserEmail(client, slackUserId)

    if (slackEmail) {
      const { data: existingUser } = await SUPABASE
        .from("users")
        .select("id, email")
        .ilike("email", slackEmail)
        .maybeSingle()

      if (existingUser) {
        await linkSlackUserDirect(client, slackUserId, teamId, slackEmail, existingUser.id, session)
        return { success: true, session, needsAuth: false }
      }
    }

    if (messageText && validator.isEmail(messageText)) {
      const emailToVerify = messageText.toLowerCase().trim()
      const otpResult = await sendEmailOtp(emailToVerify)

      if (!otpResult.success) {
        return {
          success: false,
          session,
          needsAuth: true,
          authMessage: `Failed to send verification code: ${otpResult.error}`,
        }
      }

      updateSession(slackUserId, teamId, {
        pendingEmailVerification: { email: emailToVerify, expiresAt: Date.now() + OTP_EXPIRY_MS },
      })

      return {
        success: false,
        session,
        needsAuth: true,
        authMessage: `Verification code sent to ${emailToVerify}. Please enter the 6-digit code.`,
      }
    }

    return {
      success: false,
      session,
      needsAuth: true,
      authMessage: "Welcome to Ally! To get started, please enter your email address. We'll send you a verification code.",
    }
  } catch (err) {
    logger.error(`Slack Bot: Auth: Unexpected error: ${err}`)
    return { success: false, session, needsAuth: false }
  }
}

const linkSlackUser = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  email: string,
  session: SlackSessionData
): Promise<void> => {
  let userId: string | null = null

  const { data: existingUser } = await SUPABASE
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle()

  if (!existingUser) {
    const { data: newUser, error: userError } = await SUPABASE
      .from("users")
      .insert({ email, status: "pending_verification" })
      .select("id")
      .single()

    if (userError || !newUser) {
      logger.error(`Slack Bot: Auth: Failed to create user: ${userError?.message}`)
      return
    }
    userId = newUser.id
  } else {
    userId = existingUser.id
  }

  await linkSlackUserDirect(client, slackUserId, teamId, email, userId, session)
}

const linkSlackUserDirect = async (
  client: WebClient,
  slackUserId: string,
  teamId: string,
  email: string,
  userId: string,
  session: SlackSessionData
): Promise<void> => {
  try {
    const userInfo = await client.users.info({ user: slackUserId })
    const profile = userInfo.user?.profile

    const { data: existingSlackUser } = await SUPABASE
      .from("slack_users")
      .select("id")
      .eq("slack_user_id", slackUserId)
      .maybeSingle()

    if (existingSlackUser) {
      await SUPABASE
        .from("slack_users")
        .update({
          user_id: userId,
          slack_team_id: teamId,
          slack_username: profile?.display_name || profile?.real_name,
          first_name: profile?.first_name,
          is_linked: true,
          last_activity_at: new Date().toISOString(),
        })
        .eq("id", existingSlackUser.id)
    } else {
      await SUPABASE.from("slack_users").insert({
        slack_user_id: slackUserId,
        slack_team_id: teamId,
        slack_username: profile?.display_name || profile?.real_name,
        first_name: profile?.first_name,
        user_id: userId,
        is_linked: true,
      })
    }

    updateSession(slackUserId, teamId, {
      email,
      userId,
      firstName: profile?.first_name,
      username: profile?.display_name || profile?.real_name,
      pendingEmailVerification: undefined,
    })
  } catch (error) {
    logger.error(`Slack Bot: Failed to link user: ${error}`)
  }
}
