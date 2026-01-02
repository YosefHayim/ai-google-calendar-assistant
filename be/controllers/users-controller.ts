import type { GoogleIdTokenPayloadProps, TokensProps } from "@/types";
import { OAUTH2CLIENT, PROVIDERS, REDIRECT_URI, SCOPES, SCOPES_STRING, STATUS_RESPONSE, SUPABASE } from "@/config";
import type { Request, Response } from "express";
import { generateGoogleAuthUrl, supabaseThirdPartySignInOrSignUp } from "@/utils/auth";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import jwt from "jsonwebtoken";

const ACCESS_TOKEN_HEADER = "allyAccessToken";
const REFRESH_TOKEN_HEADER = "allyRefreshToken";
const USER_KEY = "allyUser";

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

  // Generate the auth URL
  const url = generateGoogleAuthUrl();

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

    // --- PREPARE DB PAYLOAD ---
    // We construct the payload dynamically to avoid overwriting the refresh_token with null
    const upsertPayload: any = {
      email: user.email, // Unique key for UPSERT
      access_token: tokens.access_token,
      token_type: tokens.token_type,
      id_token: tokens.id_token,
      scope: tokens.scope,
      expiry_date: tokens.expiry_date,
      is_active: true,
      updated_at: new Date().toISOString(),
      // We do not set created_at here; let the DB handle it or it stays as is on update
    };

    // CRITICAL FIX: Only update refresh_token if Google sent a new one.
    // Google often omits the refresh_token on re-authentication. If we save 'undefined', we lose access.
    if (tokens.refresh_token) {
      upsertPayload.refresh_token = tokens.refresh_token;
    }

    // --- DATABASE UPDATE ---
    // Use upsert() instead of update().
    // - If user exists: Updates the fields provided (keeping old refresh_token if we didn't provide a new one).
    // - If user missing: Creates the row (Insert).
    const { data, error } = await SUPABASE.from("user_calendar_tokens").upsert(upsertPayload, { onConflict: "email" }).select().single();

    if (error) {
      console.error("Supabase Token Save Error:", error);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store Google tokens in database.", error);
    }

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
      const cookieOptions = {
        httpOnly: true,
        secure: true, // Ensure this is true in production (HTTPS)
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 Days
        sameSite: "strict" as const,
      };

      res.cookie(ACCESS_TOKEN_HEADER, signInData.session.access_token, cookieOptions);
      res.cookie(REFRESH_TOKEN_HEADER, signInData.session.refresh_token, cookieOptions);
      res.cookie(USER_KEY, JSON.stringify(signInData.user), cookieOptions);

      // Redirect back to frontend
      return res.redirect(
        `http://localhost:4000/callback?access_token=${signInData.session.access_token}&refresh_token=${signInData.session.refresh_token}&first_name=${user.given_name}&last_name=${user.family_name}&email=${user.email}`
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
    const customUser = {
      id: req.user?.id,
      email: req.user?.email,
      phone: req.user?.phone,
      first_name: req.user?.user_metadata.first_name,
      last_name: req.user?.user_metadata.last_name,
      avatar_url: req.user?.user_metadata.avatar_url,
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
    sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Email and password are required ");
  }

  const { data, error } = await SUPABASE.auth.signInWithPassword({
    email: req.body.email,
    password: req.body.password,
  });

  if (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
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
};
