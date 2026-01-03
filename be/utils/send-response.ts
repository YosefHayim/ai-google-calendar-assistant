import type { Response } from "express";

const ERROR = 400;

/**
 * Send a response
 *
 * @param {Response} res - The response object.
 * @param {number} status - The status of the response.
 * @param {string} message - The message of the response.
 * @param {unknown} data - The data of the response.
 * @returns {void} The response object.
 * @description Sends a response and sends the response.
 * @example
 * const data = await sendR(res, status, message, data);
 *
 */
const sendR = (res: Response, status: number, message: string, data?: unknown) => {
  res.status(status).json({
    status: status >= ERROR ? "error" : "success",
    message,
    data,
  });
};

export default sendR;
