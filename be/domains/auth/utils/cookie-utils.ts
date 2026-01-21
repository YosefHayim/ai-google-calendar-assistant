import type { CookieOptions, Response } from "express"

import { env } from "@/config/env"

export const ACCESS_TOKEN_COOKIE = "access_token"
export const REFRESH_TOKEN_COOKIE = "refresh_token"
export const USER_COOKIE = "user"

const BASE_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === "production",
  sameSite: "lax",
  path: "/",
}

/**
 * Set authentication cookies on response
 *
 * @param res - Express response object
 * @param accessToken - Supabase access token
 * @param refreshToken - Supabase refresh token
 * @param user - Optional user object to store in cookie
 */
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  user?: object
) => {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 1000, // 1 hour for access token
  })
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...BASE_COOKIE_OPTIONS,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days for refresh token
  })
  if (user) {
    res.cookie(USER_COOKIE, JSON.stringify(user), {
      ...BASE_COOKIE_OPTIONS,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
  }
}

/**
 * Clear all authentication cookies
 *
 * @param res - Express response object
 */
export const clearAuthCookies = (res: Response) => {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: "/" })
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" })
  res.clearCookie(USER_COOKIE, { path: "/" })
}
