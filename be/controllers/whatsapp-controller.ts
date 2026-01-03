import type { Request, Response } from "express";
import { STATUS_RESPONSE, env } from "@/config";

const getWhatsAppNotifications = (req: Request, res: Response) => {
  const { "hub.mode": mode, "hub.challenge": challenge, "hub.verify_token": token } = req.query;

  if (mode === "subscribe" && token === env.devWhatsAppAccessToken) {
    res.status(STATUS_RESPONSE.SUCCESS).send(challenge);
  } else {
    res.status(STATUS_RESPONSE.FORBIDDEN).end();
  }
};

const WhatsAppMessagesCreated = (req: Request, res: Response) => {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);

  res.status(STATUS_RESPONSE.SUCCESS).end();
};

export const whatsAppController = {
  getWhatsAppNotifications,
  WhatsAppMessagesCreated,
};
