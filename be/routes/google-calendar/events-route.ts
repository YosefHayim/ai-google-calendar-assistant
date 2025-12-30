import express, { NextFunction, Request, Response } from "express";

import { STATUS_RESPONSE } from "@/config";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { googleTokenValidation } from "@/middlewares/google-token-validation";
import { googleTokenRefresh } from "@/middlewares/google-token-refresh";
import eventsController from "@/controllers/google-calendar/events-controller";
import { sendR } from "@/utils/http";

const router = express.Router();

// Supabase auth (with auto-refresh) + Google token validation + auto-refresh
router.use(supabaseAuth(), googleTokenValidation, googleTokenRefresh());

router.param("id", (_req: Request, res: Response, next: NextFunction, id: string) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID parameter is required.");
  }

  next();
});

// get all the events of the user
router.get("/", eventsController.getAllEvents);

router.get("/analytics", eventsController.getEventAnalytics);

// get specific event by id
router.get("/:id", eventsController.getEventById);

// create a new event
router.post("/", eventsController.createEvent);

// update an existing event
router.patch("/:id", eventsController.updateEvent);

// delete an event from the user calendar
router.delete("/:id", eventsController.deleteEvent);

export default router;
