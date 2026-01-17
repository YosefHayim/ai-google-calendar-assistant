import type { NextFunction, Request, Response } from "express"
import { escape as escapeHtml, trim } from "validator"
import { ZodError, type ZodSchema, z } from "zod"
import { STATUS_RESPONSE } from "@/config"
import { sendR } from "@/utils/http"

type ValidationTarget = "body" | "query" | "params"

export const validate =
  <T extends ZodSchema>(schema: T, target: ValidationTarget = "body") =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const dataToValidate = req[target]
      const validated = schema.parse(dataToValidate)

      if (target === "query") {
        (req as unknown as Record<string, unknown>).validatedQuery = validated
      } else {
        (req as unknown as Record<string, unknown>)[target] = validated
      }
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }))

        sendR(res, STATUS_RESPONSE.BAD_REQUEST, "Validation failed", {
          code: "VALIDATION_ERROR",
          errors: errorMessages,
        })
        return
      }

      throw error
    }
  }

export const sanitizeString = (input: string): string => trim(escapeHtml(input))

export const sanitizedString = (options?: { min?: number; max?: number }) =>
  z
    .string()
    .min(options?.min ?? 0)
    .max(options?.max ?? 1000)
    .transform(sanitizeString)
