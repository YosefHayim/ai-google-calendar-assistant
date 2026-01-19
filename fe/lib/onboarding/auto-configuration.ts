import type { DailyBriefingFormData, VoicePreferenceFormData } from '@/lib/validations/preferences'

import type { PersonaPreference } from '@/lib/validations/preferences'
import { preferencesService } from '@/services/preferences.service'

// Persona to feature configuration mapping
export interface FeatureConfiguration {
  // Ally Brain
  allyBrain?: {
    enabled: boolean
    instructions?: string
  }

  // Contextual Scheduling
  contextualScheduling?: {
    enabled: boolean
  }

  // Daily Briefing
  dailyBriefing?: {
    enabled: boolean
    time?: string
    timezone?: string
    channel?: 'email' | 'telegram' | 'whatsapp' | 'slack'
  }

  // Notification Settings
  notificationSettings?: {
    eventConfirmations: ('push' | 'email' | 'telegram')[]
    conflictAlerts: ('push' | 'email' | 'telegram')[]
    featureUpdates: ('push' | 'email' | 'telegram')[]
  }

  // Voice Preferences
  voicePreference?: {
    enabled: boolean
    voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'
    playbackSpeed?: number
  }

  // Display Preferences
  displayPreferences?: {
    timezone: string
    timeFormat: '12h' | '24h'
  }
}

// Persona-based auto-configuration
export const personaConfigurations: Record<string, FeatureConfiguration> = {
  solopreneur: {
    allyBrain: {
      enabled: true,
      instructions: `You are helping a solopreneur manage their business. Focus on:
- Client meeting optimization and follow-ups
- Invoice and payment tracking
- Business development opportunities
- Work-life balance for solo entrepreneurs
- Client communication best practices`,
    },
    contextualScheduling: {
      enabled: true,
    },
    dailyBriefing: {
      enabled: true,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push', 'email'],
      conflictAlerts: ['push'],
      featureUpdates: ['email'],
    },
    voicePreference: {
      enabled: true,
      voice: 'nova', // Friendly and professional
      playbackSpeed: 1,
    },
  },

  developer: {
    allyBrain: {
      enabled: true,
      instructions: `You are helping a software developer. Focus on:
- Deep work and focus time protection
- Technical meeting preparation
- Code review and development workflows
- Sprint planning and task estimation
- Minimizing context switching`,
    },
    contextualScheduling: {
      enabled: true,
    },
    dailyBriefing: {
      enabled: false, // Developers prefer minimal notifications
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push'], // Minimal notifications
      conflictAlerts: ['push'],
      featureUpdates: ['email'], // Weekly updates
    },
    voicePreference: {
      enabled: true,
      voice: 'alloy', // Clear and efficient
      playbackSpeed: 1,
    },
  },

  manager: {
    allyBrain: {
      enabled: true,
      instructions: `You are helping a team manager. Focus on:
- Team coordination and meeting optimization
- One-on-one and team meeting preparation
- Conflict resolution and scheduling diplomacy
- Team productivity and workload balancing
- Stakeholder communication`,
    },
    contextualScheduling: {
      enabled: true,
    },
    dailyBriefing: {
      enabled: true,
      time: '07:30',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'whatsapp',
    },
    notificationSettings: {
      eventConfirmations: ['push', 'telegram'],
      conflictAlerts: ['push', 'telegram'],
      featureUpdates: ['email'],
    },
    voicePreference: {
      enabled: true,
      voice: 'onyx', // Authoritative and clear
      playbackSpeed: 1,
    },
  },

  student: {
    allyBrain: {
      enabled: true,
      instructions: `You are helping a student. Focus on:
- Academic scheduling and study time blocks
- Assignment deadlines and exam preparation
- Study group coordination
- Academic calendar management
- Balance between studies and personal life`,
    },
    contextualScheduling: {
      enabled: true,
    },
    dailyBriefing: {
      enabled: true,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push'],
      conflictAlerts: ['push'],
      featureUpdates: ['email'],
    },
    voicePreference: {
      enabled: true,
      voice: 'nova', // Friendly and encouraging
      playbackSpeed: 1,
    },
  },

  freelancer: {
    allyBrain: {
      enabled: true,
      instructions: `You are helping a freelancer. Focus on:
- Client project management and deadlines
- Invoice tracking and payment reminders
- Multiple client coordination
- Rate optimization and business development
- Work-life balance for independent workers`,
    },
    contextualScheduling: {
      enabled: true,
    },
    dailyBriefing: {
      enabled: true,
      time: '09:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push', 'email'],
      conflictAlerts: ['push'],
      featureUpdates: ['email'],
    },
    voicePreference: {
      enabled: true,
      voice: 'alloy', // Professional and efficient
      playbackSpeed: 1,
    },
  },
}

