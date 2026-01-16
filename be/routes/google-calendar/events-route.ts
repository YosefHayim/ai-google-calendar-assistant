import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { STATUS_RESPONSE } from "@/config";
import eventsController from "@/controllers/google-calendar/events-controller";
import { withCalendarClient } from "@/middlewares/calendar-client";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { calendarAiRateLimiter } from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { sendR } from "@/utils/http";
import { logger } from "@/utils/logger";

const router = express.Router();

// Supabase auth + Google token validation + auto-refresh + calendar client
router.use(
  supabaseAuth(),
  googleTokenValidation,
  googleTokenRefresh(),
  withCalendarClient
);

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error("Google Calendar: Events: id not found");
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "Event ID parameter is required."
      );
    }
    next();
  }
);

// get all the events of the user
router.get("/", eventsController.getAllEvents);

// get event analytics by start date and end date
router.get("/analytics", eventsController.getEventAnalytics);

// get AI-powered insights for calendar events (rate limited - expensive AI operation)
router.get("/insights", calendarAiRateLimiter, eventsController.getInsights);

// quick add an event
router.post("/quick-add", eventsController.quickAddEvent);

// watch an event
router.post("/watch", eventsController.watchEvents);

// move an event
router.post("/move", eventsController.moveEvent);

// import an event (creates a private copy)
router.post("/import", eventsController.importEvent);

// get instances of a recurring event (must be before /:id)
router.get("/:id/instances", eventsController.getEventInstances);

// get reschedule suggestions for an event (rate limited - expensive AI operation)
router.get(
  "/:id/reschedule-suggestions",
  calendarAiRateLimiter,
  eventsController.getRescheduleSuggestions
);

// apply reschedule to an event
router.post("/:id/reschedule", eventsController.rescheduleEvent);

// get specific event by id
router.get("/:id", eventsController.getEventById);

// create a new event
router.post("/", eventsController.createEvent);

// update an existing event
router.patch("/:id", eventsController.updateEvent);

// delete an event from the user calendar
router.delete("/:id", eventsController.deleteEvent);

export default router;
