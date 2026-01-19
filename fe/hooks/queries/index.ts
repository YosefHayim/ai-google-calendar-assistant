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
export { useGoogleCalendarStatus, useDisconnectGoogleCalendar, useSlackStatus } from './integrations'

// Gap Recovery hooks
export { useGaps, useFillGap, useSkipGap, useDismissAllGaps, useDisableGapAnalysis } from './gaps'

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
  useCrossPlatformSync,
  useUpdateCrossPlatformSync,
  useGeoLocation,
  useUpdateGeoLocation,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useDisplayPreferences,
  useUpdateDisplayPreferences,
  useTimezonesList,
} from './preferences'

// Billing hooks
export { billingKeys, useSubscriptionStatus, usePlans, useBillingOverview, useBillingData } from './billing'

// Blog hooks
export {
  blogKeys,
  useBlogPosts,
  useBlogPost,
  useBlogCategories,
  useFeaturedPosts,
  useRelatedPosts,
  useAvailableCategories,
  useCreateBlogPost,
  useGenerateAIBlogPost,
} from './blog'

// Feature flag hooks
export {
  featureFlagKeys,
  useFeatureFlags,
  useFeatureFlagByKey,
  useCheckFeatureFlag,
  useEnabledFeatureFlags,
  useCreateFeatureFlag,
  useUpdateFeatureFlag,
  useToggleFeatureFlag,
  useDeleteFeatureFlag,
  useFeatureFlag,
} from './feature-flags'
export type { FeatureFlag, CreateFeatureFlagInput, UpdateFeatureFlagInput } from './feature-flags'

// Storage hooks
export { useUploadAvatar, useUploadAttachment, useDeleteFile, useGetFileUrl, useListUserFiles } from './storage'
