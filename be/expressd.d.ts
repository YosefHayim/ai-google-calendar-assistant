// src/types/express.d.ts
import { User } from "@supabase/supabase-js";
import { GoogleTokenValidationResult } from "./middlewares/google-token-validation";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      googleTokenValidation?: GoogleTokenValidationResult;
    }
  }
}
