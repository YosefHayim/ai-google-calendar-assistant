#!/usr/bin/env bun

import { SUPABASE } from "@/config/clients"

const SEED_LOG_PREFIX = "[FeatureFlagSeed]"

type FeatureFlagDefinition = {
  key: string
  name: string
  description: string
  enabled: boolean
  rolloutPercentage: number
  allowedTiers: string[]
  environment: "development" | "staging" | "production" | "all"
}

const FEATURE_FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE & REALTIME
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "voice_input",
    name: "Voice Input",
    description: "Enable voice input for chat interface via browser speech API",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "voice_output",
    name: "Voice Output (TTS)",
    description: "Enable text-to-speech for AI responses with caching",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "realtime_mode",
    name: "Realtime Voice Mode",
    description: "Enable OpenAI realtime voice conversation mode for hands-free interaction",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // CALENDAR FEATURES
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "gap_recovery",
    name: "Gap Recovery",
    description: "Detect and fill untracked time gaps in calendar with AI suggestions",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "smart_scheduling",
    name: "Smart Scheduling",
    description: "AI-powered optimal time slot suggestions based on user patterns",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "multi_calendar",
    name: "Multi-Calendar Support",
    description: "Manage multiple Google calendars with AI auto-selection",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "event_conflicts_detection",
    name: "Event Conflicts Detection",
    description: "Automatically detect and warn about scheduling conflicts across all calendars",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "quick_add_events",
    name: "Quick Add Events",
    description: "Create events using natural language parsing",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "event_rescheduling",
    name: "Smart Rescheduling",
    description: "AI-powered reschedule suggestions with conflict avoidance",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "video_conferencing",
    name: "Video Conferencing Links",
    description: "Auto-generate Google Meet links for events",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "custom_reminders",
    name: "Custom Reminders",
    description: "Set and manage custom reminder preferences per user and event",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "calendar_sharing",
    name: "Calendar Sharing (ACL)",
    description: "Share calendars with other users and manage access permissions",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "calendar_webhooks",
    name: "Calendar Webhooks",
    description: "Real-time calendar change notifications via webhooks",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "timezone_management",
    name: "Timezone Management",
    description: "Automatic timezone detection and conversion for events",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI & PRODUCTIVITY
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "daily_briefing",
    name: "Daily Briefing",
    description: "Automated daily schedule summary notifications",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "focus_time_blocks",
    name: "Focus Time Blocks",
    description: "Auto-schedule and protect deep work time",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "meeting_prep",
    name: "Meeting Preparation",
    description: "AI-generated meeting prep notes and context reminders",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "custom_ally_brain",
    name: "Custom Ally Brain",
    description: "Personalize AI assistant behavior, preferences, and memory",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "conversation_history",
    name: "Conversation History",
    description: "Persistent conversation history with AI-generated titles",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "image_upload",
    name: "Image Upload",
    description: "Upload images for AI vision analysis in chat",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "ocr_file_upload",
    name: "OCR File Upload",
    description:
      "Extract calendar events from uploaded images, PDFs, ICS, and spreadsheet files using AI vision",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AI PROVIDERS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "gemini_agent",
    name: "Gemini Agent",
    description: "Use Google Gemini as alternative AI provider",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "all",
  },
  {
    key: "claude_agent",
    name: "Claude Agent",
    description: "Use Anthropic Claude as alternative AI provider",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BOT INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "telegram_bot",
    name: "Telegram Bot Integration",
    description: "Access Ally via Telegram bot with natural language commands",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "whatsapp_bot",
    name: "WhatsApp Bot Integration",
    description: "Access Ally via WhatsApp bot for conversational calendar management",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "production",
  },
  {
    key: "slack_integration",
    name: "Slack Integration",
    description: "Connect Ally to Slack workspace for team calendar coordination",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD & ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "analytics_dashboard",
    name: "Analytics Dashboard",
    description: "Calendar analytics with 12+ interactive chart components",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "admin_dashboard",
    name: "Admin Dashboard",
    description: "Admin panel for user management, audit logs, and system monitoring",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "billing_management",
    name: "Billing Management",
    description: "Subscription management and payment history via Lemon Squeezy",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // TEAM & COLLABORATION
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "team_collaboration",
    name: "Team Collaboration",
    description: "Team invites, shared calendars, and collaborative scheduling",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "shared_calendar_links",
    name: "Shared Calendar Links",
    description: "Generate public shareable links for calendar views",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "referral_system",
    name: "Referral System",
    description: "User referral program with rewards and tracking",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // UI & UX
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "dark_mode",
    name: "Dark Mode",
    description: "Dark theme with cinematic glow toggle option",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "multi_language",
    name: "Multi-Language Support",
    description: "i18n support for English, Hebrew, Arabic, German, French, Russian with RTL",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "onboarding_flow",
    name: "Onboarding Flow",
    description: "Guided onboarding tour for new users",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "3d_visualizations",
    name: "3D Visualizations",
    description: "Three.js calendar wall and interactive 3D components",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "command_palette",
    name: "Command Palette",
    description: "Quick navigation and actions via Cmd+K / Ctrl+K",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STORAGE & ATTACHMENTS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "file_attachments",
    name: "File Attachments",
    description: "Upload and attach files to events via Supabase storage",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MARKETING & GROWTH
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "newsletter_subscription",
    name: "Newsletter Subscription",
    description: "Email newsletter signup and management",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "waiting_list",
    name: "Waiting List",
    description: "Early access waiting list signup",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "blog",
    name: "Blog",
    description: "Blog content management and display",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "affiliate_program",
    name: "Affiliate Program",
    description: "Affiliate tracking and commission management",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: [],
    environment: "production",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EXTERNAL INTEGRATIONS
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "outlook_integration",
    name: "Outlook Integration",
    description: "Microsoft Outlook/365 calendar sync via Graph API",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "all",
  },
  {
    key: "google_calendar_sync",
    name: "Google Calendar Sync",
    description: "Core Google Calendar integration with OAuth",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SYSTEM & INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════════════════
  {
    key: "cron_jobs",
    name: "Cron Jobs",
    description: "Scheduled background tasks for notifications and maintenance",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "websocket_realtime",
    name: "WebSocket Realtime",
    description: "Real-time updates via WebSocket connections",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "sse_streaming",
    name: "SSE Streaming",
    description: "Server-Sent Events for streaming AI chat responses",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
]

type UpsertResult = {
  success: boolean
  key: string
  action: "created" | "updated" | "unchanged" | "error"
  error?: string
}

async function upsertFeatureFlag(definition: FeatureFlagDefinition): Promise<UpsertResult> {
  const { data: existing, error: fetchError } = await SUPABASE.from("feature_flags")
    .select("id, enabled, rollout_percentage, allowed_tiers")
    .eq("key", definition.key)
    .maybeSingle()

  if (fetchError) {
    return {
      success: false,
      key: definition.key,
      action: "error",
      error: fetchError.message,
    }
  }

  if (existing) {
    const hasChanges =
      existing.enabled !== definition.enabled ||
      existing.rollout_percentage !== definition.rolloutPercentage ||
      JSON.stringify(existing.allowed_tiers) !== JSON.stringify(definition.allowedTiers)

    if (!hasChanges) {
      return { success: true, key: definition.key, action: "unchanged" }
    }

    const { error: updateError } = await SUPABASE.from("feature_flags")
      .update({
        name: definition.name,
        description: definition.description,
        enabled: definition.enabled,
        rollout_percentage: definition.rolloutPercentage,
        allowed_tiers: definition.allowedTiers,
        environment: definition.environment,
      })
      .eq("id", existing.id)

    if (updateError) {
      return { success: false, key: definition.key, action: "error", error: updateError.message }
    }

    return { success: true, key: definition.key, action: "updated" }
  }

  const { error: insertError } = await SUPABASE.from("feature_flags").insert({
    key: definition.key,
    name: definition.name,
    description: definition.description,
    enabled: definition.enabled,
    rollout_percentage: definition.rolloutPercentage,
    allowed_tiers: definition.allowedTiers,
    allowed_user_ids: [],
    metadata: {},
    environment: definition.environment,
  })

  if (insertError) {
    return { success: false, key: definition.key, action: "error", error: insertError.message }
  }

  return { success: true, key: definition.key, action: "created" }
}

async function seedFeatureFlags(): Promise<void> {
  console.log(`\n${SEED_LOG_PREFIX} Starting feature flags seed`)
  console.log(`${SEED_LOG_PREFIX} Flags to process: ${FEATURE_FLAG_DEFINITIONS.length}\n`)

  const results: UpsertResult[] = []

  for (const definition of FEATURE_FLAG_DEFINITIONS) {
    const result = await upsertFeatureFlag(definition)
    results.push(result)

    const iconMap: Record<string, string> = { error: "✗", unchanged: "○" }
    const icon = iconMap[result.action] || "✓"
    const errorSuffix = result.error ? ` (${result.error})` : ""
    console.log(`  ${icon} ${definition.key}: ${result.action}${errorSuffix}`)
  }

  const summary = {
    created: results.filter((r) => r.action === "created").length,
    updated: results.filter((r) => r.action === "updated").length,
    unchanged: results.filter((r) => r.action === "unchanged").length,
    errors: results.filter((r) => r.action === "error").length,
  }

  console.log(`\n${SEED_LOG_PREFIX} Seed completed`)
  console.log(`  Created: ${summary.created}`)
  console.log(`  Updated: ${summary.updated}`)
  console.log(`  Unchanged: ${summary.unchanged}`)
  console.log(`  Errors: ${summary.errors}`)

  if (summary.errors > 0) {
    process.exit(1)
  }
}

seedFeatureFlags().catch((error) => {
  console.error(`${SEED_LOG_PREFIX} Seed failed:`, error)
  process.exit(1)
})
