import type { Request, Response } from "express";
import { PROVIDERS, STATUS_RESPONSE, SUPABASE } from "@/config";
import { supabaseThirdPartySignInOrSignUp } from "@/utils/auth";
import {
  ACCESS_TOKEN_COOKIE,
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
  setAuthCookies,
} from "@/utils/auth/cookie-utils";
import { reqResAsyncHandler, sendR } from "@/utils/http";

const signUpUserReg = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.password)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Email and password are required."
      );
    }

    const { data, error } = await SUPABASE.auth.signUp({
      email: req.body.email,
      password: req.body.password,
    });

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to sign up user.",
        error
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "User signed up successfully.",
      data
    );
  }
);

const signUpOrSignInWithGoogle = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GOOGLE);
  }
);

const signUpUserViaGitHub = reqResAsyncHandler(
  async (_req: Request, res: Response) => {
    await supabaseThirdPartySignInOrSignUp(res, PROVIDERS.GITHUB);
  }
);

const signInUserReg = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.password)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Email and password are required."
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
        error
      );
    }

    if (data.session) {
      setAuthCookies(
        res,
        data.session.access_token,
        data.session.refresh_token,
        data.user
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "User signin successfully.",
      data
    );
  }
);

const verifyEmailByOtp = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    if (!(req.body.email && req.body.token)) {
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Email and token are required."
      );
    }

    const { data, error } = await SUPABASE.auth.verifyOtp({
      type: "email",
      email: req.body.email,
      token: req.body.token,
    });

    if (error) {
      return sendR(
        res,
        STATUS_RESPONSE.INTERNAL_SERVER_ERROR,
        "Failed to verify email.",
        error
      );
    }

    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Email verified successfully.",
      data
    );
  }
);

const refreshToken = reqResAsyncHandler(async (req: Request, res: Response) => {
  const { data } = await SUPABASE.auth.refreshSession({
    refresh_token: req.body.refresh_token,
  });

  return sendR(
    res,
    STATUS_RESPONSE.SUCCESS,
    "Token refreshed successfully.",
    data
  );
});

const logout = reqResAsyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookies(res);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Logged out successfully.");
});

const checkSession = reqResAsyncHandler(async (req: Request, res: Response) =>
  sendR(res, STATUS_RESPONSE.SUCCESS, "Session is valid.", {
    authenticated: true,
    userId: req.user?.id,
    email: req.user?.email,
  })
);

const restoreSession = reqResAsyncHandler(
  async (req: Request, res: Response) => {
    const refreshedAccess = res.getHeader("access_token") as string | undefined;
    const refreshedRefresh = res.getHeader("refresh_token") as
      | string
      | undefined;

    const accessTokenValue =
      refreshedAccess || req.cookies?.[ACCESS_TOKEN_COOKIE];
    const refreshTokenValue =
      refreshedRefresh || req.cookies?.[REFRESH_TOKEN_COOKIE];

    sendR(res, STATUS_RESPONSE.SUCCESS, "Session restored.", {
      authenticated: true,
      user: req.user,
      access_token: accessTokenValue,
      refresh_token: refreshTokenValue,
    });
  }
);

export const authController = {
  signUpUserReg,
  signUpOrSignInWithGoogle,
  signUpUserViaGitHub,
  signInUserReg,
  verifyEmailByOtp,
  refreshToken,
  logout,
  checkSession,
  restoreSession,
};
