import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";

import { STATUS_RESPONSE } from "@/config";
import eventsController from "@/domains/calendar/controllers/events-controller";
import { withCalendarClient } from "@/infrastructure/google/calendar-client";
import { googleTokenRefresh } from "@/domains/auth/middleware/google-token-refresh";
import { googleTokenValidation } from "@/domains/auth/middleware/google-token-validation";
import { calendarAiRateLimiter } from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";
import { sendR } from "@/lib/http";
import { logger } from "@/lib/logger";

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

/**
 * GET / - Retrieve All Calendar Events
 *
 * Fetches a comprehensive list of calendar events for the authenticated user across
 * all connected calendars. Includes recurring events, single events, and various
 * event types with full metadata.
 *
 * @param {Object} req.query - Query parameters for filtering and pagination
 * @param {string} req.query.calendar_id - Specific calendar ID to filter events
 * @param {string} req.query.start_date - Start date for event range (ISO format)
 * @param {string} req.query.end_date - End date for event range (ISO format)
 * @param {number} req.query.limit - Maximum number of events to return
 * @param {string} req.query.order_by - Sort field ('start_time', 'created', 'updated')
 * @param {boolean} req.query.include_recurring - Include recurring event instances
 * @param {string} req.query.status - Event status filter ('confirmed', 'tentative', 'cancelled')
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Calendar events with metadata
 * @property {Array} events - List of calendar events
 * @property {Object} events[].event_data - Full Google Calendar event object
 * @property {string} events[].id - Google Calendar event ID
 * @property {string} events[].calendar_id - Parent calendar identifier
 * @property {Date} events[].start_time - Event start datetime
 * @property {Date} events[].end_time - Event end datetime
 * @property {string} events[].title - Event title/summary
 * @property {Object} pagination - Pagination metadata if applicable
 *
 * @related Core endpoint for calendar data access. Provides the foundation for
 * calendar views, event listings, and calendar synchronization features.
 */
router.get("/", eventsController.getAllEvents);

/**
 * GET /analytics - Retrieve Event Analytics and Insights
 *
 * Provides analytical data about calendar events including patterns, frequency,
 * time distribution, and usage statistics over specified date ranges.
 *
 * @param {Object} req.query - Analytics query parameters
 * @param {string} req.query.start_date - Start date for analytics period (ISO format)
 * @param {string} req.query.end_date - End date for analytics period (ISO format)
 * @param {string} req.query.calendar_id - Specific calendar to analyze
 * @param {string} req.query.group_by - Grouping dimension ('day', 'week', 'month', 'category')
 * @param {Array} req.query.metrics - Metrics to include ('count', 'duration', 'attendees')
 * @param {boolean} req.query.include_trends - Include trend analysis data
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Event analytics and insights data
 * @property {Object} summary - Overall statistics for the period
 * @property {number} summary.total_events - Total number of events
 * @property {number} summary.total_duration - Total time spent in meetings
 * @property {Object} breakdown - Analytics broken down by requested dimensions
 * @property {Array} trends - Time-based trend data if requested
 * @property {Object} patterns - Identified patterns in scheduling behavior
 *
 * @related Supports calendar analytics features, productivity insights, and
 * scheduling pattern analysis. Helps users understand their calendar usage and
 * optimize their time management.
 */
router.get("/analytics", eventsController.getEventAnalytics);

/**
 * GET /insights - Generate AI-Powered Calendar Insights
 *
 * Uses AI to analyze calendar data and provide intelligent insights about scheduling
 * patterns, optimization opportunities, and calendar management recommendations.
 *
 * @param {Object} req.query - Insights generation parameters
 * @param {string} req.query.focus_area - Type of insights ('productivity', 'conflicts', 'patterns', 'optimization')
 * @param {string} req.query.time_range - Analysis period ('week', 'month', 'quarter', 'year')
 * @param {number} req.query.limit - Maximum number of insights to generate
 * @param {boolean} req.query.include_recommendations - Include actionable recommendations
 * @param {string} req.query.calendar_id - Specific calendar to analyze
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} AI-generated calendar insights and recommendations
 * @property {Array} insights - List of identified insights
 * @property {string} insights[].type - Insight category ('pattern', 'opportunity', 'warning')
 * @property {string} insights[].title - Human-readable insight title
 * @property {string} insights[].description - Detailed explanation
 * @property {Object} insights[].data - Supporting data for the insight
 * @property {Array} recommendations - Actionable recommendations based on insights
 * @property {Object} metadata - Analysis metadata (processing time, data range)
 *
 * @related Powers intelligent calendar features. Rate limited due to AI processing costs.
 * Provides value-added analysis beyond basic calendar data to help users optimize
 * their time management and scheduling practices.
 */
router.get("/insights", calendarAiRateLimiter, eventsController.getInsights);

