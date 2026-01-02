// Wrapper utilities
export { useQueryWrapper, type QueryHookOptions } from './useQueryWrapper'
export { useMutationWrapper, type MutationHookOptions } from './useMutationWrapper'

// Auth hooks
export { useUser, useSignIn, useSignUp, useVerifyOTP, useDeactivateUser, authService } from './auth'

// Calendar hooks
export {
  useCalendars,
  useCalendarById,
  useCalendarSettings,
  useCalendarColors,
  useCalendarTimezones,
  useFreeBusy,
} from './calendars'

// Event hooks
export {
  useEvents,
  useEventById,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useEventAnalytics,
  useQuickAddEvent,
  useMoveEvent,
  useWatchEvents,
} from './events'
