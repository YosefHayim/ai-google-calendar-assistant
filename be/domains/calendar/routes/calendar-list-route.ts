import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"
import { STATUS_RESPONSE } from "@/config"
import calendarListController from "@/domains/calendar/controllers/calendar-list-controller"
import { withCalendarClient } from "@/infrastructure/google/calendar-client"
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh"
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation"
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth"
import { sendR } from "@/lib/http"
import { logger } from "@/lib/logger"

const router = express.Router()

router.use(
  supabaseAuth(),
  googleTokenValidation,
  googleTokenRefresh(),
  withCalendarClient
)

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error("Google Calendar: Calendar List: id not found")
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Calendar ID parameter is required."
      )
    }
    next()
  }
)

// List all calendars on user's calendar list
router.get("/", calendarListController.listCalendars)

// Watch for changes to calendar list (must be before /:id)
router.post("/watch", calendarListController.watchCalendarList)

// Get specific calendar from user's list
router.get("/:id", calendarListController.getCalendarListEntry)

// Add existing calendar to user's list
router.post("/", calendarListController.insertCalendarToList)

// Partial update of calendar list entry
router.patch("/:id", calendarListController.patchCalendarListEntry)

// Full update of calendar list entry
router.put("/:id", calendarListController.updateCalendarListEntry)

// Remove calendar from user's list
router.delete("/:id", calendarListController.deleteCalendarFromList)

export default router
