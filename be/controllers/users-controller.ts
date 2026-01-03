import { ACCESS_TOKEN_COOKIE, clearAuthCookies, setAuthCookies } from "@/utils/auth/cookie-utils";
import type { GoogleIdTokenPayloadProps, TokensProps } from "@/types";
import { OAUTH2CLIENT, PROVIDERS, REDIRECT_URI, SCOPES, SCOPES_STRING, STATUS_RESPONSE, SUPABASE, env } from "@/config";
import type { Request, Response } from "express";
import { generateGoogleAuthUrl, supabaseThirdPartySignInOrSignUp } from "@/utils/auth";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import jwt from "jsonwebtoken";
import { validateSupabaseToken } from "@/utils/auth/supabase-token";

const ACCESS_TOKEN_HEADER = "access_token";
const REFRESH_TOKEN_HEADER = "refresh_token";
const USER_KEY = "user";

/**
 * Generate Google Auth URL and Handle Callback
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Generates a Google Auth URL or handles the OAuth2 callback to exchange code for tokens.
 * Now uses UPSERT to safely handle both new and returning users.
 */
const generateAuthGoogleUrl = reqResAsyncHandler(async (req: Request, res: Response) => {
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
        console.log("[OAuth Callback] Could not validate token from cookie:", error);
      }
    }
  }

  if (userEmail) {
    const normalizedEmail = userEmail.toLowerCase().trim();
    const { data: existingTokens } = await SUPABASE.from("user_calendar_tokens")
      .select("refresh_token, is_active")
      .ilike("email", normalizedEmail)
      .limit(1)
      .maybeSingle();

    // Only force consent if user doesn't have a valid refresh token
    // This allows silent refresh for returning users
    forceConsent = !existingTokens?.refresh_token || !existingTokens?.is_active;
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

    // Decode ID token to get user info (email is critical)
    const user = jwt.decode(tokens.id_token!) as GoogleIdTokenPayloadProps;

    if (!user || !user.email) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Failed to decode user profile from Google token.");
    }

    // Normalize email to lowercase for consistent storage and lookup
    const normalizedEmail = user.email.toLowerCase().trim();
    // --- PREPARE DB PAYLOAD ---
    // We construct the payload dynamically to avoid overwriting the refresh_token with null
    // Helper to convert null to undefined for optional fields
    const toUndefined = <T>(value: T | null | undefined): T | undefined => (value === null ? undefined : value);

    const upsertPayload: {
      email: string;
      access_token?: string;
      token_type?: string;
      id_token?: string;
      scope?: string;
      expiry_date?: number;
      is_active: boolean;
      first_name?: string | null;
      last_name?: string | null;
      avatar_url?: string | null;
      refresh_token?: string;
    } = {
      email: normalizedEmail, // Unique key for UPSERT (normalized for consistent lookup)
      access_token: toUndefined(tokens.access_token),
      token_type: toUndefined(tokens.token_type),
      id_token: toUndefined(tokens.id_token),
      scope: toUndefined(tokens.scope),
      expiry_date: toUndefined(tokens.expiry_date),
      is_active: true,
      first_name: user.given_name ?? undefined,
      last_name: user.family_name ?? undefined,
      avatar_url: user.picture ?? undefined,
    };

    // CRITICAL FIX: Only update refresh_token if Google sent a new one.
    // Google often omits the refresh_token on re-authentication. If we save 'undefined' or empty string, we lose access.
    // DO NOT set refresh_token to empty string - it will overwrite existing valid refresh tokens!
    if (tokens.refresh_token) {
      upsertPayload.refresh_token = tokens.refresh_token;
    }

    // --- DATABASE UPDATE ---
    // Use upsert() instead of update().
    // - If user exists: Updates the fields provided (keeping old refresh_token if we didn't provide a new one).
    // - If user missing: Creates the row (Insert).
    console.log(`[OAuth Callback] Upserting tokens for email: ${normalizedEmail}`);
    console.log(`[OAuth Callback] Refresh token received: ${tokens.refresh_token ? "YES" : "NO"}`);

    const { data, error } = await SUPABASE.from("user_calendar_tokens").upsert(upsertPayload, { onConflict: "email" }).select().single();

    if (error) {
      console.error("Supabase Token Save Error:", error);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store Google tokens in database.", error);
    }

    console.log(`[OAuth Callback] Upsert successful. Stored refresh_token: ${data?.refresh_token ? "YES" : "NO"}`);
    console.log(`[OAuth Callback] is_active: ${data?.is_active}`);

    // --- SUPABASE AUTH SIGN IN (Optional / As per your flow) ---
    // This logs the user into Supabase Auth using the Google ID token
    const { data: signInData, error: signInError } = await SUPABASE.auth.signInWithIdToken({
      provider: PROVIDERS.GOOGLE,
      token: tokens.id_token!,
      access_token: tokens.access_token!,
    });

    if (signInError) {
      console.error("Supabase Auth Error:", signInError);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign in user via Supabase Auth.", signInError);
    }

    // Set Cookies for the Client
    if (signInData && signInData.session) {
      setAuthCookies(res, signInData.session.access_token, signInData.session.refresh_token, signInData.user);

      // Redirect back to frontend
      const frontendUrl = env.urls.frontend;
      return res.redirect(
        `${frontendUrl}/callback?access_token=${signInData.session.access_token}&refresh_token=${signInData.session.refresh_token}&first_name=${user.given_name}&last_name=${user.family_name}&email=${user.email}`
      );
    }

    // Fallback if no session created (shouldn't happen if signInError didn't fire)
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Session creation failed without error.");
  } catch (error) {
    console.error("OAuth Exchange Error:", error);
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
  }
});