// Pain point adjustments
export const painPointAdjustments: Record<string, Partial<FeatureConfiguration>> = {
  too_many_meetings: {
    allyBrain: {
      enabled: true,
      instructions:
        'Prioritize meeting optimization, suggest meeting limits, and help identify opportunities to reduce meeting load.',
    },
    notificationSettings: {
      eventConfirmations: ['push'], // Reduce email notifications
      conflictAlerts: ['push', 'email'], // Increase conflict alerts
      featureUpdates: ['email'], // Weekly updates
    },
  },

  no_deep_work: {
    allyBrain: {
      enabled: true,
      instructions: 'Focus on protecting deep work time, suggest optimal work blocks, and help minimize interruptions.',
    },
    dailyBriefing: {
      enabled: false, // Reduce notifications during deep work
      time: '17:00', // Evening briefing instead of morning
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push'], // Minimal notifications
      conflictAlerts: ['push'], // Only critical alerts
      featureUpdates: ['email'], // Weekly updates
    },
  },

  forgetting_tasks: {
    dailyBriefing: {
      enabled: true,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
    notificationSettings: {
      eventConfirmations: ['push', 'email'], // Ensure reminders
      conflictAlerts: ['push', 'email'], // Important alerts
      featureUpdates: ['email'],
    },
  },

  manual_scheduling: {
    allyBrain: {
      enabled: true,
      instructions: 'Emphasize automation features and help streamline the scheduling process.',
    },
    contextualScheduling: {
      enabled: true, // Enable smart scheduling
    },
  },
}

// Notification frequency adjustments
export const notificationFrequencyAdjustments: Record<string, Partial<FeatureConfiguration>> = {
  realtime: {
    notificationSettings: {
      eventConfirmations: ['push', 'email', 'telegram'],
      conflictAlerts: ['push', 'email', 'telegram'],
      featureUpdates: ['push', 'email'],
    },
    dailyBriefing: {
      enabled: false, // No daily briefings for realtime users
    },
  },

  daily_digest: {
    notificationSettings: {
      eventConfirmations: ['push'],
      conflictAlerts: ['push'],
      featureUpdates: ['email'],
    },
    dailyBriefing: {
      enabled: true,
      time: '08:00',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      channel: 'email',
    },
  },

  weekly_summary: {
    notificationSettings: {
      eventConfirmations: ['push'],
      conflictAlerts: ['push'],
      featureUpdates: ['email'],
    },
    dailyBriefing: {
      enabled: false,
    },
  },
}

/**
 * Generate auto-configuration based on persona, pain points, and notification preferences
 */
export function generateAutoConfiguration(
  persona: string,
  painPoints: string[],
  notificationFrequency: string,
): FeatureConfiguration {
  // Start with persona base configuration
  const baseConfig = personaConfigurations[persona] || {}

  // Apply pain point adjustments
  const configWithPainPoints = { ...baseConfig }
  painPoints.forEach((painPoint) => {
    const adjustments = painPointAdjustments[painPoint]
    if (adjustments) {
      Object.assign(configWithPainPoints, adjustments)
    }
  })

  // Apply notification frequency adjustments
  const finalConfig = { ...configWithPainPoints }
  const frequencyAdjustments = notificationFrequencyAdjustments[notificationFrequency]
  if (frequencyAdjustments) {
    Object.assign(finalConfig, frequencyAdjustments)
  }

  return finalConfig
}

/**
 * Apply the auto-configuration to user preferences
 */
export async function applyAutoConfiguration(
  persona: string,
  painPoints: string[],
  notificationFrequency: string,
): Promise<void> {
  const config = generateAutoConfiguration(persona, painPoints, notificationFrequency)

  // Apply each configuration setting
  const promises: Promise<any>[] = []

  if (config.allyBrain && config.allyBrain.instructions) {
    promises.push(
      preferencesService.updateAllyBrain({
        enabled: config.allyBrain.enabled,
        instructions: config.allyBrain.instructions,
      }),
    )
  }

  if (config.contextualScheduling) {
    promises.push(preferencesService.updateContextualScheduling(config.contextualScheduling))
  }

  if (
    config.dailyBriefing &&
    config.dailyBriefing.time &&
    config.dailyBriefing.timezone &&
    config.dailyBriefing.channel
  ) {
    promises.push(
      preferencesService.updateDailyBriefing({
        enabled: config.dailyBriefing.enabled,
        time: config.dailyBriefing.time,
        timezone: config.dailyBriefing.timezone,
        channel: config.dailyBriefing.channel,
      }),
    )
  }

  if (config.notificationSettings) {
    promises.push(preferencesService.updateNotificationSettings(config.notificationSettings))
  }

  if (config.voicePreference && config.voicePreference.playbackSpeed !== undefined) {
    promises.push(
      preferencesService.updateVoicePreference({
        enabled: config.voicePreference.enabled,
        voice: config.voicePreference.voice,
        playbackSpeed: config.voicePreference.playbackSpeed,
      }),
    )
  }

  if (config.displayPreferences) {
    promises.push(preferencesService.updateDisplayPreferences(config.displayPreferences))
  }

  await Promise.all(promises)
}
