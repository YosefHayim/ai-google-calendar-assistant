import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  setAuthCookies,
} from "@/utils/auth/cookie-utils";
import type { TokensProps } from "@/types";
import {
  OAUTH2CLIENT,
  PROVIDERS,
  REDIRECT_URI,
  SCOPES,
  SCOPES_STRING,
  STATUS_RESPONSE,
  SUPABASE,
  env,
} from "@/config";
import type { Request, Response } from "express";
import {
  generateGoogleAuthUrl,
  supabaseThirdPartySignInOrSignUp,
} from "@/utils/auth";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { validateSupabaseToken } from "@/utils/auth/supabase-token";
import crypto from "node:crypto";

const ACCESS_TOKEN_HEADER = "access_token";
const REFRESH_TOKEN_HEADER = "refresh_token";
const USER_KEY = "user";

/**
 * Helper to convert milliseconds to ISO timestamp
 */
const msToIso = (ms: number): string => new Date(ms).toISOString();

/**
 * Helper to convert ISO timestamp to milliseconds
 */
const isoToMs = (iso: string | null | undefined): number | null => {
  if (!iso) return null;
  return new Date(iso).getTime();
};

/**
 * Generate Google Auth URL and Handle Callback
 * Uses the new schema: users + oauth_tokens tables
 */
const generateAuthGoogleUrl = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const code = req.query.code as string | undefined;
    const postmanHeaders = req.headers["user-agent"];

    // Check if user already has tokens with refresh_token to avoid unnecessary consent screen
    let forceConsent = true; // Default to true for first-time auth

    // Try to get user email from req.user (if middleware set it) or from cookies
    let userEmail: string | undefined = req.user?.email;

    // If no user from middleware, try to get from cookies (for unauthenticated callback route)
    if (!userEmail) {
      const accessToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
      if (accessToken) {
        try {
          const validation = await validateSupabaseToken(accessToken);
          if (validation.user?.email) {
            userEmail = validation.user.email;
          }
        } catch (error) {
          // Token invalid or expired - will default to forceConsent = true
        }
      }
    }

    if (userEmail) {
      const normalizedEmail = userEmail.toLowerCase().trim();

      // First find the user
      const { data: user } = await SUPABASE.from("users")
        .select("id")
        .ilike("email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      if (user) {
        // Check if they have a valid Google OAuth token
        const { data: existingToken } = await SUPABASE.from("oauth_tokens")
          .select("refresh_token, is_valid")
          .eq("user_id", user.id)
          .eq("provider", "google")
          .limit(1)
          .maybeSingle();

        // Only force consent if user doesn't have a valid refresh token
        forceConsent =
          !existingToken?.refresh_token || !existingToken?.is_valid;
      }
    }

    // Generate the auth URL with optimized consent prompt
    const url = generateGoogleAuthUrl({ forceConsent });

    // 1. No code provided? Redirect user to Google Consent Screen
    if (!code) {
      // If request is from Postman, return URL as JSON to avoid manual redirect issues
      if (postmanHeaders?.includes("Postman")) {
        return sendR(res, STATUS_RESPONSE.SUCCESS, url);
      }
      return res.redirect(url);
    }

    // 2. Code provided? Exchange it for Tokens
    try {
      const { tokens } = await OAUTH2CLIENT.getToken(code);

      // SECURITY FIX: Verify ID token signature instead of just decoding
      if (!tokens.id_token) {
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "No ID token received from Google.",
        );
      }

      const ticket = await OAUTH2CLIENT.verifyIdToken({
        idToken: tokens.id_token,
        audience: env.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return sendR(
          res,
          STATUS_RESPONSE.BAD_REQUEST,
          "Failed to verify user profile from Google token.",
        );
      }

      // Use verified payload
      const googleUser = {
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name,
        picture: payload.picture,
      };

      const normalizedEmail = googleUser.email.toLowerCase().trim();

      // --- UPSERT USER ---
      const userUpsertPayload = {
        email: normalizedEmail,
        first_name: googleUser.given_name ?? null,
        last_name: googleUser.family_name ?? null,
        avatar_url: googleUser.picture ?? null,
        display_name: googleUser.given_name
          ? `${googleUser.given_name} ${googleUser.family_name || ""}`.trim()
          : null,
        email_verified: true,
        status: "active" as const,
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: userData, error: userError } = await SUPABASE.from("users")
        .upsert(userUpsertPayload, { onConflict: "email" })
        .select("id")
        .single();

      if (userError || !userData) {
        console.error("Supabase User Upsert Error:", userError);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to store user in database.",
          userError,
        );
      }

      // --- UPSERT OAUTH TOKEN ---
      const tokenUpsertPayload: {
        user_id: string;
        provider: "google";
        access_token: string;
        token_type?: string | null;
        id_token?: string | null;
        scope?: string | null;
        expires_at?: string | null;
        is_valid: boolean;
        updated_at: string;
        refresh_token?: string;
      } = {
        user_id: userData.id,
        provider: "google",
        access_token: tokens.access_token!,
        token_type: tokens.token_type ?? null,
        id_token: tokens.id_token ?? null,
        scope: tokens.scope ?? null,
        expires_at: tokens.expiry_date ? msToIso(tokens.expiry_date) : null,
        is_valid: true,
        updated_at: new Date().toISOString(),
      };

      // CRITICAL: Only update refresh_token if Google sent a new one
      if (tokens.refresh_token) {
        tokenUpsertPayload.refresh_token = tokens.refresh_token;
      }

      const { error: tokenError } = await SUPABASE.from("oauth_tokens").upsert(
        tokenUpsertPayload,
        { onConflict: "user_id,provider" },
      );

      if (tokenError) {
        console.error("Supabase Token Save Error:", tokenError);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to store Google tokens in database.",
          tokenError,
        );
      }

      // --- SUPABASE AUTH SIGN IN ---
      const { data: signInData, error: signInError } =
        await SUPABASE.auth.signInWithIdToken({
          provider: PROVIDERS.GOOGLE,
          token: tokens.id_token!,
          access_token: tokens.access_token!,
        });

      if (signInError) {
        console.error("Supabase Auth Error:", signInError);
        return sendR(
          res,
          STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
          "Failed to sign in user via Supabase Auth.",
          signInError,
        );
      }

      // Set Cookies for the Client
      if (signInData && signInData.session) {
        setAuthCookies(
          res,
          signInData.session.access_token,
          signInData.session.refresh_token,
          signInData.user,
        );

        const frontendUrl = env.urls.frontend;
        const safeParams = new URLSearchParams({
          auth: "success",
          first_name: googleUser.given_name || "",
          last_name: googleUser.family_name || "",
        });
        return res.redirect(`${frontendUrl}/callback?${safeParams.toString()}`);
      }

      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Session creation failed without error.",
      );
    } catch (error) {
      console.error("OAuth Exchange Error:", error);
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to process OAuth token exchange.",
        error,
      );
    }
  },
);

