import type { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/types";
import sendResponse from "@/utils/sendResponse";

const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as Error & { status?: number }).status || STATUS_RESPONSE.INTERNAL_SERVER_ERROR;
  sendResponse(res, status, err.message || "Internal Server Error");
};

export default errorHandler;
