import type { Response } from "express";

const HTTP_ERROR_THRESHOLD = 400;

export const sendResponse = (res: Response, status: number, message: string, data?: unknown) => {
  res.status(status).json({
    status: status >= HTTP_ERROR_THRESHOLD ? "error" : "success",
    message,
    data,
  });
};

export default sendResponse;