/**
 * Sign up user registration
 */
const signUpUserReg = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.password)) {
      sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Email and password are required.",
      );
    }
    const { data, error } = await SUPABASE.auth.signUp({
      email: req.body.email,
      password: req.body.password,
    });

    if (error) {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to sign up user.",
        error,
      );
      return;
    }
    if (data) {
      sendR(res, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
      return;
    }
  },
);

/**
 * Sign up or sign in with Google using Supabase Third Party Sign In or Sign Up
 */
const signUpOrSignInWithGoogle = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GOOGLE);
  },
);

/**
 * Sign up user via GitHub using Supabase Third Party Sign In or Sign Up
 */
const signUpUserViaGitHub = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GITHUB);
  },
);

/**
 * Get current user information
 * Uses the new schema: users table
 */
const getCurrentUserInformation = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (req.query.customUser == "true") {
      let firstName: string | null | undefined =
        req.user?.user_metadata?.first_name;
      let lastName: string | null | undefined =
        req.user?.user_metadata?.last_name;
      let avatarUrl: string | null | undefined =
        req.user?.user_metadata?.avatar_url;

      if (req.user?.email) {
        const normalizedEmail = req.user.email.toLowerCase().trim();
        const { data: userData } = await SUPABASE.from("users")
          .select("first_name, last_name, avatar_url")
          .ilike("email", normalizedEmail)
          .limit(1)
          .maybeSingle();

        // Prefer data from users table if available
        if (userData) {
          firstName = userData.first_name ?? firstName;
          lastName = userData.last_name ?? lastName;
          avatarUrl = userData.avatar_url ?? avatarUrl;
        }
      }

      const customUser = {
        id: req.user?.id,
        email: req.user?.email,
        phone: req.user?.phone,
        first_name: firstName,
        last_name: lastName,
        avatar_url: avatarUrl,
        created_at: req.user?.created_at,
        updated_at: req.user?.updated_at,
      };
      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "User fetched successfully.",
        customUser,
      );
      return;
    } else {
      sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "User fetched successfully.",
        req.user,
      );
      return;
    }
  },
);

/**
 * Get user information by user ID
 * Uses the new schema: users table (with UUID id)
 */
const getUserInformationById = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const requestedId = req.params.id; // UUID string
    const currentUserEmail = req.user?.email;

    if (!currentUserEmail) {
      return sendR(
        res,
        STATUS_RESPONSE.UNAUTHORIZED,
        "Authentication required.",
      );
    }

    const { data, error } = await SUPABASE.from("users")
      .select(
        "id, email, first_name, last_name, avatar_url, status, timezone, created_at",
      )
      .eq("id", requestedId)
      .single();

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to find user.",
      );
    }
    if (!data) {
      return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User not found.");
    }

    // SECURITY: Verify the user is accessing their own data
    if (data.email?.toLowerCase() !== currentUserEmail.toLowerCase()) {
      return sendR(
        res,
        STATUS_RESPONSE.FORBIDDEN,
        "You can only access your own user information.",
      );
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", data);
  },
);

/**
 * Deactivate user calendar tokens by email
 * Uses the new schema: oauth_tokens table
 */
