import { REDIRECT_URI, env } from "../env";

import { google } from "googleapis";

export const OAUTH2CLIENT = new google.auth.OAuth2(env.googleClientId, env.googleClientSecret, REDIRECT_URI);

export const CALENDAR = google.calendar({
  version: "v3",
  auth: OAUTH2CLIENT,
});
