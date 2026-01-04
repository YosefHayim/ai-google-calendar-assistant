/**
 * Templates module exports
 */

// Calendar templates
export {
  weeklyCalendarTemplate,
  todayScheduleTemplate,
  tomorrowScheduleTemplate,
  eventListTemplate,
  freeTimeTemplate,
  busyTimeTemplate,
  monthlyOverviewTemplate,
} from "./calendar";

// Notification templates
export {
  // Success
  eventCreatedTemplate,
  eventUpdatedTemplate,
  eventDeletedTemplate,
  successTemplate,
  // Errors
  eventNotFoundTemplate,
  connectionErrorTemplate,
  permissionErrorTemplate,
  timeConflictTemplate,
  errorTemplate,
  // Info/Notifications
  welcomeTemplate,
  sessionEndedTemplate,
  helpTemplate,
  statusTemplate,
  settingsTemplate,
  feedbackTemplate,
  loadingTemplate,
  confirmationTemplate,
} from "./notifications";
