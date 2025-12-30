import type { NextFunction, Request, Response } from "express";
import { sendErrorResponse } from "@/utils/http";
import type { HttpError } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";

/**
 * Extract HTTP status from error
 *
 * @param {Error} err - The error object.
 * @returns {number} The HTTP status code.
 */
const getErrorStatus = (err: Error): number => {
  const errWithStatus = err as Error & { status?: number };
  const errWithCause = err as HttpError;
  return errWithStatus.status || errWithCause.cause?.status || STATUS_RESPONSE.INTERNAL_SERVER_ERROR;
};

/**
 * Error handler middleware
 *
 * @param {Error} err - The error object.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} _next - The next function.
 * @description Handles errors and sends the error response to the client.
 */
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = getErrorStatus(err);
  const message = err.message || "Internal Server Error";
  sendErrorResponse(res, status, message);
};

export default errorHandler;
