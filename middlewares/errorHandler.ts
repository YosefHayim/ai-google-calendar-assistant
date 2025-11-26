import type { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/types";
import sendResponse from "@/utils/sendResponse";
import { TokenValidationError } from "@/utils/auth/TokenValidationError";

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Handle token validation errors with appropriate status
  if (err instanceof TokenValidationError) {
    return sendResponse(
      res,
      STATUS_RESPONSE.UNAUTHORIZED,
      err.message + " Please re-authenticate with Google."
    );
  }

  const status = (err as Error & { status?: number }).status || STATUS_RESPONSE.INTERNAL_SERVER_ERROR;
  sendResponse(res, status, err.message || "Internal Server Error");
};

export default errorHandler;
