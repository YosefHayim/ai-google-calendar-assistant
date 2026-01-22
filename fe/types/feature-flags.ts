export const FEATURE_FLAG_KEYS = {
  // Voice & Realtime
  VOICE_INPUT: 'voice_input',
  VOICE_OUTPUT: 'voice_output',
  REALTIME_MODE: 'realtime_mode',

  // Calendar Features
  GAP_RECOVERY: 'gap_recovery',
  SMART_SCHEDULING: 'smart_scheduling',
  MULTI_CALENDAR: 'multi_calendar',
  EVENT_CONFLICTS_DETECTION: 'event_conflicts_detection',
  QUICK_ADD_EVENTS: 'quick_add_events',
  EVENT_RESCHEDULING: 'event_rescheduling',
  VIDEO_CONFERENCING: 'video_conferencing',
  CUSTOM_REMINDERS: 'custom_reminders',
  CALENDAR_SHARING: 'calendar_sharing',
  CALENDAR_WEBHOOKS: 'calendar_webhooks',
  TIMEZONE_MANAGEMENT: 'timezone_management',

  // AI & Productivity
  DAILY_BRIEFING: 'daily_briefing',
  FOCUS_TIME_BLOCKS: 'focus_time_blocks',
  MEETING_PREP: 'meeting_prep',
  CUSTOM_ALLY_BRAIN: 'custom_ally_brain',
  CONVERSATION_HISTORY: 'conversation_history',
  IMAGE_UPLOAD: 'image_upload',

  // AI Providers
  GEMINI_AGENT: 'gemini_agent',
  CLAUDE_AGENT: 'claude_agent',

  // Bot Integrations
  TELEGRAM_BOT: 'telegram_bot',
  WHATSAPP_BOT: 'whatsapp_bot',
  SLACK_INTEGRATION: 'slack_integration',

  // Dashboard & Analytics
  ANALYTICS_DASHBOARD: 'analytics_dashboard',
  ADMIN_DASHBOARD: 'admin_dashboard',
  BILLING_MANAGEMENT: 'billing_management',

  // Team & Collaboration
  TEAM_COLLABORATION: 'team_collaboration',
  SHARED_CALENDAR_LINKS: 'shared_calendar_links',
  REFERRAL_SYSTEM: 'referral_system',

  // UI & UX
  DARK_MODE: 'dark_mode',
  MULTI_LANGUAGE: 'multi_language',
  ONBOARDING_FLOW: 'onboarding_flow',
  THREE_D_VISUALIZATIONS: '3d_visualizations',
  COMMAND_PALETTE: 'command_palette',

  // Storage
  FILE_ATTACHMENTS: 'file_attachments',

  // Marketing & Growth
  NEWSLETTER_SUBSCRIPTION: 'newsletter_subscription',
  WAITING_LIST: 'waiting_list',
  BLOG: 'blog',
  AFFILIATE_PROGRAM: 'affiliate_program',

  // External Integrations
  OUTLOOK_INTEGRATION: 'outlook_integration',
  GOOGLE_CALENDAR_SYNC: 'google_calendar_sync',

  // System & Infrastructure
  CRON_JOBS: 'cron_jobs',
  WEBSOCKET_REALTIME: 'websocket_realtime',
  SSE_STREAMING: 'sse_streaming',
} as const

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[keyof typeof FEATURE_FLAG_KEYS]
