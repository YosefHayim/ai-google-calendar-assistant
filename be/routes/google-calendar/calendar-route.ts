import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import calendarController from "@/controllers/google-calendar/calendar-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    logger.error(`Google Calendar: Calendar: id not found`);
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar ID parameter is required.");
  }
  next();
});

// get info about all the calendars the user has
router.get("/", calendarController.getAllCalendars);

// get dry calendar info like expiry date of the token
router.get("/dry-calendar-info", calendarController.getDryCalendarInfo);

// create a new secondary calendar
router.post("/", calendarController.createCalendar);

// get all user settings
router.get("/settings/all", calendarController.listAllSettings);

// get settings of calendar
router.get("/settings", calendarController.getSettingsOfCalendar);
router.get("/settings/:id", calendarController.getSettingsOfCalendarById);

// get free busy
router.get("/freebusy", calendarController.getFreeBusy);

// get calendar colors
router.get("/colors", calendarController.getAllCalendarColors);
router.get("/colors/:id", calendarController.getCalendarColorById);

// get calendar timezone
router.get("/timezones", calendarController.getAllCalendarTimezones);
router.get("/timezones/:id", calendarController.getCalendarTimezoneById);

// get calendar overview by id - MUST be last (catches all /:id patterns)
router.get("/:id", calendarController.getCalendarInfoById);

// partial update of calendar metadata
router.patch("/:id", calendarController.patchCalendar);

// full update of calendar metadata
router.put("/:id", calendarController.updateCalendar);

// delete a secondary calendar (different from clear)
router.delete("/:id/delete", calendarController.deleteCalendar);

// clear all events of calendar by id
router.delete("/:id", calendarController.clearAllEventsOfCalendar);

export default router;
