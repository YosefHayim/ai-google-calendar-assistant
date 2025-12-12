import type { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/types";
import { SUPABASE } from "@/config/root-config";
import type { User } from "@supabase/supabase-js";
import { asyncHandler } from "@/utils/async-handlers";
import sendR from "@/utils/send-response";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  // Try to get token from Authorization header first (Bearer token)
  let token = req.headers.authorization?.replace("Bearer ", "");

  // If no Bearer token, try to get from cookie (Supabase cookie-based auth)
  if (!token) {
    token = req.cookies?.["sb-access-token"];
  }

  if (!token) {
    return sendR(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      "Missing authorization token. Please provide Bearer token in Authorization header or sb-access-token cookie."
    );
  }

  const {
    data: { user },
  } = await SUPABASE.auth.getUser(token);

  if (!user) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "You are not logged in, please logged in or register.");
  }

  (req as Request & { user: User }).user = user;
  next();
});