/**
 * POST /quick-add - Quick Add Event with Natural Language
 *
 * Creates a calendar event using natural language input. Parses the text to extract
 * event details like title, date, time, and duration without requiring structured input.
 *
 * @param {Object} req.body - Quick add event payload
 * @param {string} req.body.text - Natural language event description
 * @param {string} req.body.calendar_id - Target calendar ID (optional, uses default if not specified)
 * @param {Object} req.body.context - Additional context for parsing
 * @param {string} req.body.context.timezone - User's timezone for date/time interpretation
 * @param {string} req.body.context.locale - User's locale for natural language parsing
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Created event details
 * @property {Object} event - Full Google Calendar event object
 * @property {string} event.id - Google Calendar event ID
 * @property {string} event.summary - Event title
 * @property {Object} event.start - Event start time details
 * @property {Object} event.end - Event end time details
 * @property {Object} parsing_metadata - Information about how the text was parsed
 * @property {Array} parsing_metadata.extracted_entities - Entities found in the text
 *
 * @related Enables quick event creation through natural language input. Commonly used
 * for voice commands, chat interfaces, or when users want to rapidly add events
 * without filling out detailed forms.
 */
router.post("/quick-add", eventsController.quickAddEvent);

/**
 * POST /watch - Set Up Calendar Event Notifications
 *
 * Establishes a webhook watch channel for real-time calendar event notifications.
 * Google Calendar will push event changes to the specified webhook endpoint as they occur.
 *
 * @param {Object} req.body - Watch channel configuration
 * @param {string} req.body.calendar_id - Calendar to watch for changes
 * @param {string} req.body.webhook_url - Webhook endpoint to receive notifications
 * @param {string} req.body.channel_id - Unique identifier for this watch channel
 * @param {number} req.body.ttl - Time-to-live for the watch channel in seconds
 * @param {Object} req.body.filters - Optional event filters to watch
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Watch channel establishment confirmation
 * @property {string} channel_id - Unique watch channel identifier
 * @property {string} resource_id - Google Calendar resource identifier
 * @property {Date} expiration - When the watch channel will expire
 * @property {string} webhook_url - Confirmed webhook endpoint
 * @property {Object} filters - Applied event filters
 *
 * @related Enables real-time calendar synchronization. When calendar events are created,
 * modified, or deleted, Google pushes notifications to keep the application in sync
 * without polling. Essential for maintaining data consistency across multiple clients.
 */
router.post("/watch", eventsController.watchEvents);

/**
 * POST /move - Move Event to Different Calendar
 *
 * Transfers an existing event from one calendar to another while preserving all
 * event details. Useful for reorganizing events across different calendar contexts.
 *
 * @param {Object} req.body - Event move operation details
 * @param {string} req.body.event_id - Google Calendar event ID to move
 * @param {string} req.body.source_calendar_id - Current calendar containing the event
 * @param {string} req.body.destination_calendar_id - Target calendar to move event to
 * @param {boolean} req.body.keep_attendees - Whether to maintain attendee list (default: true)
 * @param {boolean} req.body.send_notifications - Whether to notify attendees of the move
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Moved event details
 * @property {Object} event - Updated Google Calendar event object
 * @property {string} event.id - Event ID (may change during move)
 * @property {string} event.calendar_id - New calendar identifier
 * @property {boolean} attendees_notified - Whether attendees were notified
 * @property {Object} move_metadata - Details about the move operation
 *
 * @related Supports calendar organization and event management workflows. Enables
 * users to reorganize their schedules by moving events between personal, work,
 * or shared calendars while maintaining event integrity.
 */
router.post("/move", eventsController.moveEvent);

/**
 * POST /import - Import Event as Private Copy
 *
 * Creates a private copy of an existing event in the user's calendar. Useful for
 * taking shared or public events and making personal copies that can be modified
 * independently of the original.
 *
 * @param {Object} req.body - Event import operation details
 * @param {string} req.body.event_id - Source event ID to import
 * @param {string} req.body.source_calendar_id - Calendar containing the source event
 * @param {string} req.body.destination_calendar_id - Target calendar for the imported copy
 * @param {Object} req.body.modifications - Optional modifications to apply during import
 * @param {string} req.body.modifications.title - New title for the imported event
 * @param {Object} req.body.modifications.time - New time details if rescheduling
 * @param {boolean} req.body.remove_attendees - Whether to remove attendees from the copy
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Imported event details
 * @property {Object} event - New Google Calendar event object (private copy)
 * @property {string} event.id - New event ID for the imported copy
 * @property {string} original_event_id - Reference to the original event
 * @property {Object} modifications_applied - Summary of any modifications made
 * @property {boolean} is_private_copy - Confirmation that this is a separate copy
 *
 * @related Enables event duplication workflows. Users can take events from shared
 * calendars, public calendars, or other sources and create personal copies they
 * can modify without affecting the original event.
 */
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
