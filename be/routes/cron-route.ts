import { cronController } from "@/controllers/cron-controller";
import express from "express";

const router = express.Router();

// Health check endpoint for the cron service
router.get("/health", cronController.healthCheck);



// Daily briefing endpoint - called by AWS EventBridge/Lambda every 5 minutes
router.post("/daily-briefing", cronController.processDailyBriefings);

export default router;
