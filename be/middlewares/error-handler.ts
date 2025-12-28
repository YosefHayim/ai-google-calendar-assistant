import type { NextFunction, Request, Response } from "express";
import { errorTemplate, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";

/**
 * Error handler middleware using custom error template
 *
 * @param {Error} err - The error object.
 * @param {Request} _req - The request object.
 * @param {Response} res - The response object.
 * @param {NextFunction} _next - The next function.
 * @returns {void} The response object.
 * @description Handles errors and sends the response using custom error template.
 * @example
 * const data = await errorHandler(err, _req, res, _next);
 * console.log(data);
 */
const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = (err as Error & { status?: number }).status || STATUS_RESPONSE.INTERNAL_SERVER_ERROR;
  errorTemplate(err.message || "Internal Server Error", status, res);
};

export default errorHandler;
