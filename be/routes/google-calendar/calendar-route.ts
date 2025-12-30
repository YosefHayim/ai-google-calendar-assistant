import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import calendarController from "@/controllers/google-calendar/calendar-controller";
import { sendR } from "@/utils/http";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar ID parameter is required.");
  }

  next();
});

// get info about all the calendars the user has
router.get("/", calendarController.getAllCalendars);

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

export default router;
