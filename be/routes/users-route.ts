import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { STATUS_RESPONSE } from "@/config";
import { userPreferencesController } from "@/controllers/user-preferences-controller";
import { authController } from "@/controllers/users/auth-controller";
import { googleIntegrationController } from "@/controllers/users/google-integration-controller";
import { profileController } from "@/controllers/users/profile-controller";
import {
  authRateLimiter,
  otpRateLimiter,
  refreshRateLimiter,
} from "@/middlewares/rate-limiter";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import { sendR } from "@/utils/http";
import { logger } from "@/utils/logger";
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

// GET /get-user - Get current user information
router.get(
  "/get-user",
  supabaseAuth(),
  profileController.getCurrentUserInformation
);

// GET /session - Check user session validity
router.get("/session", supabaseAuth(), authController.checkSession);

// GET /restore-session - Restore user session
router.get("/restore-session", supabaseAuth(), authController.restoreSession);

// GET /integrations/google-calendar - Get Google Calendar integration status
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
