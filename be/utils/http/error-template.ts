import type { Response } from "express";
import { logger } from "../logger";

export type HttpError = Error & { cause: { status: number } };

/**
 * Create an HTTP error with status code
 *
 * @param {string} message - The error message.
 * @param {number} status - The HTTP status code.
 * @returns {HttpError} The error object with status in cause.
 */
export const createHttpError = (message: string, status: number): HttpError => {
  return new Error(message, { cause: { status } }) as HttpError;
};

/**
 * Send an error response to the client
 *
 * @param {Response} res - The Express response object.
 * @param {number} status - The HTTP status code.
 * @param {string} message - The error message.
 */
export const sendErrorResponse = (res: Response, status: number, message: string): void => {
  logger.info(`HTTP: sendErrorResponse called: res: ${res}`);
  logger.info(`HTTP: sendErrorResponse called: status: ${status}`);
  logger.info(`HTTP: sendErrorResponse called: message: ${message}`);
  res.status(status).json({
    status: "error",
    code: status,
    message,
  });
  logger.info(`HTTP: sendErrorResponse called: response sent`);
};

/**
 * Throw an HTTP error (convenience function)
 *
 * @param {string} message - The error message.
 * @param {number} status - The HTTP status code.
 * @throws {HttpError} Always throws an error with status in cause.
 */
export const throwHttpError = (message: string, status: number): never => {
  logger.info(`HTTP: throwHttpError called: message: ${message}`);
  logger.info(`HTTP: throwHttpError called: status: ${status}`);
  const error = createHttpError(message, status);
  logger.info(`HTTP: throwHttpError called: error: ${error}`);
  throw error;
};

/**
 * Error template - sends response if provided, then throws
 *
 * @param {string} message - The message of the error.
 * @param {number} status - The status of the error.
 * @param {Response} res - The response object (optional).
 * @throws {HttpError} Always throws after optionally sending response.
 * @deprecated Use createHttpError, sendErrorResponse, or throwHttpError for clearer intent.
 */
const errorTemplate = (message: string, status: number, res?: Response): never => {
  logger.info(`HTTP: errorTemplate called: message: ${message}`);
  logger.info(`HTTP: errorTemplate called: status: ${status}`);
  logger.info(`HTTP: errorTemplate called: res: ${res}`);
  if (res) {
    logger.info(`HTTP: errorTemplate called: res: ${res}`);
    logger.info(`HTTP: errorTemplate called: status: ${status}`);
    logger.info(`HTTP: errorTemplate called: message: ${message}`);
    sendErrorResponse(res, status, message);
    logger.info(`HTTP: errorTemplate called: response sent`);
  }
  const error = createHttpError(message, status);
  logger.info(`HTTP: errorTemplate called: error: ${error}`);
  throw error;
};

export default errorTemplate;
