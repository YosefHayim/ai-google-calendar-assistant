import type { User } from "@supabase/supabase-js";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CONFIG, OAUTH2CLIENT, redirectUri, SCOPES, SUPABASE } from "@/config/root-config";
import { type GoogleIdTokenPayloadProps, PROVIDERS, STATUS_RESPONSE, type TokensProps } from "@/types";
import { reqResAsyncHandler } from "@/utils/async-handlers";
import sendR from "@/utils/send-response";
import { thirdPartySignInOrSignUp } from "@/utils/third-party-signup-signin-supabase";

const generateAuthGoogleUrl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const postmanHeaders = req.headers["user-agent"] || "";

  const url = OAUTH2CLIENT.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
    include_granted_scopes: true,
    redirect_uri: redirectUri,
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
    // Validate credentials are present
    if (!CONFIG.clientId || !CONFIG.clientSecret) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "OAuth credentials are missing. Please check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.",
        { clientId: !!CONFIG.clientId, clientSecret: !!CONFIG.clientSecret }
      );
    }

    // Log for debugging (without exposing secrets)
    console.log("Exchanging OAuth code for tokens:", {
      hasCode: !!code,
      codeLength: code?.length,
      redirectUri,
      clientId: CONFIG.clientId?.substring(0, 20) + "...",
      hasClientSecret: !!CONFIG.clientSecret,
    });

    // Explicitly pass redirect_uri to ensure it matches the authorization request
    const { tokens } = await OAUTH2CLIENT.getToken({
      code,
      redirect_uri: redirectUri,
    });

    const { id_token, refresh_token, refresh_token_expires_in, expiry_date, access_token, token_type, scope } = tokens as TokensProps;

    const user = jwt.decode(id_token || "") as GoogleIdTokenPayloadProps;

    if (!user.email) {
      return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "User email not found in OAuth token.");
    }

    // Get or create Supabase auth user
    let authUserId: string;
    const { data: existingAuthUser } = await SUPABASE.auth.admin.getUserById(user.sub);
    if (existingAuthUser?.user) {
      authUserId = existingAuthUser.user.id;
      // Update existing user metadata
      await SUPABASE.auth.admin.updateUserById(existingAuthUser.user.id, {
        user_metadata: {
          name: user.name,
          picture: user.picture,
          provider: "google",
        },
      });
    } else {
      // Create new Supabase auth user
      const { data: newAuthUserData, error: signUpError } = await SUPABASE.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          name: user.name,
          picture: user.picture,
          provider: "google",
        },
      });

      if (signUpError || !newAuthUserData?.user) {
        console.error("Failed to create Supabase auth user:", signUpError);
        return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to create auth user.", signUpError);
      }

      authUserId = newAuthUserData.user.id;
    }

    // Check if token record exists for this user_id
    const { data: existingToken, error: tokenQueryError } = await SUPABASE.from("user_calendar_tokens")
      .select("id, user_id")
      .eq("user_id", authUserId)
      .maybeSingle();

    if (tokenQueryError) {
      console.error("Error querying token record:", tokenQueryError);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to query token record.", tokenQueryError);
    }

    const now = new Date().toISOString();
    const tokenData = {
      user_id: authUserId,
      refresh_token_expires_in,
      refresh_token,
      expiry_date,
      access_token,
      token_type,
      id_token,
      scope,
      is_active: true,
      email: user.email.trim().toLowerCase(),
      updated_at: now,
      ...(existingToken ? {} : { created_at: now }), // Only set created_at on insert
    };

    let data;
    let error;

    if (existingToken) {
      // Update existing record
      const result = await SUPABASE.from("user_calendar_tokens").update(tokenData).eq("user_id", authUserId).select().single();
      data = result.data;
      error = result.error;
    } else {
      // Insert new record
      const result = await SUPABASE.from("user_calendar_tokens").insert(tokenData).select().single();
      data = result.data;
      error = result.error;
    }

    if (error) {
      console.error("Error upserting tokens:", error);
      return sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    const source = req.query.source as string | undefined;

    sendR(res, STATUS_RESPONSE.SUCCESS, "Tokens has been updated successfully.", {
      data,
      ...(source === "frontend" && { userEmail: user.email }),
    });
  } catch (error) {
    // Log detailed error for debugging
    console.error("OAuth token exchange error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error instanceof Error && "response" in error ? (error as { response?: { data?: unknown } }).response?.data : undefined;
    console.error("Error details:", errorDetails);

    // Provide more helpful error message for invalid_client
    if (errorDetails && typeof errorDetails === "object" && "error" in errorDetails && errorDetails.error === "invalid_client") {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Invalid OAuth client credentials. Please verify GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file match the credentials in Google Cloud Console. The client secret may have been regenerated.",
        errorDetails
      );
    }

    sendR(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, `Failed to process OAuth token exchange: ${errorMessage}`, error);
  }
});

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

const signUpOrSignInWithGoogle = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GOOGLE);
});

const signUpUserViaGitHub = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GITHUB);
});

const getUserInformation = (req: Request, res: Response) => {
  if (!(req as Request & { user?: User }).user) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
  }
  sendR(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", (req as Request & { user?: User }).user);
};

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

const verifyEmailByOpt = reqResAsyncHandler(async (req: Request, res: Response) => {
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

export const userController = {
  verifyEmailByOpt,
  signUpUserReg,
  signUpOrSignInWithGoogle,
  signUpUserViaGitHub,
  signInUserReg,
  getUserInformation,
  deActivateUser,
  generateAuthGoogleUrl,
};
