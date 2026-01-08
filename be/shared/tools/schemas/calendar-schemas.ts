import { z } from "zod"
import validator from "validator"

export const emailSchema = z.coerce
  .string({
    description: "The email address of the user.",
  })
  .includes("@", { message: "Must include @ symbol" })
  .refine((v) => validator.isEmail(v), { message: "Invalid email address." })

export const registerUserSchema = z.object({
  email: emailSchema.describe("The email address of the user."),
  name: z.string().optional().describe("Optional name of the user."),
})

export const generateAuthUrlSchema = z.object({})

export const selectCalendarSchema = z.object({
  summary: z.coerce.string().optional(),
  description: z.coerce.string().optional(),
  location: z.coerce.string().optional(),
})

export const validateUserSchema = z.object({})

export const getTimezoneSchema = z.object({})

export type RegisterUserParams = z.infer<typeof registerUserSchema>
export type SelectCalendarParams = z.infer<typeof selectCalendarSchema>
