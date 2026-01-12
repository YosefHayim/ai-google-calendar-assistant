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

// Conversation hooks
export {
  useConversations,
  useConversation,
  useGetConversationById,
  useDeleteConversationById,
  useDeleteAllConversations,
  useResetMemory,
  useUpdateConversationById,
  useRefreshConversations,
} from './conversations'

// Integration hooks
export { useGoogleCalendarStatus, useDisconnectGoogleCalendar } from './integrations'

// Gap Recovery hooks
export {
  useGaps,
  useGapSettings,
  useFillGap,
  useSkipGap,
  useDismissAllGaps,
  useUpdateGapSettings,
  useDisableGapAnalysis,
} from './gaps'

// User Preferences hooks
export {
  useAllyBrain,
  useUpdateAllyBrain,
  useContextualScheduling,
  useUpdateContextualScheduling,
  useReminderDefaults,
  useUpdateReminderDefaults,
  useVoicePreference,
  useUpdateVoicePreference,
  useDailyBriefing,
  useUpdateDailyBriefing,
} from './preferences'

// Billing hooks
export {
  billingKeys,
  useSubscriptionStatus,
  usePlans,
  useBillingOverview,
  useBillingData,
} from './billing'
