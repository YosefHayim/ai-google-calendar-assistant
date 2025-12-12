import express from "express";
import { whatsAppController } from "@/controllers/whatsapp-controller";

const router = express.Router();

// router.use(authHandler);

/**
 * @swagger
 * /api/whatsapp:
 *   get:
 *     summary: Get WhatsApp notifications (webhook verification)
 *     tags: [WhatsApp]
 *     parameters:
 *       - in: query
 *         name: hub.mode
 *         schema:
 *           type: string
 *         description: Webhook verification mode
 *       - in: query
 *         name: hub.challenge
 *         schema:
 *           type: string
 *         description: Webhook verification challenge
 *       - in: query
 *         name: hub.verify_token
 *         schema:
 *           type: string
 *         description: Webhook verification token
 *     responses:
 *       200:
 *         description: Webhook verification successful
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               description: The challenge string for webhook verification
 */
router.get("/", whatsAppController.getWhatsAppNotifications);

// router.post("/", whatsAppController.WhatsAppMessagesCreated);

export default router;
