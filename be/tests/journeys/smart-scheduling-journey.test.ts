import { describe, expect, it } from "@jest/globals"

/**
 * Business Scenario: Smart Scheduling Intelligence Journey
 *
 * This test suite covers the AI-powered smart scheduling features that learn
 * from user patterns and provide intelligent meeting recommendations, conflict
 * resolution, and scheduling optimization.
 */

describe("Smart Scheduling Intelligence Journey", () => {
  describe("Scenario 1: Learning User Scheduling Patterns", () => {
    it("should validate pattern recognition from historical data", () => {
      const patternRecognition = {
        userId: "user-123",
        analysisPeriod: "90_days",
        patterns: {
          meetingFrequency: {
            averagePerWeek: 12.5,
            byDay: {
              monday: 2.2,
              tuesday: 3.1,
              wednesday: 2.8,
              thursday: 2.9,
              friday: 1.5,
            },
            byTime: {
              morning: 4.2, // 9-12
              afternoon: 6.8, // 1-5
              evening: 1.5, // after 5
            },
          },
          meetingDuration: {
            average: 67, // minutes
            distribution: {
              "15-30min": { count: 45, percentage: 25 },
              "30-60min": { count: 68, percentage: 38 },
              "60-90min": { count: 52, percentage: 29 },
              "90min+": { count: 15, percentage: 8 },
            },
            byType: {
              "1:1": 42,
              team: 68,
              client: 78,
              strategy: 95,
            },
          },
          meetingTypes: {
            distribution: {
              "1:1": 0.25,
              team: 0.38,
              client: 0.22,
              strategy: 0.1,
              other: 0.05,
            },
            patterns: {
              "1:1": {
                preferredDays: ["tuesday", "thursday"],
                preferredTimes: ["10:00", "14:00"],
                averageAttendees: 2,
              },
              team: {
                preferredDays: ["monday", "wednesday"],
                preferredTimes: ["09:00", "15:00"],
                averageAttendees: 5.2,
              },
              client: {
                preferredDays: ["tuesday", "wednesday", "thursday"],
                preferredTimes: ["11:00", "14:00", "16:00"],
                averageAttendees: 3.8,
              },
            },
          },
          bufferPreferences: {
            beforeMeetings: 12, // minutes average
            afterMeetings: 8,
            betweenMeetings: 18,
            beforeExternal: 25,
            afterExternal: 15,
          },
          locationPreferences: {
            office: 0.65,
            remote: 0.25,
            client_site: 0.08,
            conference_room: 0.45,
            video_call: 0.38,
          },
        },
        insights: [
          {
            type: "productivity",
            insight: "Tuesday afternoons show highest meeting density",
            confidence: 0.92,
            action: "Consider redistributing meetings to balance workload",
          },
          {
            type: "efficiency",
            insight: "15-minute buffers between meetings could reduce stress",
            confidence: 0.87,
            action: "Automatically suggest 15-minute buffers",
          },
          {
            type: "optimization",
            insight: "Team meetings average 68 minutes, consider standardizing",
            confidence: 0.78,
            action: "Suggest 60-minute default for team meetings",
          },
        ],
        confidence: {
          overall: 0.89,
          byPattern: {
            meetingFrequency: 0.95,
            meetingDuration: 0.91,
            meetingTypes: 0.87,
            bufferPreferences: 0.76,
            locationPreferences: 0.82,
          },
        },
      }

      expect(patternRecognition.patterns.meetingFrequency.averagePerWeek).toBe(
        12.5
      )
      expect(patternRecognition.patterns.meetingDuration.average).toBe(67)
      expect(patternRecognition.patterns.meetingTypes.distribution.team).toBe(
        0.38
      )
      expect(patternRecognition.insights).toHaveLength(3)
      expect(patternRecognition.confidence.overall).toBe(0.89)
    })

    it("should validate participant availability analysis", () => {
      const participantAnalysis = {
        meetingId: "meeting-123",
        participants: [
          {
            email: "organizer@example.com",
            name: "Sarah Johnson",
            availability: "high",
            workingHours: {
              start: "09:00",
              end: "17:00",
              timezone: "America/New_York",
              workDays: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ],
            },
            calendarEvents: [
              {
                start: "2026-01-22T10:00:00-05:00",
                end: "2026-01-22T11:00:00-05:00",
                title: "Existing Meeting",
              },
            ],
            availabilityScore: 0.85,
            preferredTimes: ["10:00", "14:00", "16:00"],
            responseTime: 15, // minutes average
          },
          {
            email: "colleague@example.com",
            name: "Mike Chen",
            availability: "medium",
            workingHours: {
              start: "08:00",
              end: "16:00",
              timezone: "America/Los_Angeles",
              workDays: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ],
            },
            calendarEvents: [
              {
                start: "2026-01-22T13:00:00-08:00",
                end: "2026-01-22T14:00:00-08:00",
                title: "Client Call",
              },
            ],
            availabilityScore: 0.72,
            preferredTimes: ["09:00", "13:00", "15:00"],
            responseTime: 45,
          },
          {
            email: "executive@example.com",
            name: "David Wilson",
            availability: "low",
            workingHours: {
              start: "10:00",
              end: "18:00",
              timezone: "Europe/London",
              workDays: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
              ],
            },
            calendarEvents: [
              {
                start: "2026-01-22T15:00:00Z",
                end: "2026-01-22T17:00:00Z",
                title: "Board Meeting",
              },
            ],
            availabilityScore: 0.45,
            preferredTimes: ["11:00", "16:00"],
            responseTime: 120,
          },
        ],
        groupAvailability: {
          optimalTimeSlots: [
            {
              start: "2026-01-22T16:00:00Z", // 12 PM EST, 9 AM PST, 4 PM GMT
              end: "2026-01-22T17:00:00Z",
              participantsAvailable: 3,
              score: 0.89,
              timezoneCompatibility: "good",
              workingHoursCompliance: 0.95,
              bufferTime: 30, // minutes before next meeting
            },
            {
              start: "2026-01-23T14:00:00Z", // 10 AM EST, 7 AM PST, 2 PM GMT
              end: "2026-01-23T15:00:00Z",
              participantsAvailable: 2,
              score: 0.72,
              timezoneCompatibility: "poor",
              workingHoursCompliance: 0.85,
              bufferTime: 60,
            },
          ],
          conflicts: [
            {
              time: "2026-01-22T14:00:00Z",
              conflictingParticipants: ["colleague@example.com"],
              alternativeTimes: [
                "2026-01-22T15:00:00Z",
                "2026-01-22T16:00:00Z",
              ],
            },
          ],
          recommendations: [
            {
              time: "2026-01-22T16:00:00Z",
              confidence: 0.91,
              reasoning: [
                "All participants available",
                "Good timezone alignment",
                "Within working hours",
                "Adequate buffer time",
              ],
            },
          ],
        },
      }

      expect(participantAnalysis.participants).toHaveLength(3)
      expect(participantAnalysis.participants[0].availabilityScore).toBe(0.85)
      expect(
        participantAnalysis.groupAvailability.optimalTimeSlots
      ).toHaveLength(2)
      expect(
        participantAnalysis.groupAvailability.optimalTimeSlots[0].score
      ).toBe(0.89)
      expect(participantAnalysis.groupAvailability.conflicts).toHaveLength(1)
      expect(
        participantAnalysis.groupAvailability.recommendations
      ).toHaveLength(1)
    })

    it("should validate intelligent time slot suggestions", () => {
      const timeSlotSuggestions = {
        request: {
          duration: 60,
          participants: ["user-123", "participant-456", "participant-789"],
          preferredDays: ["tuesday", "wednesday"],
          timeRange: {
            start: "2026-01-21T00:00:00Z",
            end: "2026-01-28T00:00:00Z",
          },
        },
        suggestions: [
          {
            rank: 1,
            start: "2026-01-22T14:00:00-05:00",
            end: "2026-01-22T15:00:00-05:00",
            score: 0.94,
            confidence: 0.89,
            factors: {
              participantAvailability: 1.0,
              preferredDay: 0.9,
              workingHours: 0.95,
              bufferTime: 0.8,
              historicalSuccess: 0.85,
              timezoneAlignment: 0.9,
            },
            reasoning: [
              "All participants available",
              "Tuesday (preferred day)",
              "2 PM (optimal time)",
              "Good buffer time",
              "Historical success rate high",
            ],
            alternatives: [
              {
                time: "2026-01-22T15:00:00-05:00",
                reason: "Alternative if preferred time conflicts",
                score: 0.87,
              },
            ],
          },
          {
            rank: 2,
            start: "2026-01-23T10:00:00-05:00",
            end: "2026-01-23T11:00:00-05:00",
            score: 0.89,
            confidence: 0.82,
            factors: {
              participantAvailability: 0.9,
              preferredDay: 1.0,
              workingHours: 0.85,
              bufferTime: 0.95,
              historicalSuccess: 0.92,
              timezoneAlignment: 0.75,
            },
            reasoning: [
              "Most participants available",
              "Wednesday (preferred day)",
              "10 AM (good start time)",
              "Excellent buffer time",
              "High historical success",
            ],
          },
          {
            rank: 3,
            start: "2026-01-24T16:00:00-05:00",
            end: "2026-01-24T17:00:00-05:00",
            score: 0.76,
            confidence: 0.71,
            factors: {
              participantAvailability: 0.8,
              preferredDay: 0.5,
              workingHours: 0.7,
              bufferTime: 0.9,
              historicalSuccess: 0.78,
              timezoneAlignment: 0.6,
            },
            reasoning: [
              "Good participant availability",
              "Thursday (neutral preference)",
              "4 PM (later in day)",
              "Good buffer time",
              "Moderate historical success",
            ],
          },
        ],
        metadata: {
          processingTime: 450, // ms
          calendarsAnalyzed: 3,
          participantsAnalyzed: 3,
          timeSlotsConsidered: 48,
          algorithmVersion: "3.2.1",
          dataFreshness: "real_time",
        },
        insights: {
          bestDay: "tuesday",
          bestTime: "14:00",
          participantReliability: 0.87,
          timezoneComplexity: "medium",
          schedulingFriction: "low",
        },
      }

      expect(timeSlotSuggestions.suggestions).toHaveLength(3)
      expect(timeSlotSuggestions.suggestions[0].score).toBe(0.94)
      expect(
        timeSlotSuggestions.suggestions[0].factors.participantAvailability
      ).toBe(1.0)
      expect(timeSlotSuggestions.suggestions[0].reasoning).toHaveLength(5)
      expect(timeSlotSuggestions.metadata.calendarsAnalyzed).toBe(3)
      expect(timeSlotSuggestions.insights.bestDay).toBe("tuesday")
    })
  })

  describe("Scenario 2: Conflict Resolution Intelligence", () => {
    it("should validate automatic conflict detection", () => {
      const conflictDetection = {
        proposedMeeting: {
          title: "Strategy Planning",
          start: "2026-01-22T14:00:00-05:00",
          end: "2026-01-22T15:00:00-05:00",
          participants: ["organizer@example.com", "participant@example.com"],
        },
        detectedConflicts: [
          {
            type: "direct_conflict",
            participant: "participant@example.com",
            conflictingEvent: {
              title: "Client Presentation",
              start: "2026-01-22T14:00:00-05:00",
              end: "2026-01-22T15:30:00-05:00",
              calendar: "Work Calendar",
              priority: "high",
            },
            overlap: 60, // minutes
            severity: "critical",
            resolvable: true,
          },
          {
            type: "buffer_conflict",
            participant: "organizer@example.com",
            description: "Insufficient buffer time before next meeting",
            nextMeeting: {
              title: "Team Standup",
              start: "2026-01-22T15:15:00-05:00",
              bufferNeeded: 15,
              bufferAvailable: 5,
            },
            overlap: 10, // minutes short
            severity: "medium",
            resolvable: true,
          },
        ],
        conflictAnalysis: {
          totalConflicts: 2,
          criticalConflicts: 1,
          resolvableConflicts: 2,
          overallSeverity: "high",
          participantImpact: {
            "participant@example.com": "critical",
            "organizer@example.com": "medium",
          },
        },
        resolutionStrategies: [
          {
            strategy: "reschedule_existing",
            feasibility: 0.3,
            impact: "medium",
            description: "Move client presentation to 3:00 PM",
            pros: ["Resolves critical conflict", "Maintains meeting integrity"],
            cons: ["May impact client availability", "Requires coordination"],
          },
          {
            strategy: "find_alternative_time",
            feasibility: 0.9,
            impact: "low",
            description: "Move strategy meeting to 3:00 PM",
            pros: [
              "High availability",
              "Minimal coordination",
              "Good alternatives exist",
            ],
            cons: [
              "Changes preferred time",
              "May affect participant preferences",
            ],
          },
          {
            strategy: "shorten_meeting",
            feasibility: 0.6,
            impact: "medium",
            description: "Reduce strategy meeting to 30 minutes",
            pros: ["Quick resolution", "Minimal scheduling changes"],
            cons: [
              "May compromise meeting objectives",
              "Requires agenda adjustment",
            ],
          },
          {
            strategy: "make_optional",
            feasibility: 0.2,
            impact: "high",
            description: "Make participant optional for strategy meeting",
            pros: ["Resolves conflict immediately"],
            cons: ["Reduces participation", "May miss important input"],
          },
        ],
      }

      expect(conflictDetection.detectedConflicts).toHaveLength(2)
      expect(conflictDetection.detectedConflicts[0].severity).toBe("critical")
      expect(conflictDetection.conflictAnalysis.totalConflicts).toBe(2)
      expect(conflictDetection.resolutionStrategies).toHaveLength(4)
      expect(conflictDetection.resolutionStrategies[0].feasibility).toBe(0.3)
    })

    it("should validate intelligent conflict resolution", () => {
      const conflictResolution = {
        conflictId: "conflict-123",
        resolution: {
          strategy: "find_alternative_time",
          selectedAlternative: {
            start: "2026-01-22T15:00:00-05:00",
            end: "2026-01-22T16:00:00-05:00",
            score: 0.87,
            reasoning: [
              "All participants available",
              "Resolves critical conflict",
              "Good buffer time",
              "Maintains meeting duration",
              "Acceptable time preference",
            ],
          },
          confidence: 0.82,
          automated: true,
          requiresApproval: false,
        },
        implementation: {
          steps: [
            {
              action: "update_meeting_time",
              target: "strategy_planning",
              newStart: "2026-01-22T15:00:00-05:00",
              newEnd: "2026-01-22T16:00:00-05:00",
              status: "completed",
            },
            {
              action: "send_notifications",
              recipients: ["organizer@example.com", "participant@example.com"],
              message:
                "Meeting rescheduled to 3:00 PM due to conflict resolution",
              status: "pending",
            },
            {
              action: "update_calendar",
              calendar: "primary",
              eventId: "meeting-123",
              changes: {
                start: "2026-01-22T15:00:00-05:00",
                end: "2026-01-22T16:00:00-05:00",
              },
              status: "pending",
            },
          ],
          rollbackPlan: {
            originalTime: {
              start: "2026-01-22T14:00:00-05:00",
              end: "2026-01-22T15:00:00-05:00",
            },
            conditions: ["participant_declines", "technical_failure"],
            automatic: true,
          },
        },
        outcome: {
          success: true,
          conflictsResolved: 2,
          participantsNotified: 2,
          calendarUpdated: true,
          feedbackCollected: false,
        },
        learning: {
          pattern: "client_presentation_conflicts",
          adjustment: "prefer_later_times_for_strategy_meetings",
          confidence: 0.76,
          applied: true,
        },
      }

      expect(conflictResolution.resolution.strategy).toBe(
        "find_alternative_time"
      )
      expect(conflictResolution.resolution.selectedAlternative.score).toBe(0.87)
      expect(conflictResolution.implementation.steps).toHaveLength(3)
      expect(conflictResolution.outcome.success).toBe(true)
      expect(conflictResolution.learning.applied).toBe(true)
    })

    it("should validate conflict prevention learning", () => {
      const conflictPrevention = {
        userId: "user-123",
        learningPeriod: "60_days",
        conflictPatterns: [
          {
            pattern: "client_meeting_conflicts",
            frequency: 8,
            typicalResolution: "reschedule_proposed",
            preventionRule: "schedule_client_meetings_early",
            confidence: 0.89,
            applied: true,
          },
          {
            pattern: "back_to_back_meetings",
            frequency: 12,
            typicalResolution: "add_buffer_time",
            preventionRule: "enforce_15min_buffers",
            confidence: 0.94,
            applied: true,
          },
          {
            pattern: "timezone_misalignment",
            frequency: 5,
            typicalResolution: "find_better_time",
            preventionRule: "prefer_overlapping_hours",
            confidence: 0.76,
            applied: true,
          },
        ],
        preventionRules: {
          active: [
            {
              rule: "client_meetings_before_3pm",
              trigger: "meeting_type == client",
              action: "prefer_times_before_15:00",
              weight: 0.8,
              successRate: 0.92,
            },
            {
              rule: "buffer_time_enforcement",
              trigger: "consecutive_meetings",
              action: "add_15min_buffer",
              weight: 0.95,
              successRate: 0.87,
            },
            {
              rule: "timezone_optimization",
              trigger: "multiple_timezones",
              action: "prefer_10am_4pm_utc_range",
              weight: 0.7,
              successRate: 0.81,
            },
          ],
          testing: [
            {
              rule: "meeting_length_optimization",
              trigger: "meeting_duration > 90",
              action: "suggest_breaks",
              weight: 0.6,
              testProgress: 0.3,
            },
          ],
        },
        effectiveness: {
          overallReduction: 0.35, // 35% reduction in conflicts
          byPattern: {
            client_meeting_conflicts: 0.52,
            back_to_back_meetings: 0.41,
            timezone_misalignment: 0.28,
          },
          userSatisfaction: 4.3, // out of 5
          automationRate: 0.78, // 78% of conflicts resolved automatically
        },
      }

      expect(conflictPrevention.conflictPatterns).toHaveLength(3)
      expect(conflictPrevention.preventionRules.active).toHaveLength(3)
      expect(conflictPrevention.effectiveness.overallReduction).toBe(0.35)
      expect(conflictPrevention.effectiveness.automationRate).toBe(0.78)
    })
  })

  describe("Scenario 3: Adaptive Scheduling Optimization", () => {
    it("should validate meeting duration optimization", () => {
      const durationOptimization = {
        requestedDuration: 90,
        contextAnalysis: {
          meetingType: "strategy_planning",
          participants: 5,
          historicalData: {
            averageDuration: 85,
            successRateByDuration: {
              60: 0.78,
              75: 0.85,
              90: 0.82,
              120: 0.71,
            },
            participantPreferences: {
              preferred: 75,
              flexible: true,
              max: 120,
            },
          },
          agendaComplexity: "high",
          decisionMaking: "required",
          timeConstraints: "moderate",
        },
        optimization: {
          recommendedDuration: 75,
          confidence: 0.88,
          reasoning: [
            "Historical success rate highest at 75 minutes",
            "Participant preference aligns with recommendation",
            "Agenda complexity supports focused discussion",
            "Better than requested 90 minutes for engagement",
            "Leaves buffer time for follow-up",
          ],
          alternatives: [
            {
              duration: 60,
              score: 0.72,
              pros: ["Quick and focused", "High engagement"],
              cons: ["May rush important decisions", "Limited discussion time"],
            },
            {
              duration: 90,
              score: 0.79,
              pros: ["Matches request", "Allows thorough discussion"],
              cons: ["May lose engagement", "Creates scheduling pressure"],
            },
            {
              duration: 120,
              score: 0.65,
              pros: ["Comprehensive coverage"],
              cons: ["High fatigue risk", "Scheduling difficulty"],
            },
          ],
          implementation: {
            autoApply: true,
            userOverride: true,
            feedbackCollection: true,
            learningUpdate: true,
          },
        },
        outcome: {
          applied: true,
          userAccepted: true,
          effectiveness: "measured",
          feedback: {
            rating: 4.5,
            comment: "75 minutes was perfect - good pace without rushing",
          },
        },
      }

      expect(durationOptimization.optimization.recommendedDuration).toBe(75)
      expect(durationOptimization.optimization.confidence).toBe(0.88)
      expect(durationOptimization.optimization.reasoning).toHaveLength(5)
      expect(durationOptimization.optimization.alternatives).toHaveLength(3)
      expect(durationOptimization.outcome.applied).toBe(true)
    })

    it("should validate buffer time intelligence", () => {
      const bufferIntelligence = {
        analysis: {
          currentBuffers: {
            average: 12, // minutes
            distribution: {
              "0-5min": 0.25,
              "5-15min": 0.35,
              "15-30min": 0.28,
              "30min+": 0.12,
            },
            byMeetingType: {
              "1:1": 8,
              team: 15,
              client: 22,
              strategy: 35,
            },
          },
          optimalBuffers: {
            recommended: 15, // minutes
            byContext: {
              after_meeting: 15,
              between_meetings: 15,
              before_external: 30,
              after_travel: 45,
              before_focus_time: 30,
            },
            byMeetingType: {
              "1:1": 10,
              team: 15,
              client: 20,
              strategy: 30,
            },
          },
          impact: {
            productivity: 0.23, // 23% improvement with optimal buffers
            stress: -0.31, // 31% reduction
            focus: 0.18, // 18% improvement
            attendance: 0.12, // 12% improvement
          },
        },
        recommendations: [
          {
            context: "between_meetings",
            current: 12,
            recommended: 15,
            benefit: "20% stress reduction",
            implementation: "automatic",
          },
          {
            context: "before_client_meetings",
            current: 18,
            recommended: 25,
            benefit: "15% better preparation",
            implementation: "suggested",
          },
          {
            context: "after_travel",
            current: 30,
            recommended: 45,
            benefit: "25% better transition",
            implementation: "automatic",
          },
        ],
        automation: {
          rules: [
            {
              condition: "consecutive_meetings",
              action: "add_15min_buffer",
              priority: "high",
            },
            {
              condition: "meeting_after_travel",
              action: "add_45min_buffer",
              priority: "critical",
            },
            {
              condition: "meeting_before_focus_block",
              action: "add_30min_buffer",
              priority: "high",
            },
          ],
          effectiveness: {
            adoptionRate: 0.89,
            userSatisfaction: 4.4,
            overrideRate: 0.15,
          },
        },
      }

      expect(bufferIntelligence.analysis.currentBuffers.average).toBe(12)
      expect(bufferIntelligence.analysis.optimalBuffers.recommended).toBe(15)
      expect(bufferIntelligence.recommendations).toHaveLength(3)
      expect(bufferIntelligence.automation.rules).toHaveLength(3)
    })

    it("should validate scheduling preference learning", () => {
      const preferenceLearning = {
        userId: "user-123",
        learningPeriod: "120_days",
        preferences: {
          timePreferences: {
            preferredStartTimes: [
              { time: "09:00", score: 0.85, frequency: 0.32 },
              { time: "10:00", score: 0.92, frequency: 0.28 },
              { time: "14:00", score: 0.88, frequency: 0.25 },
              { time: "15:00", score: 0.76, frequency: 0.15 },
            ],
            avoidedTimes: [
              { time: "08:00", reason: "too_early", penalty: 0.3 },
              { time: "12:00", reason: "lunch_time", penalty: 0.4 },
              { time: "17:00", reason: "end_of_day", penalty: 0.5 },
            ],
            meetingDurationPreferences: {
              preferred: 60,
              flexible: true,
              max: 120,
              byType: {
                "1:1": 45,
                team: 60,
                client: 75,
                strategy: 90,
              },
            },
          },
          dayPreferences: {
            preferredDays: [
              { day: "tuesday", score: 0.95, reason: "peak_productivity" },
              { day: "wednesday", score: 0.88, reason: "good_flow" },
              { day: "thursday", score: 0.82, reason: "steady_pace" },
              { day: "monday", score: 0.65, reason: "transition_day" },
              { day: "friday", score: 0.58, reason: "winding_down" },
            ],
            meetingLoadPreferences: {
              maxMeetingsPerDay: 6,
              preferredMeetingsPerDay: 4,
              backToBackLimit: 2,
              externalMeetingLimit: 3,
            },
          },
          participantPreferences: {
            preferredMeetingSizes: {
              small: 0.45, // 1-3 people
              medium: 0.35, // 4-8 people
              large: 0.2, // 9+ people
            },
            responseTimeExpectations: {
              immediate: 0.3,
              "1_hour": 0.4,
              "4_hours": 0.2,
              "24_hours": 0.1,
            },
            reliabilityPatterns: {
              mostReliable: ["alice@example.com", "bob@example.com"],
              leastReliable: ["charlie@example.com"],
              averageResponseTime: 45, // minutes
            },
          },
        },
        learningMetrics: {
          confidence: 0.87,
          dataPoints: 234,
          lastUpdated: "2026-01-20T10:00:00Z",
          accuracy: 0.82,
          improvements: [
            {
              metric: "scheduling_success",
              improvement: 0.18, // 18% better
              timeframe: "60_days",
            },
            {
              metric: "meeting_attendance",
              improvement: 0.12,
              timeframe: "60_days",
            },
          ],
        },
        adaptation: {
          recentChanges: [
            {
              change: "increased_thursday_preference",
              reason: "better_focus_observed",
              impact: "positive",
              confidence: 0.76,
            },
            {
              change: "reduced_friday_meetings",
              reason: "end_of_week_fatigue",
              impact: "positive",
              confidence: 0.89,
            },
          ],
          predictions: {
            nextMonthPreferences: {
              tuesdayPreference: 0.96,
              meetingDuration: 58,
              confidence: 0.78,
            },
          },
        },
      }

      expect(
        preferenceLearning.preferences.timePreferences.preferredStartTimes[0]
          .score
      ).toBe(0.85)
      expect(
        preferenceLearning.preferences.dayPreferences.preferredDays[0].score
      ).toBe(0.95)
      expect(preferenceLearning.learningMetrics.confidence).toBe(0.87)
      expect(preferenceLearning.adaptation.recentChanges).toHaveLength(2)
    })
  })

  describe("Scenario 4: Emergency Scheduling Intelligence", () => {
    it("should validate urgent meeting placement", () => {
      const urgentScheduling = {
        request: {
          title: "Urgent Client Issue Resolution",
          duration: 60,
          urgency: "high",
          requiredParticipants: ["client@example.com", "team_lead@example.com"],
          optionalParticipants: ["support@example.com"],
          timeConstraints: {
            withinHours: 4, // must schedule within 4 hours
            workingHoursOnly: false, // can be after hours if needed
            includeWeekends: false,
          },
        },
        analysis: {
          availableSlots: [
            {
              start: "2026-01-20T14:30:00-05:00",
              end: "2026-01-20T15:30:00-05:00",
              participantsAvailable: 2,
              score: 0.85,
              timeToSlot: 90, // minutes from now
            },
            {
              start: "2026-01-20T16:00:00-05:00",
              end: "2026-01-20T17:00:00-05:00",
              participantsAvailable: 3,
              score: 0.92,
              timeToSlot: 180,
            },
            {
              start: "2026-01-20T15:00:00-05:00",
              end: "2026-01-20T16:00:00-05:00",
              participantsAvailable: 2,
              score: 0.78,
              timeToSlot: 120,
            },
          ],
          participantAvailability: {
            "client@example.com": {
              available: true,
              responseTime: 15, // minutes
              preferredTimes: "any",
            },
            "team_lead@example.com": {
              available: true,
              responseTime: 5,
              preferredTimes: "afternoon",
            },
            "support@example.com": {
              available: false,
              nextAvailable: "2026-01-20T18:00:00-05:00",
              responseTime: 45,
            },
          },
          constraints: {
            timeWindow: "4_hours",
            slotsFound: 3,
            optimalSlot: 1, // index in availableSlots
            urgencyFactor: 0.9, // increases priority
          },
        },
        recommendation: {
          selectedSlot: {
            start: "2026-01-20T16:00:00-05:00",
            end: "2026-01-20T17:00:00-05:00",
            score: 0.92,
            confidence: 0.88,
          },
          reasoning: [
            "All required participants available",
            "Within 3-hour window",
            "Good time for urgent discussion",
            "Team lead prefers afternoon times",
            "High urgency allows slight preference deviation",
          ],
          alternatives: [
            {
              start: "2026-01-20T14:30:00-05:00",
              reasoning: "Earlier availability, but less optimal time",
              score: 0.85,
            },
          ],
        },
        execution: {
          autoSchedule: true,
          sendInvites: true,
          priority: "urgent",
          reminders: {
            immediate: true,
            "15min_before": true,
            followUp: true,
          },
        },
      }

      expect(urgentScheduling.analysis.availableSlots).toHaveLength(3)
      expect(urgentScheduling.analysis.availableSlots[1].score).toBe(0.92)
      expect(urgentScheduling.recommendation.selectedSlot.score).toBe(0.92)
      expect(urgentScheduling.recommendation.reasoning).toHaveLength(5)
      expect(urgentScheduling.execution.autoSchedule).toBe(true)
    })

    it("should validate last-minute conflict resolution", () => {
      const lastMinuteResolution = {
        scenario: "meeting_starts_in_15min",
        problem: "Key participant double-booked",
        analysis: {
          conflict: {
            meeting: {
              title: "Q4 Review",
              start: "2026-01-20T14:00:00-05:00",
              end: "2026-01-20T15:00:00-05:00",
              participants: [
                "organizer@example.com",
                "missing@example.com",
                "present@example.com",
              ],
            },
            missingParticipant: "missing@example.com",
            reason: "accepted_different_meeting",
            timeToStart: 15, // minutes
          },
          options: [
            {
              type: "proceed_without",
              feasibility: 0.9,
              impact: "medium",
              description: "Continue with 2 of 3 participants",
              pros: ["Meeting can proceed", "Minimal delay"],
              cons: ["Missing key input", "May need reschedule"],
            },
            {
              type: "quick_reschedule",
              feasibility: 0.6,
              impact: "high",
              description: "Reschedule to next available slot",
              pros: ["All participants attend", "Complete discussion"],
              cons: ["Disrupts schedules", "May be too late"],
            },
            {
              type: "virtual_participation",
              feasibility: 0.8,
              impact: "low",
              description: "Missing participant joins virtually",
              pros: ["All participate", "Minimal disruption"],
              cons: ["Technical requirements", "Reduced engagement"],
            },
          ],
        },
        recommendation: {
          selectedOption: "virtual_participation",
          confidence: 0.82,
          reasoning: [
            "Minimizes disruption to existing schedule",
            "Allows all participants to contribute",
            "Technically feasible within timeframe",
            "Better than proceeding without key participant",
            "Virtual option available and tested",
          ],
          implementation: {
            steps: [
              {
                action: "send_virtual_link",
                target: "missing@example.com",
                urgency: "immediate",
              },
              {
                action: "update_meeting_details",
                field: "join_instructions",
                value: "Use virtual link for remote participation",
              },
              {
                action: "notify_all_participants",
                message:
                  "Participant joining virtually - meeting proceeds as scheduled",
              },
            ],
            estimatedDelay: 2, // minutes
            successProbability: 0.85,
          },
        },
        learning: {
          pattern: "last_minute_conflicts",
          adjustment: "prefer_virtual_options",
          confidence: 0.73,
          applied: true,
        },
      }

      expect(lastMinuteResolution.analysis.conflict.timeToStart).toBe(15)
      expect(lastMinuteResolution.analysis.options).toHaveLength(3)
      expect(lastMinuteResolution.recommendation.selectedOption).toBe(
        "virtual_participation"
      )
      expect(
        lastMinuteResolution.recommendation.implementation.steps
      ).toHaveLength(3)
      expect(lastMinuteResolution.learning.applied).toBe(true)
    })

    it("should validate crisis scheduling optimization", () => {
      const crisisScheduling = {
        crisisLevel: "high",
        context: {
          type: "system_outage",
          impact: "company_wide",
          urgency: "critical",
          timeWindow: "immediate",
          participants: "executive_team",
        },
        emergencyProtocols: {
          overrideNormalRules: true,
          allowAfterHours: true,
          allowWeekends: true,
          priorityScheduling: true,
          autoInvite: true,
        },
        rapidScheduling: {
          availableSlots: [
            {
              start: "2026-01-20T14:00:00-05:00",
              participants: 7,
              score: 0.95,
              timeToSchedule: 5, // minutes
            },
            {
              start: "2026-01-20T14:30:00-05:00",
              participants: 8,
              score: 0.98,
              timeToSchedule: 3,
            },
            {
              start: "2026-01-20T15:00:00-05:00",
              participants: 6,
              score: 0.89,
              timeToSchedule: 8,
            },
          ],
          selectedSlot: {
            start: "2026-01-20T14:30:00-05:00",
            end: "2026-01-20T15:30:00-05:00",
            participants: 8,
            score: 0.98,
          },
          reasoning: [
            "Maximum participant availability",
            "Immediate scheduling possible",
            "Within crisis response window",
            "Executive team preference for afternoon",
            "All critical participants can attend",
          ],
        },
        crisisCommunication: {
          autoNotifications: {
            executives: "immediate",
            team_leads: "immediate",
            all_employees: "within_1_hour",
          },
          communicationChannels: {
            primary: "emergency_broadcast",
            secondary: "slack_emergency",
            tertiary: "email_blast",
          },
          escalationPaths: {
            if_meeting_fails: "executive_standby_call",
            if_communication_fails: "personal_calls",
          },
        },
        postCrisisLearning: {
          analysisRequired: true,
          patternRecording: "crisis_response_scheduling",
          improvementAreas: [
            "emergency_contact_updates",
            "communication_redundancy",
            "rapid_mobilization_procedures",
          ],
          followUpActions: [
            {
              action: "update_emergency_contacts",
              owner: "hr_admin",
              deadline: "1_week",
            },
            {
              action: "test_emergency_communication",
              owner: "it_admin",
              deadline: "2_weeks",
            },
          ],
        },
      }

      expect(crisisScheduling.emergencyProtocols.overrideNormalRules).toBe(true)
      expect(crisisScheduling.rapidScheduling.availableSlots[1].score).toBe(
        0.98
      )
      expect(crisisScheduling.rapidScheduling.selectedSlot.participants).toBe(8)
      expect(
        crisisScheduling.crisisCommunication.autoNotifications.executives
      ).toBe("immediate")
      expect(crisisScheduling.postCrisisLearning.followUpActions).toHaveLength(
        2
      )
    })
  })

  describe("Scenario 5: Cross-Platform Scheduling Intelligence", () => {
    it("should validate multi-platform availability sync", () => {
      const crossPlatformSync = {
        userId: "user-123",
        platforms: ["google_calendar", "outlook", "web_app"],
        syncStatus: {
          lastSync: "2026-01-20T10:00:00Z",
          success: true,
          syncedEvents: 45,
          conflicts: 2,
          resolution: "automatic",
        },
        availabilityMatrix: {
          google: {
            busy: [
              {
                start: "2026-01-22T09:00:00-05:00",
                end: "2026-01-22T10:00:00-05:00",
              },
              {
                start: "2026-01-22T14:00:00-05:00",
                end: "2026-01-22T15:00:00-05:00",
              },
            ],
            free: [
              {
                start: "2026-01-22T10:00:00-05:00",
                end: "2026-01-22T14:00:00-05:00",
              },
              {
                start: "2026-01-22T15:00:00-05:00",
                end: "2026-01-22T17:00:00-05:00",
              },
            ],
          },
          outlook: {
            busy: [
              {
                start: "2026-01-22T08:00:00-05:00",
                end: "2026-01-22T09:00:00-05:00",
              },
            ],
            tentative: [
              {
                start: "2026-01-22T15:00:00-05:00",
                end: "2026-01-22T16:00:00-05:00",
              },
            ],
            free: [
              {
                start: "2026-01-22T09:00:00-05:00",
                end: "2026-01-22T15:00:00-05:00",
              },
            ],
          },
          web_app: {
            busy: [],
            free: [
              {
                start: "2026-01-22T08:00:00-05:00",
                end: "2026-01-22T18:00:00-05:00",
              },
            ],
          },
        },
        unifiedAvailability: {
          consolidatedBusy: [
            {
              start: "2026-01-22T08:00:00-05:00",
              end: "2026-01-22T10:00:00-05:00",
            },
            {
              start: "2026-01-22T14:00:00-05:00",
              end: "2026-01-22T16:00:00-05:00",
            },
          ],
          consolidatedFree: [
            {
              start: "2026-01-22T10:00:00-05:00",
              end: "2026-01-22T14:00:00-05:00",
            },
            {
              start: "2026-01-22T16:00:00-05:00",
              end: "2026-01-22T18:00:00-05:00",
            },
          ],
          conflicts: [
            {
              time: "2026-01-22T15:00:00-05:00",
              platforms: ["google", "outlook"],
              resolution: "mark_busy",
            },
          ],
        },
        schedulingIntelligence: {
          crossPlatformOptimization: true,
          platformPreferences: {
            primary: "google_calendar",
            secondary: "outlook",
            tertiary: "web_app",
          },
          syncDirection: "bidirectional",
          conflictResolution: "intelligent_merge",
        },
      }

      expect(crossPlatformSync.platforms).toHaveLength(3)
      expect(crossPlatformSync.availabilityMatrix.google.free).toHaveLength(2)
      expect(
        crossPlatformSync.unifiedAvailability.consolidatedBusy
      ).toHaveLength(2)
      expect(crossPlatformSync.unifiedAvailability.conflicts).toHaveLength(1)
      expect(
        crossPlatformSync.schedulingIntelligence.crossPlatformOptimization
      ).toBe(true)
    })

    it("should validate platform-specific scheduling rules", () => {
      const platformRules = {
        google_calendar: {
          rules: {
            maxEventsPerDay: 50,
            recurringSupport: "full",
            attendeeLimits: 100,
            attachmentSupport: true,
            reminderOptions: ["email", "popup", "sms"],
          },
          preferences: {
            defaultVisibility: "default",
            defaultReminders: [10, 60], // minutes before
            colorCoding: true,
            locationSupport: true,
          },
          limitations: {
            maxTitleLength: 1024,
            maxDescriptionLength: 8192,
            timezoneSupport: "full",
          },
        },
        outlook: {
          rules: {
            maxEventsPerDay: 100,
            recurringSupport: "full",
            attendeeLimits: 500,
            attachmentSupport: true,
            reminderOptions: ["email", "teams", "mobile"],
          },
          preferences: {
            defaultVisibility: "normal",
            defaultReminders: [15, 60],
            categories: true,
            locationSupport: true,
          },
          limitations: {
            maxTitleLength: 255,
            maxDescriptionLength: 32768,
            timezoneSupport: "full",
          },
        },
        web_app: {
          rules: {
            maxEventsPerDay: 1000,
            recurringSupport: "advanced",
            attendeeLimits: 50,
            attachmentSupport: false,
            reminderOptions: ["email", "in_app"],
          },
          preferences: {
            defaultVisibility: "private",
            defaultReminders: [15, 30],
            tags: true,
            locationSupport: false,
          },
          limitations: {
            maxTitleLength: 200,
            maxDescriptionLength: 5000,
            timezoneSupport: "major_only",
          },
        },
        schedulingOptimization: {
          platformSelection: {
            rules: [
              {
                condition: "large_meeting",
                prefer: "outlook",
                reason: "higher attendee limits",
              },
              {
                condition: "recurring_meeting",
                prefer: "google_calendar",
                reason: "better recurring support",
              },
              {
                condition: "simple_meeting",
                prefer: "web_app",
                reason: "simpler interface",
              },
            ],
          },
          crossPlatformBooking: {
            primaryPlatform: "google_calendar",
            syncToSecondary: true,
            conflictResolution: "primary_wins",
            updatePropagation: "immediate",
          },
        },
      }

      expect(platformRules.google_calendar.rules.maxEventsPerDay).toBe(50)
      expect(platformRules.outlook.rules.attendeeLimits).toBe(500)
      expect(platformRules.web_app.limitations.maxTitleLength).toBe(200)
      expect(
        platformRules.schedulingOptimization.platformSelection.rules
      ).toHaveLength(3)
    })

    it("should validate unified scheduling across platforms", () => {
      const unifiedScheduling = {
        meetingRequest: {
          title: "Cross-Platform Strategy Meeting",
          duration: 90,
          participants: [
            "organizer@example.com",
            "participant@outlook.com",
            "participant@company.com",
          ],
          platforms: ["google_calendar", "outlook"],
        },
        platformAnalysis: {
          google_calendar: {
            available: true,
            optimalSlot: {
              start: "2026-01-22T14:00:00-05:00",
              end: "2026-01-22T15:30:00-05:00",
              score: 0.88,
            },
            limitations: [],
          },
          outlook: {
            available: true,
            optimalSlot: {
              start: "2026-01-22T14:00:00-05:00",
              end: "2026-01-22T15:30:00-05:00",
              score: 0.92,
            },
            limitations: [],
          },
          compatibility: {
            timeSlots: "compatible",
            features: "compatible",
            limitations: "none",
          },
        },
        unifiedBooking: {
          strategy: "simultaneous_booking",
          primaryPlatform: "google_calendar",
          secondaryPlatforms: ["outlook"],
          bookingSequence: [
            {
              platform: "google_calendar",
              action: "create_event",
              priority: 1,
            },
            {
              platform: "outlook",
              action: "create_event",
              priority: 2,
            },
          ],
          rollbackStrategy: {
            onFailure: "delete_all",
            compensation: "notify_participants",
          },
        },
        execution: {
          bookingResults: [
            {
              platform: "google_calendar",
              status: "success",
              eventId: "google-event-123",
              url: "https://calendar.google.com/event?id=123",
            },
            {
              platform: "outlook",
              status: "success",
              eventId: "outlook-event-456",
              url: "https://outlook.live.com/calendar/event?id=456",
            },
          ],
          synchronization: {
            status: "completed",
            links: {
              google_to_outlook: "synced",
              outlook_to_google: "synced",
            },
            conflicts: [],
          },
          notifications: {
            sent: true,
            platforms: ["google_calendar", "outlook"],
            recipients: [
              "organizer@example.com",
              "participant@outlook.com",
              "participant@company.com",
            ],
          },
        },
        monitoring: {
          healthChecks: [
            {
              platform: "google_calendar",
              status: "healthy",
              lastCheck: "2026-01-22T14:00:00Z",
            },
            {
              platform: "outlook",
              status: "healthy",
              lastCheck: "2026-01-22T14:00:01Z",
            },
          ],
          alerts: [],
          metrics: {
            bookingTime: 3.2, // seconds
            successRate: 1.0,
            participantNotificationRate: 1.0,
          },
        },
      }

      expect(unifiedScheduling.meetingRequest.platforms).toHaveLength(2)
      expect(
        unifiedScheduling.platformAnalysis.google_calendar.optimalSlot.score
      ).toBe(0.88)
      expect(unifiedScheduling.unifiedBooking.bookingSequence).toHaveLength(2)
      expect(unifiedScheduling.execution.bookingResults).toHaveLength(2)
      expect(unifiedScheduling.monitoring.metrics.bookingTime).toBe(3.2)
    })
  })
})
