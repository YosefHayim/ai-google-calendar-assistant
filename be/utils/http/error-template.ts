import type { Response } from "express";

/**
 * Error template
 *
 * @param {string} message - The message of the error.
 * @param {number} status - The status of the error.
 * @param {Response} res - The response object.
 * @returns {void} The response object.
 * @description Throws an error with a cause and sends the response.
 * @example
 * const data = await errorTemplate(message, status, res);
 * console.log(data);
 */
const errorTemplate = (message: string, status: number, res?: Response): void => {
  const error = new Error(message, { cause: { status } });

  if (res) {
    res?.status(status).json({
      status: "error",
      code: status,
      message: error.message,
    });
  }

  throw new Error(message, { cause: { status } });
};

export default errorTemplate;
