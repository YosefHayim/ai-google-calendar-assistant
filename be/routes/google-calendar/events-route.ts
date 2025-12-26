import { authHandler } from "@/middlewares/auth-handler";
import eventsController from "@/controllers/google-calendar/events-controller";
import express from "express";

const router = express.Router();

router.use(authHandler);

// get all the events of the user
router.get("/", eventsController.getAllEvents);

router.get("/filtered", eventsController.getAllFilteredEvents);

// get specific event by id
router.get("/:id", eventsController.getEventById);

// create a new event
router.post("/", eventsController.createEvent);

// update an existing event
router.patch("/:id", eventsController.updateEvent);

// delete an event from the user calendar
router.delete("/:id", eventsController.deleteEvent);

export default router;
