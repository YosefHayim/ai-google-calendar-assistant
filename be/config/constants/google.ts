export enum GOOGLE_CALENDAR_SCOPES {
  OPEN_ID = "openid",
  EMAIL = "email",
  PROFILE = "profile",
  APP_CREATED = "https://www.googleapis.com/auth/calendar.app.created",
  EVENTS = "https://www.googleapis.com/auth/calendar.events",
  FULL_ACCESS = "https://www.googleapis.com/auth/calendar",
  READONLY = "https://www.googleapis.com/auth/calendar.readonly",
  CALENDAR_LIST = "https://www.googleapis.com/auth/calendar.calendarlist",
  CALENDAR_LIST_READONLY = "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  EVENTS_OWNED_READONLY = "https://www.googleapis.com/auth/calendar.events.owned.readonly",
  EVENTS_OWNED = "https://www.googleapis.com/auth/calendar.events.owned",
  FREEBUSY = "https://www.googleapis.com/auth/calendar.freebusy",
}

export const MAX_RESULTS = 2499;
export const SCOPES = Object.values(GOOGLE_CALENDAR_SCOPES);

export const SCOPES_STRING = SCOPES.join(" ");

export const REQUEST_CONFIG_BASE: {
  maxResults: number;
  sendUpdates: string;
  supportsAttachments: boolean;
} = {
  maxResults: MAX_RESULTS,
  sendUpdates: "all",
  supportsAttachments: true,
};