/**
 * Sign up user registration
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Signs up a user and sends the response.
 * @example
 * const data = await signUpUserReg(req, res);
 * console.log(data);
 */
const signUpUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required.");
  }
  const { data, error } = await SUPABASE.auth.signUp({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
    return;
  }
  if (data) {
    sendR(res, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
    return;
  }
});

/**
 * Sign up or sign in with Google using Supabase Third Party Sign In or Sign Up
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Signs up or signs in a user with Google and sends the response.
 * @example
 * const data = await signUpOrSignInWithGoogle(req, res);
 * console.log(data);
 */
const signUpOrSignInWithGoogle = reqResAsyncHandler(async (_req: Request, res: Response) => {
  await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GOOGLE);
});

/**
 * Sign up user via GitHub using Supabase Third Party Sign In or Sign Up
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Signs up a user with GitHub and sends the response.
 * @example
 * const data = await signUpUserViaGitHub(req, res);
 * console.log(data);
 */
const signUpUserViaGitHub = reqResAsyncHandler(async (_req: Request, res: Response) => {
  await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GITHUB);
});

/**
 * Get current user information
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets current user information and sends the response.
 * @example
 * const data = await getCurrentUserInformation(req, res);
 * console.log(data);
 */
const getCurrentUserInformation = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (req.query.customUser == "true") {
    // Try to get first_name, last_name, avatar_url from user_calendar_tokens table first
    // Fall back to user_metadata if not found in tokens table
    let firstName: string | null | undefined = req.user?.user_metadata?.first_name;
    let lastName: string | null | undefined = req.user?.user_metadata?.last_name;
    let avatarUrl: string | null | undefined = req.user?.user_metadata?.avatar_url;

    if (req.user?.email) {
      const normalizedEmail = req.user.email.toLowerCase().trim();
      const { data: tokenData } = await SUPABASE.from("user_calendar_tokens")
        .select("first_name, last_name, avatar_url")
        .ilike("email", normalizedEmail)
        .limit(1)
        .maybeSingle();

      // Prefer data from user_calendar_tokens if available (more up-to-date from OAuth callback)
      if (tokenData) {
        firstName = tokenData.first_name || firstName;
        lastName = tokenData.last_name || lastName;
        avatarUrl = tokenData.avatar_url || avatarUrl;
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
    sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", customUser);
    return;
  } else {
    sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", req.user);
    return;
  }
});

/**
 * Get user information by user ID
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Gets user information and sends the response.
 * @example
 * const data = await getUserInformationById(req, res);
 * console.log(data);
 */
const getUserInformationById = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens").select("*").eq("id", parseInt(req.params.id)).single();
  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to find user.", error);
  }
  if (!data) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User calendar tokens not found.");
  }
  sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", data);
});

/**
 * Deactivate user calendar tokens by email
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Deactivates a user calendar tokens by email and sends the response.
 * @example
 * const data = await deActivateUser(req, res);
 * console.log(data);
 */
