import channelsController from "@/controllers/google-calendar/channels-controller"
import express from "express"
import { googleTokenRefresh } from "@/middlewares/google-token-refresh"
import { googleTokenValidation } from "@/middlewares/google-token-validation"
import { withCalendarClient } from "@/middlewares/calendar-client"
import { supabaseAuth } from "@/middlewares/supabase-auth"

const router = express.Router()

router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh(), withCalendarClient)

// Stop watching resources through a channel
router.post("/stop", channelsController.stopChannel);

export default router;
