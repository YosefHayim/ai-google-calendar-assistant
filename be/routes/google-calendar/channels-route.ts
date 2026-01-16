import express from "express";
import channelsController from "@/controllers/google-calendar/channels-controller";
import { withCalendarClient } from "@/middlewares/calendar-client";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

router.use(
  supabaseAuth(),
  googleTokenValidation,
  googleTokenRefresh(),
  withCalendarClient
);

// Stop watching resources through a channel
router.post("/stop", channelsController.stopChannel);

export default router;
