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
  {
    key: "voice_input",
    name: "Voice Input",
    description: "Enable voice input for chat interface",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "voice_output",
    name: "Voice Output (TTS)",
    description: "Enable text-to-speech for AI responses",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "realtime_mode",
    name: "Realtime Voice Mode",
    description: "Enable OpenAI realtime voice conversation mode",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "gap_recovery",
    name: "Gap Recovery",
    description: "Detect and fill untracked time gaps in calendar",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "smart_scheduling",
    name: "Smart Scheduling",
    description: "AI-powered optimal time slot suggestions",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
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
    key: "telegram_bot",
    name: "Telegram Bot Integration",
    description: "Access Ally via Telegram bot",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "whatsapp_bot",
    name: "WhatsApp Bot Integration",
    description: "Access Ally via WhatsApp bot",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "production",
  },
  {
    key: "slack_integration",
    name: "Slack Integration",
    description: "Connect Ally to Slack workspace",
    enabled: false,
    rolloutPercentage: 0,
    allowedTiers: ["enterprise"],
    environment: "all",
  },
  {
    key: "analytics_dashboard",
    name: "Analytics Dashboard",
    description: "Calendar analytics and insights dashboard",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
  {
    key: "focus_time_blocks",
    name: "Focus Time Blocks",
    description: "Auto-schedule and protect focus time",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "meeting_prep",
    name: "Meeting Preparation",
    description: "AI-generated meeting prep notes and reminders",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
    environment: "all",
  },
  {
    key: "multi_calendar",
    name: "Multi-Calendar Support",
    description: "Manage multiple Google calendars",
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
    key: "conversation_history",
    name: "Conversation History",
    description: "Persistent conversation history across sessions",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: [],
    environment: "all",
  },
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
  {
    key: "custom_ally_brain",
    name: "Custom Ally Brain",
    description: "Personalize AI assistant behavior and personality",
    enabled: true,
    rolloutPercentage: 100,
    allowedTiers: ["pro", "enterprise"],
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
