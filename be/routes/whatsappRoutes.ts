import express from "express";
import { whatsAppController } from "@/controllers/whatsappController";

const router = express.Router();

// router.use(authHandler);

router.get("/", whatsAppController.getWhatsAppNotifications);

// router.post("/", whatsAppController.WhatsAppMessagesCreated);

export default router;
