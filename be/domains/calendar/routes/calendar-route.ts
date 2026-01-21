import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express"
import { STATUS_RESPONSE } from "@/config"
import calendarController from "@/domains/calendar/controllers/calendar-controller"
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
      logger.error("Google Calendar: Calendar: id not found")
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Calendar ID parameter is required."
      )
    }
    next()
  }
)

// GET / - Get all user calendars
router.get("/", calendarController.getAllCalendars)

// GET /dry-calendar-info - Get dry calendar info (token expiry, etc.)
router.get("/dry-calendar-info", calendarController.getDryCalendarInfo)

// POST / - Create new secondary calendar
router.post("/", calendarController.createCalendar)

// GET /settings/all - Get all user settings
router.get("/settings/all", calendarController.listAllSettings)

// GET /settings - Get calendar settings
router.get("/settings", calendarController.getSettingsOfCalendar)
// GET /settings/:id - Get calendar settings by ID
router.get("/settings/:id", calendarController.getSettingsOfCalendarById)

// GET /freebusy - Get free/busy information
router.get("/freebusy", calendarController.getFreeBusy)

// GET /colors - Get all calendar colors
router.get("/colors", calendarController.getAllCalendarColors)
// GET /colors/:id - Get calendar color by ID
router.get("/colors/:id", calendarController.getCalendarColorById)

// GET /timezones - Get all calendar timezones
router.get("/timezones", calendarController.getAllCalendarTimezones)
// GET /timezones/:id - Get calendar timezone by ID
router.get("/timezones/:id", calendarController.getCalendarTimezoneById)

// GET /:id - Get calendar info by ID
router.get("/:id", calendarController.getCalendarInfoById)

// PATCH /:id - Partial update calendar metadata
router.patch("/:id", calendarController.patchCalendar)

// PUT /:id - Full update calendar metadata
router.put("/:id", calendarController.updateCalendar)

// DELETE /:id/delete - Delete secondary calendar
router.delete("/:id/delete", calendarController.deleteCalendar)

// DELETE /:id - Clear all events from calendar
router.delete("/:id", calendarController.clearAllEventsOfCalendar)

export default router