const deActivateUser = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email is required.");
    }

    // Find the user first
    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id")
      .ilike("email", email)
      .limit(1)
      .maybeSingle();

    if (userError || !user) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "User not found.",
        userError,
      );
    }

    // Deactivate their OAuth token
    const { error: updateError } = await SUPABASE.from("oauth_tokens")
      .update({ is_valid: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google");

    if (updateError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to deactivate user.",
        updateError,
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "User deactivated successfully.",
    );
  },
);

/**
 * Sign in user registration using Supabase Auth Sign In With Password
 */
const signInUserReg = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.password)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Email and password are required ",
      );
    }

    const { data, error } = await SUPABASE.auth.signInWithPassword({
      email: req.body.email,
      password: req.body.password,
    });

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch user by email.",
        error,
      );
    }

    // Set cookies for web browsers if session exists
    if (data.session) {
      setAuthCookies(
        res,
        data.session.access_token,
        data.session.refresh_token,
        data.user,
      );
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "User signin successfully.", data);
  },
);

/**
 * Verify email by OTP using Supabase Auth Verify OTP
 */
const verifyEmailByOtp = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.token)) {
      sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and token are required.");
    }

    const { data, error } = await SUPABASE.auth.verifyOtp({
      type: "email",
      email: req.body.email,
      token: req.body.token,
    });

    if (error) {
      sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to verify email.",
        error,
      );
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Email verified successfully.", data);
  },
);

const refreshToken = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data } = await SUPABASE.auth.refreshSession({
    refresh_token: req.body.refresh_token,
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Token refreshed successfully.", data);
});

/**
 * Logout user by clearing authentication cookies
 */
const logout = reqResAsyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Logged out successfully.");
});

/**
 * Check if user has a valid session
 */
const checkSession = reqResAsyncHandler(async (req: Request, res: Response) => {
  sendR(res, STATUS_RESPONSE.SUCCESS, "Session is valid.", {
    authenticated: true,
    userId: req.user?.id,
    email: req.user?.email,
  });
});

/**
 * Get Google Calendar integration status
 * Uses the new schema: users + oauth_tokens tables
 */
const getGoogleCalendarIntegrationStatus = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email;

    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user
    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id, created_at")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (userError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch user.",
        userError,
      );
    }

    if (!user) {
      // User doesn't exist yet
      const authUrl = generateGoogleAuthUrl({ forceConsent: true });
      return sendR(
        res,
        STATUS_RESPONSE.SUCCESS,
        "Google Calendar integration status fetched successfully.",
        {
          isSynced: false,
          isActive: false,
          isExpired: false,
          syncedAt: null,
          authUrl,
        },
      );
    }

    // Check OAuth token
    const { data: oauthToken, error: tokenError } = await SUPABASE.from(
      "oauth_tokens",
    )
      .select("is_valid, expires_at, refresh_token, created_at")
      .eq("user_id", user.id)
      .eq("provider", "google")
      .limit(1)
      .maybeSingle();

    if (tokenError) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to fetch integration status.",
        tokenError,
      );
    }

    const isSynced = !!oauthToken;
    const isActive = oauthToken?.is_valid ?? false;
    const hasRefreshToken = !!oauthToken?.refresh_token;
    const needsReauth = !isActive || !hasRefreshToken;

    const authUrl = generateGoogleAuthUrl({ forceConsent: needsReauth });

    // Check if token is expired
    let isExpired = false;
    if (oauthToken?.expires_at) {
      isExpired = Date.now() > new Date(oauthToken.expires_at).getTime();
    }

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Google Calendar integration status fetched successfully.",
      {
        isSynced,
        isActive,
        isExpired,
        syncedAt: oauthToken?.created_at ?? user.created_at ?? null,
        authUrl,
      },
    );
  },
);

/**
 * Disconnect Google Calendar integration
 * Uses the new schema: oauth_tokens table
 */
const disconnectGoogleCalendarIntegration = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const email = req.user?.email;

    if (!email) {
      return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user
    const { data: user, error: userError } = await SUPABASE.from("users")
      .select("id")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    if (userError || !user) {
      return sendR(
        res,
        STATUS_RESPONSE.NOT_FOUND,
        "User not found.",
        userError,
      );
    }

    // Mark OAuth token as invalid
    const { error } = await SUPABASE.from("oauth_tokens")
      .update({ is_valid: false, updated_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .eq("provider", "google");

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to disconnect Google Calendar.",
        error,
      );
    }

    sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Google Calendar disconnected successfully.",
      {
        isActive: false,
      },
    );
  },
);

export const userController = {
  verifyEmailByOtp,
  signUpUserReg,
  signUpOrSignInWithGoogle,
  signUpUserViaGitHub,
  signInUserReg,
  getUserInformationById,
  getCurrentUserInformation,
  deActivateUser,
  generateAuthGoogleUrl,
  refreshToken,
  logout,
  checkSession,
  getGoogleCalendarIntegrationStatus,
  disconnectGoogleCalendarIntegration,
};
