import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { STATUS_RESPONSE } from "@/config";
import { logger } from "@/utils/logger";
import { sendR } from "@/utils/http";
import { supabaseAuth } from "@/middlewares/supabase-auth";
import {
  authRateLimiter,
  otpRateLimiter,
  refreshRateLimiter,
} from "@/middlewares/rate-limiter";
import {
  validate,
  signUpSchema,
  signInSchema,
  otpVerificationSchema,
  deactivateUserSchema,
  allyBrainSchema,
  contextualSchedulingSchema,
  preferenceKeyParamSchema,
  reminderPreferencesSchema,
  voicePreferenceSchema,
} from "@/middlewares/validation";
import { authController } from "@/controllers/users/auth-controller";
import { profileController } from "@/controllers/users/profile-controller";
import { googleIntegrationController } from "@/controllers/users/google-integration-controller";
import { userPreferencesController } from "@/controllers/user-preferences-controller";
import { agentProfilesController } from "@/controllers/agent-profiles-controller";

const router = express.Router();

router.param(
  "id",
  (_req: Request, res: Response, next: NextFunction, id: string) => {
    if (!id) {
      logger.error(`Users: id not found`);
      return sendR(
        res,
        STATUS_RESPONSE.BAD_REQUEST,
        "User ID parameter is required in order to get user information.",
      );
    }
    next();
  },
);

router.get(
  "/get-user",
  supabaseAuth(),
  profileController.getCurrentUserInformation,
);

router.get("/session", supabaseAuth(), authController.checkSession);

router.get(
  "/integrations/google-calendar",
  supabaseAuth(),
  googleIntegrationController.getGoogleCalendarIntegrationStatus,
);

router.post(
  "/integrations/google-calendar/disconnect",
  supabaseAuth(),
  googleIntegrationController.disconnectGoogleCalendarIntegration,
);

// ============================================
// User Preferences Routes
// ============================================

// get all assistant preferences
router.get(
  "/preferences",
  supabaseAuth(),
  userPreferencesController.getAllPreferences,
);

// get a specific preference by key
router.get(
  "/preferences/:key",
  supabaseAuth(),
  validate(preferenceKeyParamSchema, "params"),
  userPreferencesController.getPreference,
);

// update ally_brain preference
router.put(
  "/preferences/ally_brain",
  supabaseAuth(),
  validate(allyBrainSchema, "body"),
  userPreferencesController.updatePreference,
);

// update contextual_scheduling preference
router.put(
  "/preferences/contextual_scheduling",
  supabaseAuth(),
  validate(contextualSchedulingSchema, "body"),
  userPreferencesController.updatePreference,
);

// update reminder_defaults preference
router.put(
  "/preferences/reminder_defaults",
  supabaseAuth(),
  validate(reminderPreferencesSchema, "body"),
  userPreferencesController.updatePreference,
);

router.put(
  "/preferences/voice_preference",
  supabaseAuth(),
  validate(voicePreferenceSchema, "body"),
  userPreferencesController.updatePreference,
);

router.get("/agent-profiles", agentProfilesController.listProfiles);
router.get("/agent-profiles/selected", supabaseAuth(), agentProfilesController.getUserSelectedProfile);
router.put("/agent-profiles/selected", supabaseAuth(), agentProfilesController.setUserSelectedProfile);
router.get("/agent-profiles/:id", agentProfilesController.getProfile);

router.post(
  "/refresh",
  refreshRateLimiter,
  supabaseAuth(),
  authController.refreshToken,
);

router.delete(
  "/",
  supabaseAuth(),
  validate(deactivateUserSchema),
  profileController.deActivateUser,
);

router.get("/callback", googleIntegrationController.generateAuthGoogleUrl);

router.post(
  "/verify-user-by-email-otp",
  otpRateLimiter,
  validate(otpVerificationSchema),
  authController.verifyEmailByOtp,
);

router.post(
  "/signup",
  authRateLimiter,
  validate(signUpSchema),
  authController.signUpUserReg,
);

router.post(
  "/signin",
  authRateLimiter,
  validate(signInSchema),
  authController.signInUserReg,
);

router.post("/logout", authController.logout);

router.get(
  "/signup/google",
  authRateLimiter,
  authController.signUpOrSignInWithGoogle,
);

router.get(
  "/signup/github",
  authRateLimiter,
  authController.signUpUserViaGitHub,
);

router.get("/:id", supabaseAuth(), profileController.getUserInformationById);

export default router;