const deActivateUser = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data, error } = await SUPABASE.from("user_calendar_tokens").select("email").eq("email", req.body.email);
  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to find user.", error);
  }
  if (data && data.length > 0) {
    const { error: updateError } = await SUPABASE.from("user_calendar_tokens").update({ is_active: false }).eq("email", req.body.email);
    if (updateError) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to deactivate user.", updateError);
    }
    return sendR(res, STATUS_RESPONSE.SUCCESS, "User deactivated successfully.");
  }
});

/**
 * Sign in user registration using Supabase Auth Sign In With Password
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Signs in a user and sends the response.
 * @example
 * const data = await signInUserReg(req, res);
 * console.log(data);
 */
const signInUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.password)) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required ");
  }

  const { data, error } = await SUPABASE.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
  }

  // Set cookies for web browsers if session exists
  if (data.session) {
    setAuthCookies(res, data.session.access_token, data.session.refresh_token, data.user);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "User signin successfully.", data);
});

/**
 * Verify email by OTP using Supabase Auth Verify OTP
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Verifies an email by OTP and sends the response.
 * @example
 * const data = await verifyEmailByOtp(req, res);
 * console.log(data);
 */
const verifyEmailByOtp = reqResAsyncHandler(async (req: Request, res: Response) => {
  if (!(req.body.email && req.body.token)) {
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and token are required.");
  }

  const { data, error } = await SUPABASE.auth.verifyOtp({
    type: "email",
    email: req.body.email,
    token: req.body.token,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to verify email.", error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Email verified successfully.", data);
});

const refreshToken = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data } = await SUPABASE.auth.refreshSession({ refresh_token: req.body.refresh_token });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Token refreshed successfully.", data);
});

/**
 * Logout user by clearing authentication cookies
 *
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Clears all authentication cookies and logs out the user.
 */
const logout = reqResAsyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Logged out successfully.");
});

/**
 * Check if user has a valid session
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Returns minimal session info if user is authenticated.
 * Used by frontend to check if user can skip login and go to dashboard.
 */
const checkSession = reqResAsyncHandler(async (req: Request, res: Response) => {
  // If we reach here, supabaseAuth middleware already validated the session
  sendR(res, STATUS_RESPONSE.SUCCESS, "Session is valid.", {
    authenticated: true,
    userId: req.user?.id,
    email: req.user?.email,
  });
});

/**
 * Get Google Calendar integration status
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Returns Google Calendar sync status, active status, and reauth URL.
 */
const getGoogleCalendarIntegrationStatus = reqResAsyncHandler(async (req: Request, res: Response) => {
  const email = req.user?.email;

  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.");
  }

  const { data, error } = await SUPABASE.from("user_calendar_tokens")
    .select("is_active, expiry_date, created_at, refresh_token")
    .ilike("email", email.trim())
    .limit(1)
    .maybeSingle();

  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch integration status.", error);
  }

  const isSynced = !!data;
  const isActive = data?.is_active ?? false;

  // Check if refresh token exists - if not, force consent screen
  const hasRefreshToken = !!(data && "refresh_token" in data && data.refresh_token);
  const needsReauth = !isActive || !hasRefreshToken;

  // Generate auth URL - only force consent if refresh token is missing or tokens are inactive
  const authUrl = generateGoogleAuthUrl({ forceConsent: needsReauth });

  // Check if token is expired
  let isExpired = false;
  if (data?.expiry_date) {
    isExpired = Date.now() > data.expiry_date;
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Google Calendar integration status fetched successfully.", {
    isSynced,
    isActive,
    isExpired,
    syncedAt: data?.created_at ?? null,
    authUrl,
  });
});

/**
 * Disconnect Google Calendar integration
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Sets is_active to false for the user's Google Calendar integration.
 */
const disconnectGoogleCalendarIntegration = reqResAsyncHandler(async (req: Request, res: Response) => {
  const email = req.user?.email;

  if (!email) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User email not found.");
  }

  const { error } = await SUPABASE.from("user_calendar_tokens").update({ is_active: false }).ilike("email", email.trim());

  if (error) {
    return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to disconnect Google Calendar.", error);
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Google Calendar disconnected successfully.", {
    isActive: false,
  });
});

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
