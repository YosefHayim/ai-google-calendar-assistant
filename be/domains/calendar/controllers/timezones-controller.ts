import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config/constants/http";
import sendR from "@/lib/send-response";
import { getTimezoneOptions } from "@/lib/timezone-options";

export const timezonesController = {
  getList(_req: Request, res: Response) {
    const timezones = getTimezoneOptions();
    return sendR(
      res,
      STATUS_RESPONSE.SUCCESS,
      "Timezones retrieved successfully",
      timezones
    );
  },
};
