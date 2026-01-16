import type { Request, Response } from "express";
import { STATUS_RESPONSE } from "@/config";
import { reqResAsyncHandler, sendR } from "@/utils/http";

const stopChannel = reqResAsyncHandler(async (req: Request, res: Response) => {
  await req.calendar?.channels.stop({
    requestBody: {
      id: req.body.id,
      resourceId: req.body.resourceId,
    },
  });

  return sendR(res, STATUS_RESPONSE.SUCCESS, "Channel stopped successfully");
});

export default {
  stopChannel,
};
