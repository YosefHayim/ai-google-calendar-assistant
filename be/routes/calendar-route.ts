import { authHandler } from "@/middlewares/auth-handler";
import calendarController from "@/controllers/calendar-controller";
import express from "express";

const router = express.Router();

router.use(authHandler);

/**
 * @swagger
 * /api/calendars:
 *   get:
 *     summary: Get all calendars for the authenticated user
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all calendars
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CalendarInfo'
 *       404:
 *         description: User credentials not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", calendarController.getAllCalendars);

/**
 * @swagger
 * /api/calendars/overview:
 *   get:
 *     summary: Get calendar overview (primary calendar details)
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully received calendar overview
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarOverview'
 */
router.get("/overview", calendarController.calendarOverview);

/**
 * @swagger
 * /api/calendars/colors:
 *   get:
 *     summary: Get calendar color definitions
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully received calendar colors
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarColors'
 */
router.get("/colors", calendarController.getCalendarColors);

/**
 * @swagger
 * /api/calendars/timezone:
 *   get:
 *     summary: Get calendar timezone settings
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully received calendar timezone
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarTimezone'
 */
router.get("/timezone", calendarController.getCalendarTimezone);

/**
 * @swagger
 * /api/calendars/events:
 *   get:
 *     summary: Get all events for the authenticated user
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: Calendar ID(s) - can be comma-separated for multiple calendars (e.g., "primary,calendar2@group.calendar.google.com") or "all" to fetch events from all calendars
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [startTime, updated]
 *           default: startTime
 *         description: The order of the events returned (defaults to "startTime" - newest/upcoming first)
 *     responses:
 *       200:
 *         description: Successfully retrieved all events
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CalendarEvent'
 */
router.get("/events", calendarController.getAllEvents);

/**
 * @swagger
 * /api/calendars/events/filtered:
 *   get:
 *     summary: Get filtered events based on query parameters
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: Calendar ID(s) - can be comma-separated for multiple calendars (e.g., "primary,calendar2@group.calendar.google.com") or "all" to fetch events from all calendars
 *       - in: query
 *         name: timeMin
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lower bound (exclusive) for an event's end time
 *       - in: query
 *         name: timeMax
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Upper bound (exclusive) for an event's start time
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: number
 *         description: Maximum number of events returned
 *       - in: query
 *         name: singleEvents
 *         schema:
 *           type: boolean
 *         description: Whether to expand recurring events
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *           enum: [startTime, updated]
 *           default: startTime
 *         description: The order of the events returned (defaults to "startTime" - newest/upcoming first)
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Free text search terms
 *       - in: query
 *         name: showDeleted
 *         schema:
 *           type: boolean
 *         description: Whether to include deleted events
 *     responses:
 *       200:
 *         description: Successfully retrieved filtered events
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/CalendarEvent'
 */
router.get("/events/filtered", calendarController.getAllFilteredEvents);

/**
 * @swagger
 * /api/calendars/{eventId}:
 *   get:
 *     summary: Get a specific event by ID
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID
 *       - in: query
 *         name: calendarId
 *         schema:
 *           type: string
 *         description: The calendar ID (defaults to 'primary')
 *     responses:
 *       200:
 *         description: Event retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarEvent'
 *       400:
 *         description: Bad request - Event ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User token not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:eventId", calendarController.getSpecificEvent);

/**
 * @swagger
 * /api/calendars:
 *   post:
 *     summary: Create a new calendar event
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventParameters'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarEvent'
 */
router.post("/", calendarController.createEvent);

/**
 * @swagger
 * /api/calendars/{eventId}:
 *   patch:
 *     summary: Update an existing event
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EventParameters'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/CalendarEvent'
 *       400:
 *         description: Bad request - Event ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:eventId", calendarController.updateEvent);

/**
 * @swagger
 * /api/calendars/{eventId}:
 *   delete:
 *     summary: Delete an event from the user calendar
 *     tags: [Calendar]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: The event ID to delete
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Bad request - Event ID is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:eventId", calendarController.deleteEvent);

export default router;
