// src/types/express.d.ts
import type { User } from "@supabase/supabase-js";
import type { GoogleTokenValidationResult } from "./middlewares/google-token-validation";
import type { calendar_v3 } from "googleapis";
import type { TokensProps } from "./types";

declare global {
  namespace Express {
    interface Request {
      user?: User
      googleTokenValidation?: GoogleTokenValidationResult
      validatedQuery?: Record<string, unknown>
      calendar?: calendar_v3.Calendar
      tokenData?: TokensProps
      requestId?: string
    }
  }
}
