export enum GOOGLE_CALENDAR_SCOPES {
  OPEN_ID = "openid",
  EMAIL = "email",
  PROFILE = "profile",
  EVENTS = "https://www.googleapis.com/auth/calendar.events",
  CALENDAR_LIST_READONLY = "https://www.googleapis.com/auth/calendar.calendarlist.readonly",
  FREEBUSY = "https://www.googleapis.com/auth/calendar.freebusy",
}

export const MAX_RESULTS = 2499
export const SCOPES = Object.values(GOOGLE_CALENDAR_SCOPES)

export const SCOPES_STRING = SCOPES.join(" ")

export const REQUEST_CONFIG_BASE: {
  maxResults: number
  sendUpdates: string
  supportsAttachments: boolean
} = {
  maxResults: MAX_RESULTS,
  sendUpdates: "all",
  supportsAttachments: true,
}
