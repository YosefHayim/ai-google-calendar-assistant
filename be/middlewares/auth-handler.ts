import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import { asyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";

/**
 * Authenticate user by token using Supabase Auth Get User
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} next - The next function.
 * @returns {Promise<void>} The response object.
 * @description Authenticates a user by token and sends the response.
 * @example
 * const data = await authHandler(req, res, next);
 * console.log(data);
 */
export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization headers: ", token);
  }

  const { data } = await SUPABASE.auth.getUser(token);

  if (!data?.user) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Not authorized. Please login or register to continue.");
  }

  (req as Request & { user: User }).user = data.user;
  next();
});
