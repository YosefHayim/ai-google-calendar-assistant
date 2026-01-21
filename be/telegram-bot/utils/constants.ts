export const COMMANDS = {
  // Session
  START: "/start",
  EXIT: "/exit",
  USAGE: "/usage",
  HELP: "/help",

  // View Schedule
  TODAY: "/today",
  TOMORROW: "/tomorrow",
  WEEK: "/week",
  MONTH: "/month",
  FREE: "/free",
  BUSY: "/busy",

  // Event Management
  CREATE: "/create",
  UPDATE: "/update",
  DELETE: "/delete",
  SEARCH: "/search",
  QUICK: "/quick",
  CANCEL: "/cancel",
  REMIND: "/remind",

  // Analytics & Insights
  ANALYTICS: "/analytics",
  CALENDARS: "/calendars",
  ABOUTME: "/aboutme",

  // Account
  STATUS: "/status",
  SETTINGS: "/settings",
  FEEDBACK: "/feedback",
  CHANGEEMAIL: "/changeemail",
  LANGUAGE: "/language",
  BRAIN: "/brain",
  PROFILE: "/profile",

  // Response Format
  ASTEXT: "/astext",
  ASVOICE: "/asvoice",

  // Links
  WEBSITE: "/website",

  // Smart Features
  RESCHEDULE: "/reschedule",
} as const

export const CONFIRM_RESPONSES = ["yes", "y", "confirm"] as const
export const CANCEL_RESPONSES = ["no", "n", "cancel"] as const

export type ConfirmResponse = (typeof CONFIRM_RESPONSES)[number]
export type CancelResponse = (typeof CANCEL_RESPONSES)[number]
