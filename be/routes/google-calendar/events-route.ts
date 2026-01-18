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

// GET / - Get all events
router.get("/", eventsController.getAllEvents);

// GET /analytics - Get event analytics by date range
router.get("/analytics", eventsController.getEventAnalytics);

// GET /insights - Get AI-powered insights for events (rate limited)
router.get("/insights", calendarAiRateLimiter, eventsController.getInsights);

// POST /quick-add - Quick add event
router.post("/quick-add", eventsController.quickAddEvent);

// POST /watch - Watch events
router.post("/watch", eventsController.watchEvents);

// POST /move - Move event
router.post("/move", eventsController.moveEvent);

// POST /import - Import event (creates private copy)
router.post("/import", eventsController.importEvent);

// GET /:id/instances - Get instances of recurring event
router.get("/:id/instances", eventsController.getEventInstances);

// GET /:id/reschedule-suggestions - Get AI reschedule suggestions (rate limited)
router.get(
  "/:id/reschedule-suggestions",
  calendarAiRateLimiter,
  eventsController.getRescheduleSuggestions
);

// POST /:id/reschedule - Apply reschedule to event
router.post("/:id/reschedule", eventsController.rescheduleEvent);

// GET /:id - Get specific event by ID
router.get("/:id", eventsController.getEventById);

// POST / - Create new event
router.post("/", eventsController.createEvent);

// PATCH /:id - Update existing event
router.patch("/:id", eventsController.updateEvent);

// DELETE /:id - Delete event from calendar
router.delete("/:id", eventsController.deleteEvent);

export default router;
