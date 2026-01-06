import { z, ZodError, type ZodSchema } from "zod";
import type { Request, Response, NextFunction } from "express";
import { STATUS_RESPONSE } from "@/config";
import { sendR } from "@/utils/http";

/**
 * SECURITY: Input validation schemas for API endpoints
 * Using Zod for runtime type checking and validation
 */

// ============================================
// Auth Validation Schemas
// ============================================

export const signUpSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export const signInSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),
  password: z
    .string()
    .min(1, "Password is required")
    .max(128, "Password must be less than 128 characters"),
});

export const otpVerificationSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),
  token: z
    .string()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must contain only digits"),
});

export const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, "Refresh token is required"),
});

export const deactivateUserSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .transform((email) => email.toLowerCase().trim()),
});

// ============================================
// Calendar Event Validation Schemas
// ============================================

export const calendarIdSchema = z.object({
  calendarId: z
    .string()
    .min(1, "Calendar ID is required")
    .max(500, "Calendar ID must be less than 500 characters"),
});

export const eventIdParamSchema = z.object({
  id: z
    .string()
    .min(1, "Event ID is required")
    .max(500, "Event ID must be less than 500 characters"),
});

export const createEventSchema = z.object({
  summary: z
    .string()
    .min(1, "Event summary is required")
    .max(1000, "Summary must be less than 1000 characters"),
  description: z
    .string()
    .max(10000, "Description must be less than 10000 characters")
    .optional(),
  location: z
    .string()
    .max(1000, "Location must be less than 1000 characters")
    .optional(),
  start: z.object({
    dateTime: z.string().datetime().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    timeZone: z.string().max(100).optional(),
  }),
  end: z.object({
    dateTime: z.string().datetime().optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format")
      .optional(),
    timeZone: z.string().max(100).optional(),
  }),
  attendees: z
    .array(
      z.object({
        email: z.string().email("Invalid attendee email"),
        displayName: z.string().max(200).optional(),
        optional: z.boolean().optional(),
      })
    )
    .max(100, "Maximum 100 attendees allowed")
    .optional(),
  recurrence: z.array(z.string().max(500)).max(10).optional(),
  reminders: z
    .object({
      useDefault: z.boolean().optional(),
      overrides: z
        .array(
          z.object({
            method: z.enum(["email", "popup"]),
            minutes: z.number().min(0).max(40320), // Max 4 weeks
          })
        )
        .max(5)
        .optional(),
    })
    .optional(),
  calendarId: z.string().max(500).optional(),
});

// ============================================
// Chat Validation Schemas
// ============================================

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(10000, "Message must be less than 10000 characters")
    .transform((msg) => msg.trim()),
  conversationId: z.number().int().positive().optional(),
  sessionId: z.string().uuid().optional(),
});

// ============================================
// Validation Middleware Factory
// ============================================

type ValidationTarget = "body" | "query" | "params";

/**
 * Creates a validation middleware for the specified schema and target
 * @param schema - Zod schema to validate against
 * @param target - Request property to validate ('body', 'query', or 'params')
 */
export const validate =
  <T extends ZodSchema>(schema: T, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target];
      const validated = schema.parse(dataToValidate);

      if (target === "query") {
        (req as unknown as Record<string, unknown>).validatedQuery = validated;
      } else {
        (req as unknown as Record<string, unknown>)[target] = validated;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Validation failed", {
          code: "VALIDATION_ERROR",
          errors: errorMessages,
        });
        return;
      }

      // Re-throw unexpected errors
      throw error;
    }
  };

/**
 * Sanitizes string input to prevent XSS
 * Removes or escapes potentially dangerous characters
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers
    .trim();
};

/**
 * Creates a sanitizing string schema
 */
export const sanitizedString = (options?: { min?: number; max?: number }) =>
  z
    .string()
    .min(options?.min ?? 0)
    .max(options?.max ?? 1000)
    .transform(sanitizeString);

