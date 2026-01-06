import express from "express";
import { whatsAppController } from "@/controllers/whatsapp-controller";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// ============================================
// WhatsApp routes UNDER DEVELOPMENT
// SECURITY: All routes require authentication
// ============================================
router.use(supabaseAuth());

router.get("/", whatsAppController.getWhatsAppNotifications);

// router.post("/", whatsAppController.WhatsAppMessagesCreated);

export default router;
