import type { NextFunction, Request, Response } from "express";
import { STATUS_RESPONSE, SUPABASE } from "@/config";
import { asyncHandler, sendR } from "@/utils/http";

import type { User } from "@supabase/supabase-js";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return sendR(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization headers: ", token);
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
