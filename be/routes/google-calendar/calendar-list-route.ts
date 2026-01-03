import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import calendarListController from "@/controllers/google-calendar/calendar-list-controller";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  logger.info(`Google Calendar: Calendar List: id: ${id}`);
  if (!id) {
    logger.error(`Google Calendar: Calendar List: id not found`);
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Calendar ID parameter is required.");
  }
  logger.info(`Google Calendar: Calendar List: id found: ${id}`);
  next();
});

// List all calendars on user's calendar list
router.get("/", calendarListController.listCalendars);

// Watch for changes to calendar list (must be before /:id)
router.post("/watch", calendarListController.watchCalendarList);

// Get specific calendar from user's list
router.get("/:id", calendarListController.getCalendarListEntry);

// Add existing calendar to user's list
router.post("/", calendarListController.insertCalendarToList);

// Partial update of calendar list entry
router.patch("/:id", calendarListController.patchCalendarListEntry);

// Full update of calendar list entry
router.put("/:id", calendarListController.updateCalendarListEntry);

// Remove calendar from user's list
router.delete("/:id", calendarListController.deleteCalendarFromList);

export default router;
