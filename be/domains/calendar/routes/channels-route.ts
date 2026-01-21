import express from "express"
import channelsController from "@/domains/calendar/controllers/channels-controller"
import { withCalendarClient } from "@/infrastructure/google/calendar-client"
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh"
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"

const router = express.Router()

router.use(
  supabaseAuth(),
  googleTokenValidation,
  googleTokenRefresh(),
  withCalendarClient
)

// Stop watching resources through a channel
router.post("/stop", channelsController.stopChannel)

export default router
