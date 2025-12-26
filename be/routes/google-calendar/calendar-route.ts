import { authHandler } from "@/middlewares/auth-handler";
import calendarController from "@/controllers/google-calendar/calendar-controller";
import express from "express";

const router = express.Router();

router.use(authHandler);

// get info about all the calendars the user has
router.get("/", calendarController.getAllCalendars);

// get calendar overview
router.get("/:id", calendarController.getCalendarInfoById);

// get calendar colors
router.get("/colors", calendarController.getAllCalendarColors);

router.get("/colors/:id", calendarController.getCalendarColorById);

// get calendar timezone
router.get("/timezones", calendarController.getAllCalendarTimezones);

router.get("/timezones/:id", calendarController.getCalendarTimezoneById);

export default router;