// ============================================
// Gap Recovery Validation Schemas
// ============================================

const dayOfWeekSchema = z.enum([
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
]);

export const gapAnalysisQuerySchema = z.object({
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  calendarId: z
    .string()
    .max(500, "Calendar ID must be less than 500 characters")
    .optional()
    .default("primary"),
  lookbackDays: z.coerce
    .number()
    .int()
    .min(1, "Lookback days must be at least 1")
    .max(90, "Lookback days cannot exceed 90")
    .optional()
    .default(7),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .optional()
    .default(10),
});

export const gapIdParamSchema = z.object({
  gapId: z.string().uuid("Invalid gap ID format").min(1, "Gap ID is required"),
});

export const fillGapSchema = z.object({
  summary: z
    .string()
    .min(1, "Event summary is required")
    .max(1000, "Summary must be less than 1000 characters")
    .transform(sanitizeString),
  description: z
    .string()
    .max(10000, "Description must be less than 10000 characters")
    .transform(sanitizeString)
    .optional(),
  location: z
    .string()
    .max(1000, "Location must be less than 1000 characters")
    .transform(sanitizeString)
    .optional(),
  calendarId: z
    .string()
    .max(500, "Calendar ID must be less than 500 characters")
    .optional(),
});

export const skipGapSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .transform(sanitizeString)
    .optional(),
});

const supportedEventLanguageSchema = z.enum([
  "en",
  "de",
  "fr",
  "he",
  "ar",
  "ru",
]);

export const updateGapSettingsSchema = z.object({
  autoGapAnalysis: z.boolean().optional(),
  minGapThreshold: z.coerce
    .number()
    .int()
    .min(5, "Minimum gap threshold must be at least 5 minutes")
    .max(480, "Minimum gap threshold cannot exceed 480 minutes")
    .optional(),
  maxGapThreshold: z.coerce
    .number()
    .int()
    .min(60, "Maximum gap threshold must be at least 60 minutes")
    .max(1440, "Maximum gap threshold cannot exceed 1440 minutes (24 hours)")
    .optional(),
  ignoredDays: z
    .array(dayOfWeekSchema)
    .max(7, "Cannot ignore more than 7 days")
    .optional(),
  lookbackDays: z.coerce
    .number()
    .int()
    .min(1, "Lookback days must be at least 1")
    .max(90, "Lookback days cannot exceed 90")
    .optional(),
  minConfidenceThreshold: z.coerce
    .number()
    .min(0, "Confidence threshold must be at least 0")
    .max(1, "Confidence threshold cannot exceed 1")
    .optional(),
  eventLanguages: z
    .array(supportedEventLanguageSchema)
    .min(1, "At least one language is required")
    .max(6, "Cannot select more than 6 languages")
    .optional(),
  languageSetupComplete: z.boolean().optional(),
});

export type GapAnalysisQuery = z.infer<typeof gapAnalysisQuerySchema>;
export type FillGapBody = z.infer<typeof fillGapSchema>;
export type SkipGapBody = z.infer<typeof skipGapSchema>;
export type UpdateGapSettingsBody = z.infer<typeof updateGapSettingsSchema>;

// ============================================
// User Preferences Validation Schemas
// ============================================

export const allyBrainSchema = z.object({
  enabled: z.boolean(),
  instructions: z
    .string()
    .max(1000, "Instructions must be 1000 characters or less")
    .transform(sanitizeString)
    .optional()
    .default(""),
});

export const contextualSchedulingSchema = z.object({
  enabled: z.boolean(),
});

export const preferenceKeyParamSchema = z.object({
  key: z.enum(["ally_brain", "contextual_scheduling"], {
    errorMap: () => ({
      message:
        "Invalid preference key. Must be 'ally_brain' or 'contextual_scheduling'",
    }),
  }),
});

export type AllyBrainBody = z.infer<typeof allyBrainSchema>;
export type ContextualSchedulingBody = z.infer<
  typeof contextualSchedulingSchema
>;
