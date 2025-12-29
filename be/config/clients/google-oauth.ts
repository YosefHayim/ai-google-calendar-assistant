import { REDIRECT_URI, env } from "../env";

import { google } from "googleapis";

/**
 * Google OAuth client
 *
 * @description Creates a new Google OAuth client.
 */
export const OAUTH2CLIENT = new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);

/**
 * Google Calendar client
 *
 * @description Creates a new Google Calendar client.
 */
export const CALENDAR = google.calendar({
  version: "v3",
  auth: OAUTH2CLIENT,
});
