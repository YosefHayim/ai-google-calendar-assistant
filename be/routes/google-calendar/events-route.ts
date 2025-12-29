import { STATUS_RESPONSE } from "@/config";
import { authHandler } from "@/middlewares/auth-handler";
import eventsController from "@/controllers/google-calendar/events-controller";
import express from "express";
import { sendR } from "@/utils/http";

const router = express.Router();

router.use(authHandler);

router.param("id", (req, res, next, id) => {
  if (!id) {
    return sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Event ID parameter is required.");
  }

  next();
});

// get all the events of the user
router.get("/", eventsController.getAllEvents);

// get specific event by id
router.get("/:id", eventsController.getEventById);

// create a new event
router.post("/", eventsController.createEvent);

// update an existing event
router.patch("/:id", eventsController.updateEvent);

// delete an event from the user calendar
router.delete("/:id", eventsController.deleteEvent);

export default router;
