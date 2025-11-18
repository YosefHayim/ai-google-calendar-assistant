import type { User } from "@supabase/supabase-js";
import type { NextFunction, Request, Response } from "express";
import { SUPABASE } from "@/config/root-config";
import { STATUS_RESPONSE } from "@/types";
import { asyncHandler } from "@/utils/asyncHandlers";
import sendResponseesponse from "@/utils/sendResponseesponse";

export const authHandler = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) {
    return sendResponse(res, STATUS_RESPONSE.UNAUTHORIZED, "Missing authorization headers: ", token);
  }

  const {
    data: { user },
  } = await SUPABASE.auth.getUser(token);

  if (!user) {
    return sendResponse(res, STATUS_RESPONSE.UNAUTHORIZED, "You are not logged in, please logged in or register.");
  }

  (req as Request & { user: User }).user = user;
  next();
});
