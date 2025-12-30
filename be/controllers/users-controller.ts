import type { GoogleIdTokenPayloadProps, TokensProps } from "@/types";
import { OAUTH2CLIENT, PROVIDERS, REDIRECT_URI, SCOPES, STATUS_RESPONSE, SUPABASE, env } from "@/config";
import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";
import { supabaseThirdPartySignInOrSignUp } from "@/utils/auth";

/**
 * Generate Google Auth URL
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 * @description Generates a Google Auth URL and sends it to the user.
 * @example
 * const url = await generateAuthGoogleUrl(req, res);
 * console.log(url);
 */
const generateAuthGoogleUrl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const postmanHeaders = req.headers["user-agent"];

  const url = OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: REDIRECT_URI,
  });

  // 1. No code yet: send user to consent screen
  if (!code) {
    // If from Postman, just send the URL back instead of redirecting
    if (postmanHeaders?.includes("Postman")) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, url);
    }
    return res.redirect(url);
  }

  try {
    const { tokens } = await OAUTH2CLIENT.getToken(code);

    const { id_token, refresh_token, refresh_token_expires_in, expiry_date, access_token, token_type, scope } = tokens as TokensProps;

    const user = jwt.decode(id_token!) as GoogleIdTokenPayloadProps;

    const { data, error } = await SUPABASE.from("user_calendar_tokens")
      .update({
        refresh_token_expires_in,
        refresh_token,
        expiry_date,
        access_token,
        token_type,
        id_token,
        scope,
        is_active: true,
        email: user.email!,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("email", user.email!)
      .select();

    if (error) {
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    sendR(res, STATUS_RESPONSE.SUCCESS, "Tokens has been updated successfully.", {
      data,
    });
  } catch (error) {
    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
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
const signUpOrSignInWithGoogle = reqResAsyncHandler(async (req: Request, res: Response) => {
  await supabaseThirdPartySignInOrSignUp(req, res, PROVIDERS.GOOGLE);
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
const signUpUserViaGitHub = reqResAsyncHandler(async (req: Request, res: Response) => {
  await supabaseThirdPartySignInOrSignUp(req, res, PROVIDERS.GITHUB);
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
