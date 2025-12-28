import { calendar_v3, google } from "googleapis";

import { OAUTH2CLIENT } from "@/config";
import type { TokensProps } from "@/types";
import { asyncHandler } from "../http/async-handlers";
import { updateUserSupabaseTokens } from "../auth/update-tokens-of-user";

/**
 * Initialize calendar with user tokens and update tokens
 *
 * @param {TokensProps} tokens - The tokens of the user.
 * @returns {Promise<calendar_v3.Calendar>} The initialized calendar.
 * @description Initializes the calendar with the user tokens and updates the tokens in Supabase.
 * @example
 * const data = await initUserSupabaseCalendarWithTokensAndUpdateTokens(tokens);
 * console.log(data);
 */
export const initUserSupabaseCalendarWithTokensAndUpdateTokens = asyncHandler(async (tokens: TokensProps): Promise<calendar_v3.Calendar> => {
  OAUTH2CLIENT.setCredentials(tokens);

  const newTokens = await OAUTH2CLIENT.getAccessToken().catch((e) => {
    const data = e?.response?.data;
    const msg = data?.error || e?.message;
    const desc = data?.error_description;
    console.error("OAuth invalid_grant", {
      msg,
      desc,
      client_id: OAUTH2CLIENT._clientId,
    });
    throw new Error(`invalid grant: ${msg}${desc ? ` - ${desc}` : ""}`);
  });

  if (newTokens?.token) {
    await updateUserSupabaseTokens(tokens, newTokens);
  }

  return google.calendar({ version: "v3", auth: OAUTH2CLIENT, responseType: "json" });
});
