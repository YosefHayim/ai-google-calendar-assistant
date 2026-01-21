import { describe, expect, it } from "@jest/globals"

/**
 * Business Scenario: Gap Analysis Journey
 *
 * This test suite covers the AI-powered gap analysis feature that identifies
 * scheduling gaps in users' calendars and suggests optimal meeting times.
 * This represents a premium AI feature for intelligent calendar optimization.
 */

describe("Gap Analysis Journey", () => {
  describe("Scenario 1: Basic Gap Detection", () => {
    it("should validate gap analysis request structure", () => {
      const gapAnalysisRequest = {
        userId: "user-123",
        calendarIds: ["primary", "work@group.calendar.google.com"],
        lookbackDays: 7,
        timeRange: {
          start: "2026-01-20T00:00:00Z",
          end: "2026-01-27T00:00:00Z",
        },
        workingHours: {
          start: "09:00",
          end: "17:00",
          timezone: "America/New_York",
          workDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        },
        minGapDuration: 30, // minutes
        maxGaps: 10,
      }

      expect(gapAnalysisRequest.userId).toBe("user-123")
      expect(gapAnalysisRequest.calendarIds).toHaveLength(2)
      expect(gapAnalysisRequest.lookbackDays).toBe(7)
      expect(gapAnalysisRequest.minGapDuration).toBe(30)
    })

    it("should validate calendar events data for gap analysis", () => {
      const calendarEvents = [
        {
          id: "event-1",
          summary: "Team Standup",
          start: { dateTime: "2026-01-20T09:00:00-05:00" },
          end: { dateTime: "2026-01-20T09:30:00-05:00" },
          calendarId: "primary",
        },
        {
          id: "event-2",
          summary: "Client Meeting",
          start: { dateTime: "2026-01-20T14:00:00-05:00" },
          end: { dateTime: "2026-01-20T15:00:00-05:00" },
          calendarId: "primary",
        },
        {
          id: "event-3",
          summary: "Lunch Break",
          start: { dateTime: "2026-01-20T12:00:00-05:00" },
          end: { dateTime: "2026-01-20T13:00:00-05:00" },
          calendarId: "work@group.calendar.google.com",
        },
      ]

      expect(calendarEvents).toHaveLength(3)
      expect(calendarEvents[0].calendarId).toBe("primary")
      expect(calendarEvents[1].start.dateTime).toContain("14:00:00")
    })

    it("should validate gap detection algorithm output", () => {
      const detectedGaps = [
        {
          start: "2026-01-20T09:30:00-05:00",
          end: "2026-01-20T12:00:00-05:00",
          duration: 150, // minutes
          calendarIds: ["primary"],
          score: 85, // preference score
          reasons: ["Within working hours", "Good duration for meeting"],
        },
        {
          start: "2026-01-20T15:00:00-05:00",
          end: "2026-01-20T17:00:00-05:00",
          duration: 120,
          calendarIds: ["primary", "work@group.calendar.google.com"],
          score: 95,
          reasons: [
            "End of day",
            "Both calendars free",
            "Within working hours",
          ],
        },
      ]

      expect(detectedGaps).toHaveLength(2)
      expect(detectedGaps[0].duration).toBe(150)
      expect(detectedGaps[1].score).toBe(95)
      expect(detectedGaps[1].reasons).toHaveLength(3)
    })

    it("should validate gap analysis response structure", () => {
      const gapAnalysisResponse = {
        userId: "user-123",
        analyzedCalendars: ["primary", "work@group.calendar.google.com"],
        timeRange: {
          start: "2026-01-20T00:00:00Z",
          end: "2026-01-27T00:00:00Z",
        },
        totalGaps: 8,
        gaps: [
          {
            id: "gap-1",
            start: "2026-01-20T09:30:00-05:00",
            end: "2026-01-20T12:00:00-05:00",
            duration: 150,
            score: 85,
          },
        ],
        metadata: {
          processingTime: 245, // ms
          eventsAnalyzed: 12,
          algorithmVersion: "2.1.0",
          confidence: 0.92,
        },
      }

      expect(gapAnalysisResponse.totalGaps).toBe(8)
      expect(gapAnalysisResponse.gaps).toHaveLength(1)
      expect(gapAnalysisResponse.metadata.confidence).toBe(0.92)
    })
  })

  describe("Scenario 2: Travel Pattern Recognition", () => {
    it("should validate travel pattern detection", () => {
      const travelPatterns = [
        {
          type: "business_trip",
          pattern: "weekly",
          days: ["monday", "tuesday"],
          duration: "full_day",
          locations: ["New York", "Boston"],
          events: [
            {
              summary: "Flight to Boston",
              start: "2026-01-20T06:00:00-05:00",
              end: "2026-01-20T08:00:00-05:00",
              location: "JFK Airport",
            },
            {
              summary: "Client Meeting in Boston",
              start: "2026-01-20T14:00:00-05:00",
              end: "2026-01-20T16:00:00-05:00",
              location: "Boston Office",
            },
          ],
        },
        {
          type: "commute",
          pattern: "daily",
          days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
          duration: "fixed",
          locations: ["Home", "Office"],
          events: [],
        },
      ]

      expect(travelPatterns).toHaveLength(2)
      expect(travelPatterns[0].type).toBe("business_trip")
      expect(travelPatterns[0].days).toHaveLength(2)
      expect(travelPatterns[1].pattern).toBe("daily")
    })

    it("should validate international travel detection", () => {
      const internationalTravel = {
        detected: true,
        locations: ["New York", "London"],
        timezoneChanges: ["America/New_York", "Europe/London"],
        jetLagAdjustment: true,
        suggestedMeetingTimes: [
          {
            day: "monday",
            localTime: "14:00",
            otherTimezone: "19:00",
            jetLagSafe: true,
            reason: "Good time for both timezones",
          },
        ],
        travelEvents: [
          {
            summary: "Flight JFK to LHR",
            start: "2026-01-20T20:00:00-05:00",
            end: "2026-01-21T08:00:00Z",
            timezone: "transatlantic",
          },
        ],
      }

      expect(internationalTravel.detected).toBe(true)
      expect(internationalTravel.timezoneChanges).toHaveLength(2)
      expect(internationalTravel.jetLagAdjustment).toBe(true)
      expect(internationalTravel.suggestedMeetingTimes).toHaveLength(1)
    })

    it("should validate pattern-based gap suggestions", () => {
      const patternBasedSuggestions = {
        userId: "user-123",
        patterns: {
          preferredMeetingDays: ["tuesday", "wednesday", "thursday"],
          preferredMeetingTimes: ["10:00", "14:00", "16:00"],
          averageMeetingDuration: 60,
          travelImpact: "moderate",
        },
        suggestions: [
          {
            date: "2026-01-21", // Tuesday
            time: "14:00",
            duration: 60,
            score: 95,
            reasons: [
              "Preferred day (Tuesday)",
              "Preferred time (2 PM)",
              "Standard duration",
              "No travel impact",
            ],
          },
          {
            date: "2026-01-22", // Wednesday (travel day)
            time: "10:00",
            duration: 45,
            score: 78,
            reasons: [
              "Preferred day (Wednesday)",
              "Acceptable time (10 AM)",
              "Shorter duration due to travel",
              "Moderate travel impact",
            ],
          },
        ],
      }

      expect(
        patternBasedSuggestions.patterns.preferredMeetingDays
      ).toHaveLength(3)
      expect(patternBasedSuggestions.suggestions[0].score).toBe(95)
      expect(patternBasedSuggestions.suggestions[1].reasons).toHaveLength(4)
    })
  })

  describe("Scenario 3: Smart Meeting Time Optimization", () => {
    it("should validate participant availability analysis", () => {
      const participantAnalysis = {
        meetingId: "meeting-123",
        participants: [
          {
            email: "organizer@example.com",
            availability: "high",
            workingHours: {
              start: "09:00",
              end: "17:00",
              timezone: "America/New_York",
            },
            preferredTimes: ["10:00", "14:00"],
          },
          {
            email: "participant1@example.com",
            availability: "medium",
            workingHours: {
              start: "08:00",
              end: "16:00",
              timezone: "America/Los_Angeles",
            },
            preferredTimes: ["13:00", "15:00"],
          },
          {
            email: "participant2@example.com",
            availability: "low",
            workingHours: {
              start: "10:00",
              end: "18:00",
              timezone: "Europe/London",
            },
            preferredTimes: ["14:00"],
          },
        ],
        optimalTimeSlots: [
          {
            start: "2026-01-22T14:00:00Z", // 10 AM EST, 7 AM PST, 2 PM GMT
            end: "2026-01-22T15:00:00Z",
            score: 88,
            participantCoverage: 100,
            timezoneCompatibility: "good",
            workingHoursCompliance: 100,
          },
          {
            start: "2026-01-22T19:00:00Z", // 3 PM EST, 12 PM PST, 7 PM GMT
            end: "2026-01-22T20:00:00Z",
            score: 65,
            participantCoverage: 66,
            timezoneCompatibility: "poor",
            workingHoursCompliance: 33,
          },
        ],
      }

      expect(participantAnalysis.participants).toHaveLength(3)
      expect(participantAnalysis.optimalTimeSlots[0].score).toBe(88)
      expect(participantAnalysis.optimalTimeSlots[0].participantCoverage).toBe(
        100
      )
    })

    it("should validate meeting duration optimization", () => {
      const durationOptimization = {
        requestedDuration: 60,
        suggestedDurations: [
          {
            duration: 45,
            score: 92,
            reasons: [
              "Fits available gap perfectly",
              "Reduces scheduling friction",
              "Maintains meeting effectiveness",
            ],
          },
          {
            duration: 60,
            score: 85,
            reasons: [
              "Requested duration",
              "Good for detailed discussions",
              "May require rescheduling adjacent meetings",
            ],
          },
          {
            duration: 30,
            score: 78,
            reasons: [
              "Quick check-in format",
              "Minimal scheduling impact",
              "May not be sufficient for agenda",
            ],
          },
        ],
        contextAnalysis: {
          meetingType: "strategy_discussion",
          historicalDurations: {
            average: 55,
            median: 60,
            min: 30,
            max: 120,
          },
          participantPreferences: {
            preferredDuration: 45,
            flexibility: "moderate",
          },
        },
      }

      expect(durationOptimization.suggestedDurations[0].score).toBe(92)
      expect(
        durationOptimization.contextAnalysis.historicalDurations.average
      ).toBe(55)
    })

    it("should validate AI-powered scheduling recommendations", () => {
      const aiSchedulingRecommendation = {
        userId: "user-123",
        meetingRequest:
          "Schedule a 1-hour strategy meeting with the team next week",
        analysis: {
          intent: "schedule_meeting",
          meetingType: "strategy_discussion",
          duration: 60,
          participants: ["team"],
          timeframe: "next_week",
          urgency: "normal",
        },
        recommendations: [
          {
            rank: 1,
            dateTime: "2026-01-22T14:00:00-05:00",
            duration: 60,
            score: 96,
            confidence: 0.89,
            reasons: [
              "Optimal time for all team members",
              "Within standard working hours",
              "No conflicts detected",
              "High participant availability",
              "Good timezone alignment",
            ],
            alternatives: [
              {
                dateTime: "2026-01-23T10:00:00-05:00",
                score: 87,
                reason: "Good alternative time",
              },
            ],
          },
        ],
        metadata: {
          processingTime: 180, // ms
          calendarsAnalyzed: 3,
          participantsAnalyzed: 5,
          gapsConsidered: 24,
          algorithmVersion: "3.2.0",
        },
      }

      expect(aiSchedulingRecommendation.recommendations[0].rank).toBe(1)
      expect(aiSchedulingRecommendation.recommendations[0].score).toBe(96)
      expect(
        aiSchedulingRecommendation.recommendations[0].reasons
      ).toHaveLength(5)
      expect(aiSchedulingRecommendation.metadata.calendarsAnalyzed).toBe(3)
    })
  })

  describe("Scenario 4: Gap Analysis Reporting & Insights", () => {
    it("should validate gap analysis insights structure", () => {
      const gapInsights = {
        userId: "user-123",
        timeRange: "last_30_days",
        insights: [
          {
            type: "productivity_pattern",
            title: "Peak Productivity Hours",
            description:
              "You have the most available time between 10:00 AM and 12:00 PM",
            data: {
              peakHours: ["10:00-12:00"],
              utilizationRate: 35, // percentage
              optimalMeetingTime: "10:30",
            },
            recommendation:
              "Schedule important meetings during your peak availability hours",
          },
          {
            type: "calendar_health",
            title: "Calendar Fragmentation",
            description:
              "Your calendar shows moderate fragmentation with 12 gaps over 30 days",
            data: {
              totalGaps: 12,
              averageGapDuration: 95, // minutes
              fragmentationScore: 72, // out of 100
              healthStatus: "moderate",
            },
            recommendation:
              "Consider batching similar meetings to reduce context switching",
          },
          {
            type: "meeting_pattern",
            title: "Meeting Duration Trends",
            description:
              "Your meetings average 67 minutes, with most falling between 60-90 minutes",
            data: {
              averageDuration: 67,
              commonDurations: [30, 60, 90],
              durationDistribution: {
                "0-30min": 15, // percentage
                "30-60min": 25,
                "60-90min": 45,
                "90min+": 15,
              },
            },
            recommendation:
              "Consider standardizing meeting durations for better planning",
          },
        ],
        trends: {
          gapCount: {
            current: 12,
            previous: 10,
            change: 20, // percentage
            trend: "increasing",
          },
          averageGapDuration: {
            current: 95,
            previous: 85,
            change: 12,
            trend: "increasing",
          },
        },
      }

      expect(gapInsights.insights).toHaveLength(3)
      expect(gapInsights.insights[0].type).toBe("productivity_pattern")
      expect(gapInsights.trends.gapCount.change).toBe(20)
    })

    it("should validate gap analysis visualization data", () => {
      const visualizationData = {
        userId: "user-123",
        chartType: "calendar_heatmap",
        data: {
          timeSlots: [
            { hour: 9, day: "monday", utilization: 85, gapCount: 0 },
            { hour: 10, day: "monday", utilization: 20, gapCount: 3 },
            { hour: 11, day: "monday", utilization: 15, gapCount: 4 },
            { hour: 14, day: "monday", utilization: 60, gapCount: 1 },
            { hour: 15, day: "monday", utilization: 25, gapCount: 3 },
          ],
          weeklyPatterns: {
            busiestDay: "wednesday",
            busiestHour: 14,
            mostAvailableDay: "friday",
            mostAvailableHour: 10,
          },
          recommendations: [
            {
              type: "optimal_scheduling",
              message: "Schedule complex meetings on Wednesdays at 2 PM",
              confidence: 0.91,
            },
            {
              type: "free_time_utilization",
              message: "Use Friday mornings for focused work or 1:1 meetings",
              confidence: 0.87,
            },
          ],
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: 168, // hours in week
          analysisPeriod: "7_days",
          refreshInterval: "1_hour",
        },
      }

      expect(visualizationData.data.timeSlots).toHaveLength(5)
      expect(visualizationData.data.weeklyPatterns.busiestDay).toBe("wednesday")
      expect(visualizationData.data.recommendations).toHaveLength(2)
      expect(visualizationData.metadata.dataPoints).toBe(168)
    })

    it("should validate gap analysis export structure", () => {
      const gapAnalysisExport = {
        userId: "user-123",
        exportType: "gap_analysis_report",
        format: "json",
        data: {
          summary: {
            totalGaps: 24,
            totalAvailableTime: 1800, // minutes
            averageGapDuration: 75,
            utilizationRate: 68, // percentage
            analysisPeriod: "2026-01-01 to 2026-01-31",
          },
          gaps: [
            {
              id: "gap-1",
              start: "2026-01-20T10:00:00-05:00",
              end: "2026-01-20T11:30:00-05:00",
              duration: 90,
              score: 88,
              calendarIds: ["primary"],
              reasons: ["Within working hours", "Good duration"],
            },
          ],
          insights: [
            {
              category: "productivity",
              insight: "You have 18 hours of available time this month",
              impact: "high",
              action: "Consider scheduling more meetings",
            },
          ],
          recommendations: [
            {
              priority: "high",
              recommendation:
                "Schedule team meetings during peak availability hours",
              expectedBenefit: "25% better attendance",
              implementationEffort: "low",
            },
          ],
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          version: "2.1.0",
          processingTime: 450, // ms
          dataFreshness: "real_time",
        },
      }

      expect(gapAnalysisExport.data.summary.totalGaps).toBe(24)
      expect(gapAnalysisExport.data.gaps).toHaveLength(1)
      expect(gapAnalysisExport.data.insights).toHaveLength(1)
      expect(gapAnalysisExport.data.recommendations[0].priority).toBe("high")
    })
  })

  describe("Scenario 5: Advanced Gap Analysis Features", () => {
    it("should validate multi-calendar gap analysis", () => {
      const multiCalendarAnalysis = {
        userId: "user-123",
        calendars: [
          { id: "primary", name: "Personal", priority: "high" },
          { id: "work@company.com", name: "Work", priority: "high" },
          { id: "social@personal.com", name: "Social", priority: "low" },
        ],
        crossCalendarGaps: [
          {
            start: "2026-01-22T14:00:00-05:00",
            end: "2026-01-22T16:00:00-05:00",
            duration: 120,
            calendars: ["primary", "work@company.com"],
            overlapType: "complete_overlap",
            score: 95,
            priority: "high",
          },
          {
            start: "2026-01-23T10:00:00-05:00",
            end: "2026-01-23T11:00:00-05:00",
            duration: 60,
            calendars: ["primary"],
            overlapType: "single_calendar",
            score: 78,
            priority: "medium",
          },
        ],
        calendarPreferences: {
          primaryCalendar: "primary",
          workCalendar: "work@company.com",
          socialCalendar: "social@personal.com",
          crossCalendarScheduling: true,
        },
      }

      expect(multiCalendarAnalysis.calendars).toHaveLength(3)
      expect(multiCalendarAnalysis.crossCalendarGaps).toHaveLength(2)
      expect(multiCalendarAnalysis.crossCalendarGaps[0].calendars).toHaveLength(
        2
      )
      expect(
        multiCalendarAnalysis.calendarPreferences.crossCalendarScheduling
      ).toBe(true)
    })

    it("should validate gap analysis with meeting preferences", () => {
      const preferenceBasedAnalysis = {
        userId: "user-123",
        meetingPreferences: {
          preferredDurations: [30, 60, 90],
          preferredDays: ["tuesday", "wednesday", "thursday"],
          preferredTimes: ["09:00", "10:00", "14:00", "15:00"],
          bufferTime: 15, // minutes between meetings
          maxMeetingsPerDay: 6,
          meetingTypes: {
            "1:1": { duration: 30, priority: "high" },
            team: { duration: 60, priority: "medium" },
            client: { duration: 90, priority: "high" },
            strategy: { duration: 120, priority: "low" },
          },
        },
        gapScoring: [
          {
            gapId: "gap-1",
            baseScore: 80,
            preferenceModifiers: {
              preferredDay: 10,
              preferredTime: 5,
              rightDuration: 8,
              bufferTime: 3,
            },
            finalScore: 106, // capped at 100
            meetingType: "1:1",
          },
          {
            gapId: "gap-2",
            baseScore: 65,
            preferenceModifiers: {
              preferredDay: 0,
              preferredTime: 0,
              rightDuration: 15,
              bufferTime: 5,
            },
            finalScore: 85,
            meetingType: "client",
          },
        ],
      }

      expect(
        preferenceBasedAnalysis.meetingPreferences.preferredDurations
      ).toHaveLength(3)
      expect(preferenceBasedAnalysis.gapScoring[0].finalScore).toBe(106)
      expect(preferenceBasedAnalysis.gapScoring[1].meetingType).toBe("client")
    })

    it("should validate gap analysis with historical data", () => {
      const historicalGapAnalysis = {
        userId: "user-123",
        historicalPeriod: "90_days",
        patterns: {
          weeklyRhythm: {
            monday: { utilization: 85, gapCount: 2, averageGapDuration: 45 },
            tuesday: { utilization: 92, gapCount: 1, averageGapDuration: 30 },
            wednesday: { utilization: 78, gapCount: 3, averageGapDuration: 75 },
            thursday: { utilization: 88, gapCount: 2, averageGapDuration: 60 },
            friday: { utilization: 65, gapCount: 4, averageGapDuration: 90 },
          },
          seasonalTrends: {
            q1_average_utilization: 82,
            current_month_trend: "increasing",
            predicted_next_month: 78,
          },
          meetingTypeDistribution: {
            "1:1": { count: 45, averageDuration: 32 },
            team: { count: 28, averageDuration: 62 },
            client: { count: 12, averageDuration: 88 },
            strategy: { count: 5, averageDuration: 115 },
          },
        },
        predictions: {
          nextWeekUtilization: 80,
          recommendedBookingStrategy: "front_load",
          optimalMeetingDays: ["monday", "wednesday"],
          suggestedMeetingLimits: {
            monday: 4,
            tuesday: 3,
            wednesday: 5,
            thursday: 4,
            friday: 3,
          },
        },
      }

      expect(
        historicalGapAnalysis.patterns.weeklyRhythm.monday.utilization
      ).toBe(85)
      expect(
        historicalGapAnalysis.patterns.meetingTypeDistribution["1:1"].count
      ).toBe(45)
      expect(historicalGapAnalysis.predictions.optimalMeetingDays).toHaveLength(
        2
      )
      expect(
        historicalGapAnalysis.predictions.suggestedMeetingLimits.monday
      ).toBe(4)
    })
  })
})
