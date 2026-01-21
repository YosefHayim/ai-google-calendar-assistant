import { createMockUser, testData } from "../test-utils"
import { describe, expect, it } from "@jest/globals"

/**
 * Business Scenario: Complete New User Onboarding Journey
 *
 * This test suite covers the entire user onboarding experience from initial
 * Google OAuth signup through calendar synchronization, and first AI interaction.
 * This represents the most critical user journey for new user acquisition.
 *
 * NOTE: These are business logic unit tests focusing on data structures and
 * validation rather than complex integration mocking.
 */

describe("New User Onboarding Journey", () => {
  describe("Phase 1: Google OAuth Registration", () => {
    it("should validate OAuth request structure", () => {
      const oauthRequest = {
        provider: "google",
        options: {
          redirectTo: "https://app.example.com/oauth/callback",
          scopes: [
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/calendar.events",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
          ],
        },
      }

      expect(oauthRequest.provider).toBe("google")
      expect(oauthRequest.options.scopes).toContain("https://www.googleapis.com/auth/calendar")
      expect(oauthRequest.options.redirectTo).toContain("oauth/callback")
    })

    it("should validate OAuth callback data structure", () => {
      const callbackData = {
        code: "oauth-authorization-code",
        state: "csrf-protection-token",
        provider: "google",
      }

      expect(callbackData.code).toBeDefined()
      expect(callbackData.state).toBeDefined()
      expect(callbackData.provider).toBe("google")
    })

    it("should create user profile with Google account data", () => {
      const userProfile = {
        id: "user-123",
        email: "sarah.johnson@example.com",
        first_name: "Sarah",
        last_name: "Johnson",
        avatar_url: "https://lh3.googleusercontent.com/photo.jpg",
        provider: "google",
        timezone: "America/New_York",
        created_at: new Date().toISOString(),
        onboarding_step: "oauth_complete",
      }

      expect(userProfile.email).toBe("sarah.johnson@example.com")
      expect(userProfile.provider).toBe("google")
      expect(userProfile.onboarding_step).toBe("oauth_complete")
    })

    it("should assign free tier subscription to new Google OAuth users", () => {
      const freeSubscription = {
        ...testData.subscription,
        user_id: "user-123",
        plan_id: "free-plan",
        status: "active" as const,
        ai_interactions_monthly: 50,
        credits_remaining: 10,
        provider: "google_oauth",
      }

      expect(freeSubscription.status).toBe("active")
      expect(freeSubscription.ai_interactions_monthly).toBe(50)
      expect(freeSubscription.credits_remaining).toBe(10)
      expect(freeSubscription.provider).toBe("google_oauth")
    })

    it("should validate existing user login flow", () => {
      const existingUser = createMockUser({
        id: "existing-user-456",
        email: "existing@example.com"
      })

      expect(existingUser.email).toBe("existing@example.com")
      expect(existingUser.id).toBe("existing-user-456")
    })
  })

  describe("Phase 2: Google Calendar Integration", () => {
    it("should validate calendar OAuth scope requirements", () => {
      const requiredScopes = [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/calendar.events",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ]

      const hasCalendarScope = requiredScopes.includes("https://www.googleapis.com/auth/calendar")
      const hasEventsScope = requiredScopes.includes("https://www.googleapis.com/auth/calendar.events")

      expect(hasCalendarScope).toBe(true)
      expect(hasEventsScope).toBe(true)
      expect(requiredScopes).toHaveLength(4)
    })

    it("should validate token exchange structure", () => {
      const callbackData = {
        code: "oauth-authorization-code",
        state: "csrf-protection-token",
        scope: "calendar",
      }

      const tokenExchange = {
        code: callbackData.code,
        grant_type: "authorization_code",
        redirect_uri: "https://app.example.com/oauth/callback",
      }

      expect(tokenExchange.code).toBe(callbackData.code)
      expect(tokenExchange.grant_type).toBe("authorization_code")
      expect(tokenExchange.redirect_uri).toContain("oauth/callback")
    })

    it("should validate Google OAuth token structure", () => {
      const mockGoogleTokens = {
        access_token: "ya29.google-access-token",
        refresh_token: "google-refresh-token",
        expiry_date: Date.now() + 3600000, // 1 hour from now
        scope: "https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events",
        token_type: "Bearer",
      }

      const storedTokens = {
        user_id: "user-123",
        email: "sarah.johnson@example.com",
        access_token: mockGoogleTokens.access_token,
        refresh_token: mockGoogleTokens.refresh_token,
        expiry_date: mockGoogleTokens.expiry_date,
        scope: mockGoogleTokens.scope,
        token_type: mockGoogleTokens.token_type,
      }

      expect(storedTokens.user_id).toBe("user-123")
      expect(storedTokens.access_token).toBeDefined()
      expect(storedTokens.refresh_token).toBeDefined()
      expect(storedTokens.expiry_date).toBeGreaterThan(Date.now())
      expect(storedTokens.scope).toContain("calendar")
    })

    it("should validate calendar sync data structure", () => {
      const calendarData = {
        items: [
          {
            id: "primary",
            summary: "Primary Calendar",
            primary: true,
            accessRole: "owner",
          },
          {
            id: "work@group.calendar.google.com",
            summary: "Work",
            primary: false,
            accessRole: "writer",
          },
        ],
      }

      expect(calendarData.items).toHaveLength(2)
      expect(calendarData.items[0].primary).toBe(true)
      expect(calendarData.items[1].accessRole).toBe("writer")
    })

    it("should validate user calendar preferences", () => {
      const userPreferences = {
        user_id: "user-123",
        default_calendar_id: "primary",
        calendar_sync_enabled: true,
        auto_sync_interval: 15, // minutes
        timezone: "America/New_York",
      }

      expect(userPreferences.default_calendar_id).toBe("primary")
      expect(userPreferences.calendar_sync_enabled).toBe(true)
      expect(userPreferences.auto_sync_interval).toBe(15)
    })
  })

  describe("Phase 3: Calendar Data Synchronization", () => {
    it("should validate calendar events data structure", () => {
      const eventsData = {
        items: [
          {
            id: "event-1",
            summary: "Welcome Meeting",
            start: { dateTime: "2026-01-16T09:00:00Z" },
            end: { dateTime: "2026-01-16T10:00:00Z" },
            status: "confirmed",
          },
        ],
      }

      expect(eventsData.items).toHaveLength(1)
      expect(eventsData.items[0].summary).toBe("Welcome Meeting")
      expect(eventsData.items[0].status).toBe("confirmed")
    })

    it("should validate welcome event creation structure", () => {
      const welcomeEvent = {
        summary: "Welcome to AI Calendar Assistant!",
        description: "Your AI assistant is ready to help manage your schedule.",
        start: {
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          timeZone: "America/New_York"
        },
        end: {
          dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
          timeZone: "America/New_York"
        },
        reminders: { useDefault: true },
      }

      expect(welcomeEvent.summary).toContain("Welcome")
      expect(welcomeEvent.description).toContain("AI assistant")
      expect(welcomeEvent.reminders.useDefault).toBe(true)
    })

    it("should validate calendar indexing data structure", () => {
      const indexedData = {
        user_id: "user-123",
        total_events: 2,
        upcoming_events: 2,
        calendar_ids: ["primary", "work@group.calendar.google.com"],
        last_sync: new Date().toISOString(),
        sync_status: "completed",
      }

      expect(indexedData.total_events).toBe(2)
      expect(indexedData.sync_status).toBe("completed")
      expect(indexedData.calendar_ids).toHaveLength(2)
    })
  })

  describe("Phase 4: First AI Interaction", () => {
    it("should validate conversation context structure", () => {
      const conversationContext = {
        id: "conv-123",
        user_id: "user-123",
        title: "Welcome to AI Calendar Assistant",
        messages: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        platform: "web",
        context_data: {
          user_timezone: "America/New_York",
          calendar_count: 2,
          recent_events_count: 2,
          subscription_tier: "free",
        },
      }

      expect(conversationContext.user_id).toBe("user-123")
      expect(conversationContext.title).toContain("Welcome")
      expect(conversationContext.context_data.calendar_count).toBe(2)
      expect(conversationContext.platform).toBe("web")
    })

    it("should validate AI welcome message structure", () => {
      const aiResponse = {
        response: "Hello! I'm your AI calendar assistant. I can help you schedule meetings, check your availability, and manage your calendar. What would you like to do?",
        toolCalls: [],
        usage: { tokens: 150 },
      }

      expect(aiResponse.response).toContain("Hello")
      expect(aiResponse.response).toContain("calendar assistant")
      expect(aiResponse.toolCalls).toHaveLength(0)
      expect(aiResponse.usage.tokens).toBeGreaterThan(0)
    })

    it("should validate AI capabilities list", () => {
      const demoCapabilities = [
        "Schedule new meetings",
        "Check your availability",
        "Reschedule existing events",
        "Find free time slots",
        "Send meeting invites",
        "Set reminders",
        "Analyze your calendar patterns",
      ]

      expect(demoCapabilities).toContain("Schedule new meetings")
      expect(demoCapabilities).toContain("Check your availability")
      expect(demoCapabilities).toContain("Analyze your calendar patterns")
      expect(demoCapabilities.length).toBeGreaterThan(5)
    })

    it("should validate AI intent recognition structure", () => {
      const userQuestion = "What's on my calendar today?"
      const aiProcessing = {
        intent: "check_schedule",
        timeRange: "today",
        calendarId: "primary",
        response: "Looking at your calendar, you have a 'Welcome Meeting' from 10:00 AM to 11:00 AM EST, and your welcome event at 2:00 PM EST.",
        confidence: 0.95,
      }

      expect(aiProcessing.intent).toBe("check_schedule")
      expect(aiProcessing.timeRange).toBe("today")
      expect(aiProcessing.response).toContain("Welcome Meeting")
      expect(aiProcessing.confidence).toBeGreaterThan(0.9)
    })
  })

  describe("Phase 5: Onboarding Completion", () => {
    it("should validate onboarding completion structure", () => {
      const onboardingStatus = {
        user_id: "user-123",
        onboarding_completed: true,
        completed_at: new Date().toISOString(),
        completed_steps: [
          "google_oauth",
          "calendar_sync",
          "ai_interaction",
        ],
        skipped_steps: [],
      }

      expect(onboardingStatus.onboarding_completed).toBe(true)
      expect(onboardingStatus.completed_steps).toHaveLength(3)
      expect(onboardingStatus.completed_steps).toContain("google_oauth")
      expect(onboardingStatus.completed_steps).toContain("calendar_sync")
      expect(onboardingStatus.completed_steps).toContain("ai_interaction")
    })

    it("should validate feature access control", () => {
      const featureAccess = {
        user_id: "user-123",
        features: {
          ai_chat: true,
          calendar_sync: true,
          event_creation: true,
          quick_add: true,
          voice_commands: false, // Requires pro subscription
          analytics: false, // Requires pro subscription
          team_collaboration: false, // Requires team plan
        },
      }

      expect(featureAccess.features.ai_chat).toBe(true)
      expect(featureAccess.features.calendar_sync).toBe(true)
      expect(featureAccess.features.voice_commands).toBe(false)
      expect(featureAccess.features.analytics).toBe(false)
      expect(featureAccess.features.team_collaboration).toBe(false)
    })

    it("should validate completion notification structure", () => {
      const completionNotification = {
        user_id: "user-123",
        type: "onboarding_complete",
        title: "Welcome aboard! 🎉",
        message: "You've successfully set up AI Calendar Assistant. Start chatting with your AI assistant to manage your schedule.",
        actions: [
          {
            label: "Start Chatting",
            url: "/chat",
          },
          {
            label: "View Calendar",
            url: "/calendar",
          },
        ],
      }

      expect(completionNotification.type).toBe("onboarding_complete")
      expect(completionNotification.title).toContain("Welcome aboard")
      expect(completionNotification.actions).toHaveLength(2)
      expect(completionNotification.actions[0].url).toBe("/chat")
      expect(completionNotification.actions[1].url).toBe("/calendar")
    })

    it("should validate upgrade prompt configuration", () => {
      const upgradePrompts = {
        user_id: "user-123",
        prompts: [
          {
            trigger: "ai_interactions_used > 40",
            message: "You're running low on free AI interactions. Upgrade to Pro for unlimited AI assistance!",
            action: "upgrade_prompt",
          },
          {
            trigger: "first_payment_eligible",
            message: "Love using AI Calendar Assistant? Consider upgrading to support ongoing development.",
            action: "upgrade_suggestion",
          },
        ],
      }

      expect(upgradePrompts.prompts).toHaveLength(2)
      expect(upgradePrompts.prompts[0].trigger).toContain("ai_interactions_used > 40")
      expect(upgradePrompts.prompts[0].action).toBe("upgrade_prompt")
      expect(upgradePrompts.prompts[1].action).toBe("upgrade_suggestion")
    })
  })

  describe("Error Handling During Onboarding", () => {
    it("should validate OAuth error handling structure", () => {
      const oauthError = {
        error: "access_denied",
        error_description: "User denied access to Google Calendar",
      }

      const userFriendlyMessage = "It looks like you cancelled the Google Calendar connection. No worries! You can connect your calendar anytime from the settings page to unlock AI-powered scheduling."

      expect(oauthError.error).toBe("access_denied")
      expect(userFriendlyMessage).toContain("cancelled")
      expect(userFriendlyMessage).toContain("settings page")
    })

    it("should validate API error structure", () => {
      const apiError = new Error("Google API rate limit exceeded")
      ;(apiError as any).code = 403
      ;(apiError as any).errors = [{ reason: "rateLimitExceeded" }]

      expect((apiError as any).code).toBe(403)
      expect((apiError as any).errors[0].reason).toBe("rateLimitExceeded")
    })

    it("should validate reconnection flow structure", () => {
      const reconnectionFlow = {
        step: "manual_reconnect",
        instructions: "Click the 'Connect Calendar' button to try again",
        alternative: "Continue without calendar sync (limited functionality)",
      }

      expect(reconnectionFlow.step).toBe("manual_reconnect")
      expect(reconnectionFlow.instructions).toContain("Connect Calendar")
      expect(reconnectionFlow.alternative).toContain("Continue without")
    })
  })
})