'use client'

import { useIsFeatureEnabled } from '@/contexts/FeatureFlagContext'
import { FEATURE_FLAG_KEYS } from '@/types/feature-flags'

export function useFeatureFlags() {
  return {
    voiceInput: useIsFeatureEnabled(FEATURE_FLAG_KEYS.VOICE_INPUT),
    voiceOutput: useIsFeatureEnabled(FEATURE_FLAG_KEYS.VOICE_OUTPUT),
    realtimeMode: useIsFeatureEnabled(FEATURE_FLAG_KEYS.REALTIME_MODE),

    gapRecovery: useIsFeatureEnabled(FEATURE_FLAG_KEYS.GAP_RECOVERY),
    smartScheduling: useIsFeatureEnabled(FEATURE_FLAG_KEYS.SMART_SCHEDULING),
    multiCalendar: useIsFeatureEnabled(FEATURE_FLAG_KEYS.MULTI_CALENDAR),
    eventConflictsDetection: useIsFeatureEnabled(FEATURE_FLAG_KEYS.EVENT_CONFLICTS_DETECTION),
    quickAddEvents: useIsFeatureEnabled(FEATURE_FLAG_KEYS.QUICK_ADD_EVENTS),
    eventRescheduling: useIsFeatureEnabled(FEATURE_FLAG_KEYS.EVENT_RESCHEDULING),
    videoConferencing: useIsFeatureEnabled(FEATURE_FLAG_KEYS.VIDEO_CONFERENCING),
    customReminders: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CUSTOM_REMINDERS),
    calendarSharing: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CALENDAR_SHARING),
    calendarWebhooks: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CALENDAR_WEBHOOKS),
    timezoneManagement: useIsFeatureEnabled(FEATURE_FLAG_KEYS.TIMEZONE_MANAGEMENT),

    dailyBriefing: useIsFeatureEnabled(FEATURE_FLAG_KEYS.DAILY_BRIEFING),
    focusTimeBlocks: useIsFeatureEnabled(FEATURE_FLAG_KEYS.FOCUS_TIME_BLOCKS),
    meetingPrep: useIsFeatureEnabled(FEATURE_FLAG_KEYS.MEETING_PREP),
    customAllyBrain: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CUSTOM_ALLY_BRAIN),
    conversationHistory: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CONVERSATION_HISTORY),
    imageUpload: useIsFeatureEnabled(FEATURE_FLAG_KEYS.IMAGE_UPLOAD),

    geminiAgent: useIsFeatureEnabled(FEATURE_FLAG_KEYS.GEMINI_AGENT),
    claudeAgent: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CLAUDE_AGENT),

    telegramBot: useIsFeatureEnabled(FEATURE_FLAG_KEYS.TELEGRAM_BOT),
    whatsappBot: useIsFeatureEnabled(FEATURE_FLAG_KEYS.WHATSAPP_BOT),
    slackIntegration: useIsFeatureEnabled(FEATURE_FLAG_KEYS.SLACK_INTEGRATION),

    analyticsDashboard: useIsFeatureEnabled(FEATURE_FLAG_KEYS.ANALYTICS_DASHBOARD),
    adminDashboard: useIsFeatureEnabled(FEATURE_FLAG_KEYS.ADMIN_DASHBOARD),
    billingManagement: useIsFeatureEnabled(FEATURE_FLAG_KEYS.BILLING_MANAGEMENT),

    teamCollaboration: useIsFeatureEnabled(FEATURE_FLAG_KEYS.TEAM_COLLABORATION),
    sharedCalendarLinks: useIsFeatureEnabled(FEATURE_FLAG_KEYS.SHARED_CALENDAR_LINKS),
    referralSystem: useIsFeatureEnabled(FEATURE_FLAG_KEYS.REFERRAL_SYSTEM),

    darkMode: useIsFeatureEnabled(FEATURE_FLAG_KEYS.DARK_MODE),
    multiLanguage: useIsFeatureEnabled(FEATURE_FLAG_KEYS.MULTI_LANGUAGE),
    onboardingFlow: useIsFeatureEnabled(FEATURE_FLAG_KEYS.ONBOARDING_FLOW),
    threeDVisualizations: useIsFeatureEnabled(FEATURE_FLAG_KEYS.THREE_D_VISUALIZATIONS),
    commandPalette: useIsFeatureEnabled(FEATURE_FLAG_KEYS.COMMAND_PALETTE),

    fileAttachments: useIsFeatureEnabled(FEATURE_FLAG_KEYS.FILE_ATTACHMENTS),

    newsletterSubscription: useIsFeatureEnabled(FEATURE_FLAG_KEYS.NEWSLETTER_SUBSCRIPTION),
    waitingList: useIsFeatureEnabled(FEATURE_FLAG_KEYS.WAITING_LIST),
    blog: useIsFeatureEnabled(FEATURE_FLAG_KEYS.BLOG),
    affiliateProgram: useIsFeatureEnabled(FEATURE_FLAG_KEYS.AFFILIATE_PROGRAM),

    outlookIntegration: useIsFeatureEnabled(FEATURE_FLAG_KEYS.OUTLOOK_INTEGRATION),
    googleCalendarSync: useIsFeatureEnabled(FEATURE_FLAG_KEYS.GOOGLE_CALENDAR_SYNC),

    cronJobs: useIsFeatureEnabled(FEATURE_FLAG_KEYS.CRON_JOBS),
    websocketRealtime: useIsFeatureEnabled(FEATURE_FLAG_KEYS.WEBSOCKET_REALTIME),
    sseStreaming: useIsFeatureEnabled(FEATURE_FLAG_KEYS.SSE_STREAMING),
  }
}

export { FEATURE_FLAG_KEYS }
