import type { Request, Response } from "express";
import { reqResAsyncHandler, sendR } from "@/utils/http";

import { STATUS_RESPONSE } from "@/config";
import { fetchCredentialsByEmail } from "@/utils/auth";
import { initUserSupabaseCalendarWithTokensAndUpdateTokens } from "@/utils/calendar";

/**
 * Stop watching resources through a channel
 *
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 * @returns {Promise<void>} The response object.
 */
const stopChannel = reqResAsyncHandler(async (req: Request, res: Response) => {
  const tokenData = await fetchCredentialsByEmail(req.user?.email!);
  if (!tokenData) {
    return sendR(res, STATUS_RESPONSE.NOT_FOUND, "User credentials not found.");
  }

  const calendar = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokenData);
  await calendar.channels.stop({
    requestBody: {
      id: req.body.id,
      resourceId: req.body.resourceId,
    },
  });

  sendR(res, STATUS_RESPONSE.SUCCESS, "Channel stopped successfully");
});

export default {
  stopChannel,
};
