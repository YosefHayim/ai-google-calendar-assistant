import type { NextFunction, Request, Response } from "express";
import { escape as escapeHtml, trim } from "validator";
import { ZodError, type ZodSchema, z } from "zod";
import { STATUS_RESPONSE } from "@/config";
import { sendR } from "@/utils/http";

type ValidationTarget = "body" | "query" | "params";

/**
 * Create Express middleware for request validation using Zod schemas.
 *
 * Higher-order function that returns Express middleware for validating
 * request data against a Zod schema. Supports validation of body, query,
 * and params. Attaches validated data back to request and handles
 * validation errors with structured error responses.
 *
 * @param schema - Zod schema to validate against
 * @param target - Request property to validate ("body", "query", or "params")
 * @returns Express middleware function for validation
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

      throw error;
    }
  };

/**
 * Sanitize string input by trimming whitespace and escaping HTML.
 *
 * Applies security sanitization to user input strings by trimming
 * leading/trailing whitespace and escaping HTML entities to prevent
 * XSS attacks and improve data consistency.
 *
 * @param input - Raw string input to sanitize
 * @returns Sanitized string safe for storage and display
 */
export const sanitizeString = (input: string): string =>
  trim(escapeHtml(input));

/**
 * Create a Zod schema for sanitized strings with length validation.
 *
 * Returns a Zod string schema that enforces minimum/maximum length
 * and automatically sanitizes input by trimming and HTML escaping.
 * Useful for user input validation with built-in security measures.
 *
 * @param options - Length validation options
 * @param options.min - Minimum string length (default: 0)
 * @param options.max - Maximum string length (default: 1000)
 * @returns Zod string schema with sanitization transform
 */
export const sanitizedString = (options?: { min?: number; max?: number }) =>
  z
    .string()
    .min(options?.min ?? 0)
    .max(options?.max ?? 1000)
    .transform(sanitizeString);
