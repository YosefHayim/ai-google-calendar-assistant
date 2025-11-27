import type { User } from "@supabase/supabase-js";
import type { Request, Response } from "express";
import { SUPABASE } from "@/config/root-config";
import { PROVIDERS, STATUS_RESPONSE } from "@/types";
import { reqResAsyncHandler } from "@/utils/asyncHandlers";
import { thirdPartySignInOrSignUp } from "@/utils/thirdPartyAuth";
import { generateGoogleAuthUrl, handleInitialAuthRequest } from "@/utils/auth/generateAuthUrl";
import { exchangeOAuthCode } from "@/utils/auth/exchangeOAuthToken";
import { storeUserTokens } from "@/utils/auth/storeUserTokens";
import { validateEmailPassword, validateEmailToken, validateEmail } from "@/utils/auth/validateAuthInput";
import { findUserByEmail, deactivateUserByEmail } from "@/utils/auth/userOperations";
import { ConversationMemoryService } from "@/services/ConversationMemoryService";
import sendResponse from "@/utils/sendResponse";

const generateAuthGoogleUrl = reqResAsyncHandler(async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;
  const url = generateGoogleAuthUrl();

  if (!code) {
    return handleInitialAuthRequest(req, res, url);
  }

  try {
    const { tokens, user } = await exchangeOAuthCode(code);
    const { data, error } = await storeUserTokens(user.email, tokens);

    if (error) {
      return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to store new tokens.", error);
    }

    sendResponse(res, STATUS_RESPONSE.SUCCESS, "Tokens has been updated successfully.", { data });
  } catch (error) {
    sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to process OAuth token exchange.", error);
  }
});

const signUpUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { email, password } = validateEmailPassword(req);

  const { data, error } = await SUPABASE.auth.signUp({ email, password });

  if (error) {
    return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to sign up user.", error);
  }

  sendResponse(res, STATUS_RESPONSE.SUCCESS, "User signed up successfully.", data);
});

const signUpOrSignInWithGoogle = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GOOGLE);
});

const signUpUserViaGitHub = reqResAsyncHandler(async (req: Request, res: Response) => {
  await thirdPartySignInOrSignUp(req, res, PROVIDERS.GITHUB);
});

const getUserInformation = (req: Request, res: Response) => {
  if (!(req as Request & { user?: User }).user) {
    return sendResponse(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
  }
  sendResponse(res, STATUS_RESPONSE.SUCCESS, "User fetched successfully.", (req as Request & { user?: User }).user);
};

const deActivateUser = reqResAsyncHandler(async (req: Request, res: Response) => {
  const email = validateEmail(req);

  const { data, error } = await findUserByEmail(email);
  if (error) {
    return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to find user.", error);
  }

  if (data && data.length > 0) {
    const { error: updateError } = await deactivateUserByEmail(email);
    if (updateError) {
      return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to deactivate user.", updateError);
    }
    return sendResponse(res, STATUS_RESPONSE.SUCCESS, "User deactivated successfully.");
  }
});

const signInUserReg = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { email, password } = validateEmailPassword(req);

  const { data, error } = await SUPABASE.auth.signInWithPassword({ email, password });

  if (error) {
    return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to fetch user by email.", error);
  }

  sendResponse(res, STATUS_RESPONSE.SUCCESS, "User signin successfully.", data);
});

const verifyEmailByOpt = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { email, token } = validateEmailToken(req);

  const { data, error } = await SUPABASE.auth.verifyOtp({
    type: "email",
    email,
    token,
  });

  if (error) {
    return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to verify email.", error);
  }

  sendResponse(res, STATUS_RESPONSE.SUCCESS, "Email verified successfully.", data);
});

const getAgentName = reqResAsyncHandler(async (req: Request, res: Response) => {
  const user = (req as Request & { user: User }).user;
  if (!user || !user.email) {
    return sendResponse(res, STATUS_RESPONSE.UNAUTHORIZED, "User not authenticated.");
  }

  // Get user_id from email
  const { data: tokenData, error: tokenError } = await SUPABASE.from("user_calendar_tokens").select("user_id").eq("email", user.email).maybeSingle();

  if (tokenError || !tokenData?.user_id) {
    return sendResponse(res, STATUS_RESPONSE.NOT_FOUND, "User not found.");
  }

  // Use chatId 0 for web users (default)
  const chatId = 0;
  const conversationMemoryService = new ConversationMemoryService(SUPABASE);

  try {
    const agentName = await conversationMemoryService.getAgentName(tokenData.user_id, chatId);
    return sendResponse(res, STATUS_RESPONSE.SUCCESS, "Agent name retrieved successfully.", {
      agent_name: agentName || null,
    });
  } catch (error) {
    return sendResponse(res, STATUS_RESPONSE.INTERNAL_SERVER_ERROR, "Failed to retrieve agent name.", error);
  }
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
  getAgentName,
};
