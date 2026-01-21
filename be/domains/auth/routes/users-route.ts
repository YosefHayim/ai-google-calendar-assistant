import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { STATUS_RESPONSE } from "@/config";
import { userPreferencesController } from "@/domains/settings/controllers/user-preferences-controller";
import { authController } from "@/domains/auth/controllers/auth-controller";
import { googleIntegrationController } from "@/domains/auth/controllers/google-integration-controller";
import { profileController } from "@/domains/auth/controllers/profile-controller";
import {
  authRateLimiter,
  otpRateLimiter,
  refreshRateLimiter,
} from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/domains/auth/middleware/supabase-auth";
import { sendR } from "@/lib/http";
import { logger } from "@/lib/logger";
import {
  allyBrainSchema,
  contextualSchedulingSchema,
  crossPlatformSyncSchema,
  dailyBriefingSchema,
  displayPreferencesSchema,
  geoLocationSchema,
  notificationSettingsSchema,
  otpVerificationSchema,
  preferenceKeyParamSchema,
  reminderPreferencesSchema,
  signInSchema,
  signUpSchema,
  validate,
  voicePreferenceSchema,
} from "@/validation";

const router = express.Router();

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error("Users: id not found");
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "User ID parameter is required in order to get user information."
      );
    }
    next();
  }
);

/**
 * GET /get-user - Retrieve Current User Profile Information
 *
 * Fetches comprehensive profile information for the currently authenticated user,
 * including personal details, preferences, and account status.
 *
 * @param {string} req.user.id - Authenticated user ID from Supabase JWT
 *
 * @returns {Object} Complete user profile data
 * @property {string} id - Unique user identifier
 * @property {string} email - User's email address
 * @property {string} full_name - User's display name
 * @property {Date} created_at - Account creation timestamp
 * @property {Date} updated_at - Last profile update timestamp
 * @property {Object} preferences - User preference settings
 * @property {Object} integrations - Connected service integrations status
 * @property {string} subscription_status - Current subscription tier
 *
 * @related Core user management endpoint. Provides the user data needed for
 * profile displays, settings pages, and personalization throughout the application.
 */
router.get(
  "/get-user",
  supabaseAuth(),
  profileController.getCurrentUserInformation
);

/**
 * GET /session - Validate User Session Status
 *
 * Verifies that the current user session is active and valid. Used by frontend
 * applications to check authentication status and handle session expiration.
 *
 * @param {string} req.user.id - Authenticated user ID from Supabase JWT
 *
 * @returns {Object} Session validation result
 * @property {boolean} valid - Whether the session is currently valid
 * @property {Date} expires_at - Session expiration timestamp
 * @property {Object} user - Basic user information for the session
 * @property {string} user.id - User identifier
 * @property {string} user.email - User email
 * @property {string} subscription_tier - Current subscription level
 *
 * @related Authentication flow management. Frontend applications use this endpoint
 * to determine if users need to re-authenticate or if their session is still active.
 */
router.get("/session", supabaseAuth(), authController.checkSession);

// GET /restore-session - Restore user session
router.get("/restore-session", supabaseAuth(), authController.restoreSession);

/**
 * GET /integrations/google-calendar - Check Google Calendar Integration Status
 *
 * Retrieves the current status of the user's Google Calendar integration,
 * including connection state, permissions, and available calendars.
 *
 * @param {string} req.user.id - Authenticated user ID from Supabase
 *
 * @returns {Object} Google Calendar integration status
 * @property {boolean} connected - Whether Google Calendar is connected
 * @property {Date} connected_at - When the integration was established
 * @property {Array} scopes - Granted permission scopes
 * @property {Array} calendars - List of accessible calendars
 * @property {Object} calendars[].id - Calendar identifier
 * @property {string} calendars[].name - Calendar display name
 * @property {boolean} calendars[].primary - Whether this is the primary calendar
 * @property {string} calendars[].access_role - User's access level ('owner', 'writer', 'reader')
 * @property {Object} health - Integration health status
 *
 * @related Integration management flow. Used to display connection status in settings,
 * determine available calendars for event operations, and troubleshoot integration issues.
 */
router.get(
  "/integrations/google-calendar",
  supabaseAuth(),
  googleIntegrationController.getGoogleCalendarIntegrationStatus
);

// POST /integrations/google-calendar/disconnect - Disconnect Google Calendar integration
router.post(
  "/integrations/google-calendar/disconnect",
  supabaseAuth(),
  googleIntegrationController.disconnectGoogleCalendarIntegration
);

// ============================================
// User Preferences Routes
// ============================================

// GET /preferences - Get all user preferences
router.get(
  "/preferences",
  supabaseAuth(),
  userPreferencesController.getAllPreferences
);

// GET /preferences/:key - Get specific preference by key
router.get(
  "/preferences/:key",
  supabaseAuth(),
  validate(preferenceKeyParamSchema, "params"),
  userPreferencesController.getPreference
);

// PUT /preferences/ally_brain - Update ally brain preference
router.put(
  "/preferences/ally_brain",
  supabaseAuth(),
  validate(allyBrainSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/contextual_scheduling - Update contextual scheduling preference
router.put(
  "/preferences/contextual_scheduling",
  supabaseAuth(),
  validate(contextualSchedulingSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/reminder_defaults - Update reminder defaults preference
router.put(
  "/preferences/reminder_defaults",
  supabaseAuth(),
  validate(reminderPreferencesSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/voice_preference - Update voice preference
router.put(
  "/preferences/voice_preference",
  supabaseAuth(),
  validate(voicePreferenceSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/daily_briefing - Update daily briefing preference
router.put(
  "/preferences/daily_briefing",
  supabaseAuth(),
  validate(dailyBriefingSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/cross_platform_sync - Update cross-platform sync preference
router.put(
  "/preferences/cross_platform_sync",
  supabaseAuth(),
  validate(crossPlatformSyncSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/notification_settings - Update notification settings preference
router.put(
  "/preferences/notification_settings",
  supabaseAuth(),
  validate(notificationSettingsSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/geo_location - Update geo location preference
router.put(
  "/preferences/geo_location",
  supabaseAuth(),
  validate(geoLocationSchema, "body"),
  userPreferencesController.updatePreference
);

// PUT /preferences/display_preferences - Update display preferences (timezone, time format)
router.put(
  "/preferences/display_preferences",
  supabaseAuth(),
  validate(displayPreferencesSchema, "body"),
  userPreferencesController.updatePreference
);

router.post(
  "/refresh",
  refreshRateLimiter,
  supabaseAuth(),
  authController.refreshToken
);

router.patch("/profile", supabaseAuth(), profileController.updateUserProfile);
router.delete("/", supabaseAuth(), profileController.deActivateUser);

router.get("/callback", googleIntegrationController.generateAuthGoogleUrl);

router.post(
  "/verify-user-by-email-otp",
  otpRateLimiter,
  validate(otpVerificationSchema),
  authController.verifyEmailByOtp
);

router.post(
  "/signup",
  authRateLimiter,
  validate(signUpSchema),
  authController.signUpUserReg
);

router.post(
  "/signin",
  authRateLimiter,
  validate(signInSchema),
  authController.signInUserReg
);

router.post("/logout", authController.logout);

router.get(
  "/signup/google",
  authRateLimiter,
  authController.signUpOrSignInWithGoogle
);

router.get(
  "/signup/github",
  authRateLimiter,
  authController.signUpUserViaGitHub
);

router.get("/:id", supabaseAuth(), profileController.getUserInformationById);

export default router;
