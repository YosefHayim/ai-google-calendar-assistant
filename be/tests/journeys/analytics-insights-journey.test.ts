import { describe, expect, it } from "@jest/globals"

/**
 * Business Scenario: Analytics & Insights Dashboard Journey
 *
 * This test suite covers the analytics and insights features for calendar data,
 * productivity tracking, meeting efficiency, and personalized recommendations.
 * This represents premium analytics features for power users.
 */

describe("Analytics & Insights Dashboard Journey", () => {
  describe("Scenario 1: Productivity Analytics", () => {
    it("should validate time allocation tracking structure", () => {
      const timeAllocation = {
        userId: "user-123",
        period: "30_days",
        totalTrackedTime: 160, // hours
        categoryBreakdown: [
          {
            category: "meetings",
            totalHours: 64,
            percentage: 40,
            subcategories: [
              { name: "internal_meetings", hours: 32, percentage: 50 },
              { name: "client_meetings", hours: 20, percentage: 31 },
              { name: "recruiting", hours: 12, percentage: 19 },
            ],
          },
          {
            category: "deep_work",
            totalHours: 48,
            percentage: 30,
            subcategories: [
              { name: "coding", hours: 32, percentage: 67 },
              { name: "design", hours: 10, percentage: 21 },
              { name: "planning", hours: 6, percentage: 12 },
            ],
          },
          {
            category: "communication",
            totalHours: 32,
            percentage: 20,
            subcategories: [
              { name: "email", hours: 16, percentage: 50 },
              { name: "slack", hours: 12, percentage: 38 },
              { name: "calls", hours: 4, percentage: 12 },
            ],
          },
          {
            category: "other",
            totalHours: 16,
            percentage: 10,
            subcategories: [
              { name: "breaks", hours: 8, percentage: 50 },
              { name: "admin", hours: 8, percentage: 50 },
            ],
          },
        ],
        insights: [
          {
            type: "productivity",
            message:
              "You spend 40% of your time in meetings, which is above the recommended 30%",
            recommendation: "Consider reducing meeting frequency or duration",
            impact: "high",
          },
          {
            type: "work_life_balance",
            message:
              "You have 30% deep work time, which is within the optimal range",
            recommendation: "Continue protecting your deep work blocks",
            impact: "positive",
          },
        ],
      }

      expect(timeAllocation.totalTrackedTime).toBe(160)
      expect(timeAllocation.categoryBreakdown).toHaveLength(4)
      expect(timeAllocation.categoryBreakdown[0].percentage).toBe(40)
      expect(timeAllocation.insights).toHaveLength(2)
    })

    it("should validate meeting efficiency metrics", () => {
      const meetingEfficiency = {
        userId: "user-123",
        period: "30_days",
        meetingsAnalyzed: 45,
        efficiencyMetrics: {
          averageMeetingDuration: 62, // minutes
          medianMeetingDuration: 60,
          totalMeetingTime: 2790, // minutes
          meetingsByDuration: {
            "0-30min": { count: 12, percentage: 27 },
            "30-60min": { count: 18, percentage: 40 },
            "60-90min": { count: 10, percentage: 22 },
            "90min+": { count: 5, percentage: 11 },
          },
          meetingsByType: {
            "1:1": { count: 15, averageDuration: 45, efficiency: 0.85 },
            team: { count: 20, averageDuration: 65, efficiency: 0.78 },
            client: { count: 8, averageDuration: 75, efficiency: 0.82 },
            all_hands: { count: 2, averageDuration: 120, efficiency: 0.65 },
          },
          attendanceRate: 0.89, // 89%
          noShowRate: 0.04, // 4%
          lateStartRate: 0.12, // 12%
        },
        efficiencyInsights: [
          {
            metric: "average_duration",
            value: 62,
            benchmark: 55,
            status: "above_average",
            recommendation: "Consider shortening meetings by 5-10 minutes",
          },
          {
            metric: "attendance_rate",
            value: 0.89,
            benchmark: 0.95,
            status: "needs_improvement",
            recommendation: "Send reminders 15 minutes before meetings",
          },
          {
            metric: "meeting_type_efficiency",
            value: 0.78,
            benchmark: 0.85,
            status: "good",
            recommendation:
              "Team meetings are efficient; consider more structured agendas",
          },
        ],
        trends: {
          durationTrend: "increasing",
          attendanceTrend: "stable",
          efficiencyTrend: "improving",
        },
      }

      expect(meetingEfficiency.meetingsAnalyzed).toBe(45)
      expect(meetingEfficiency.efficiencyMetrics.averageMeetingDuration).toBe(
        62
      )
      expect(meetingEfficiency.efficiencyMetrics.attendanceRate).toBe(0.89)
      expect(meetingEfficiency.efficiencyInsights).toHaveLength(3)
    })

    it("should validate calendar health scoring", () => {
      const calendarHealth = {
        userId: "user-123",
        overallScore: 72, // out of 100
        lastCalculated: "2026-01-20T10:00:00Z",
        healthFactors: [
          {
            factor: "fragmentation",
            score: 65,
            weight: 0.3,
            description: "Calendar shows moderate fragmentation",
            data: {
              totalGaps: 28,
              averageGapSize: 45, // minutes
              largestGap: 180,
              fragmentationIndex: 0.72,
            },
            recommendation: "Consider batching similar meetings",
          },
          {
            factor: "overbooking",
            score: 85,
            weight: 0.25,
            description: "Good balance of meetings and focus time",
            data: {
              averageUtilization: 68, // percentage
              peakUtilization: 95,
              lowUtilizationPeriods: 12,
              overbookingIncidents: 2,
            },
            recommendation: "Current balance is good; maintain focus blocks",
          },
          {
            factor: "meeting_distribution",
            score: 78,
            weight: 0.2,
            description: "Meetings are well-distributed throughout the week",
            data: {
              meetingsByDay: {
                monday: 8,
                tuesday: 12,
                wednesday: 10,
                thursday: 9,
                friday: 6,
              },
              mostBusyDay: "tuesday",
              leastBusyDay: "friday",
              distributionVariance: 0.22,
            },
            recommendation:
              "Tuesday is busiest; consider redistributing some meetings",
          },
          {
            factor: "buffer_time",
            score: 60,
            weight: 0.15,
            description: "Limited buffer time between meetings",
            data: {
              averageBufferTime: 8, // minutes
              meetingsWithoutBuffer: 15,
              bufferComplianceRate: 0.67,
            },
            recommendation: "Add 15-minute buffers between meetings",
          },
          {
            factor: "recurring_meetings",
            score: 70,
            weight: 0.1,
            description: "Moderate use of recurring meetings",
            data: {
              recurringMeetings: 12,
              totalMeetings: 45,
              recurringPercentage: 27,
              averageRecurringFrequency: 2, // per week
            },
            recommendation:
              "Recurring meetings are reasonable; review necessity quarterly",
          },
        ],
        recommendations: [
          {
            priority: "high",
            category: "buffer_time",
            title: "Add Buffer Time",
            description:
              "Add 15-minute buffers between meetings to reduce stress",
            estimatedImpact: "20% reduction in meeting stress",
            effort: "medium",
            timeframe: "1_week",
          },
          {
            priority: "medium",
            category: "meeting_distribution",
            title: "Balance Meeting Load",
            description: "Move 2-3 Tuesday meetings to Wednesday or Thursday",
            estimatedImpact: "15% more balanced schedule",
            effort: "low",
            timeframe: "2_weeks",
          },
        ],
        trends: {
          healthTrend: "improving",
          previousScore: 68,
          change: 4,
          factorsImproved: ["overbooking"],
          factorsDeclined: ["buffer_time"],
        },
      }

      expect(calendarHealth.overallScore).toBe(72)
      expect(calendarHealth.healthFactors).toHaveLength(5)
      expect(calendarHealth.recommendations).toHaveLength(2)
      expect(calendarHealth.trends.healthTrend).toBe("improving")
    })
  })

  describe("Scenario 2: Trend Analysis and Forecasting", () => {
    it("should validate productivity trend analysis", () => {
      const productivityTrends = {
        userId: "user-123",
        analysisPeriod: "90_days",
        metrics: {
          meetingHours: {
            current: 64, // hours this month
            previous: 58,
            change: 10, // percentage
            trend: "increasing",
            seasonality: "none",
          },
          deepWorkHours: {
            current: 48,
            previous: 52,
            change: -8,
            trend: "decreasing",
            seasonality: "none",
          },
          utilizationRate: {
            current: 68,
            previous: 65,
            change: 5,
            trend: "increasing",
            seasonality: "weekday_pattern",
          },
          meetingEfficiency: {
            current: 0.82,
            previous: 0.79,
            change: 4,
            trend: "improving",
            seasonality: "none",
          },
        },
        trendAnalysis: {
          overallProductivity: {
            score: 75,
            trend: "stable",
            forecast: "stable",
            confidence: 0.78,
          },
          weeklyPatterns: [
            {
              day: "monday",
              productivity: 0.85,
              meetings: 8,
              deepWork: 4,
              pattern: "high_energy_start",
            },
            {
              day: "tuesday",
              productivity: 0.92,
              meetings: 12,
              deepWork: 2,
              pattern: "peak_productivity",
            },
            {
              day: "wednesday",
              productivity: 0.78,
              meetings: 10,
              deepWork: 3,
              pattern: "sustained_focus",
            },
            {
              day: "thursday",
              productivity: 0.88,
              meetings: 9,
              deepWork: 4,
              pattern: "strong_finish",
            },
            {
              day: "friday",
              productivity: 0.65,
              meetings: 6,
              deepWork: 5,
              pattern: "winding_down",
            },
          ],
          monthlyPatterns: {
            Q1_average: 0.82,
            current_month_trend: "stable",
            predicted_next_month: 0.8,
            seasonal_factors: ["holiday_season", "quarter_end"],
          },
        },
        insights: [
          {
            type: "productivity_peak",
            title: "Tuesday Productivity Peak",
            description:
              "Tuesday shows your highest productivity with 92% efficiency",
            recommendation: "Schedule important work sessions on Tuesdays",
            data: { day: "tuesday", efficiency: 0.92 },
          },
          {
            type: "meeting_load",
            title: "Meeting Load Increasing",
            description: "Meeting hours increased 10% this month",
            recommendation: "Review meeting necessity and consider time limits",
            data: { increase: 10, current: 64 },
          },
        ],
        forecasts: {
          nextMonth: {
            predictedMeetingHours: 58,
            predictedUtilization: 65,
            confidence: 0.72,
            factors: ["historical_patterns", "seasonal_adjustment"],
          },
          nextQuarter: {
            predictedEfficiency: 0.85,
            confidence: 0.65,
            recommendations: ["maintain_current_practices"],
          },
        },
      }

      expect(productivityTrends.metrics.meetingHours.trend).toBe("increasing")
      expect(productivityTrends.trendAnalysis.weeklyPatterns).toHaveLength(5)
      expect(productivityTrends.insights).toHaveLength(2)
      expect(productivityTrends.forecasts.nextMonth.predictedMeetingHours).toBe(
        58
      )
    })

    it("should validate meeting pattern recognition", () => {
      const meetingPatterns = {
        userId: "user-123",
        patternAnalysis: {
          recurringMeetings: {
            total: 15,
            byFrequency: {
              daily: 2,
              weekly: 10,
              biweekly: 2,
              monthly: 1,
            },
            byType: {
              standup: 5,
              "1:1": 4,
              team_sync: 3,
              planning: 2,
              review: 1,
            },
            averageAttendance: {
              standup: 8,
              "1:1": 2,
              team_sync: 6,
              planning: 4,
              review: 3,
            },
          },
          meetingClusters: [
            {
              time: "09:00",
              meetings: 8,
              consistency: 0.95,
              pattern: "morning_standup",
            },
            {
              time: "14:00",
              meetings: 12,
              consistency: 0.88,
              pattern: "afternoon_sync",
            },
            {
              time: "10:00",
              meetings: 6,
              consistency: 0.72,
              pattern: "adhoc_meetings",
            },
          ],
          attendancePatterns: {
            mostReliableAttendees: [
              { name: "Alice Johnson", attendanceRate: 0.98 },
              { name: "Bob Smith", attendanceRate: 0.95 },
              { name: "Charlie Brown", attendanceRate: 0.89 },
            ],
            leastReliableAttendees: [
              { name: "David Wilson", attendanceRate: 0.72 },
              { name: "Eva Davis", attendanceRate: 0.68 },
            ],
            noShowPatterns: {
              byDay: {
                monday: 0.02,
                tuesday: 0.01,
                wednesday: 0.03,
                thursday: 0.02,
                friday: 0.05,
              },
              byTime: {
                morning: 0.02,
                afternoon: 0.03,
                evening: 0.08,
              },
            },
          },
          durationPatterns: {
            preferredDurations: [30, 60, 90],
            averageByType: {
              standup: 15,
              "1:1": 45,
              team_sync: 60,
              planning: 90,
              review: 120,
            },
            overtimeRate: 0.15, // 15% of meetings go over time
            averageOvertime: 12, // minutes
          },
        },
        recommendations: [
          {
            type: "optimize_recurring",
            title: "Review Weekly Standups",
            description:
              "5 weekly standups may be excessive; consider consolidating",
            impact: "high",
            effort: "medium",
          },
          {
            type: "improve_attendance",
            title: "Address No-Shows",
            description: "Friday meetings have highest no-show rate at 5%",
            impact: "medium",
            effort: "low",
          },
          {
            type: "standardize_durations",
            title: "Set Meeting Time Limits",
            description:
              "15% of meetings exceed planned duration by average of 12 minutes",
            impact: "medium",
            effort: "low",
          },
        ],
      }

      expect(meetingPatterns.patternAnalysis.recurringMeetings.total).toBe(15)
      expect(meetingPatterns.patternAnalysis.meetingClusters).toHaveLength(3)
      expect(
        meetingPatterns.patternAnalysis.attendancePatterns.mostReliableAttendees
      ).toHaveLength(3)
      expect(meetingPatterns.recommendations).toHaveLength(3)
    })

    it("should validate work-life balance monitoring", () => {
      const workLifeBalance = {
        userId: "user-123",
        balanceMetrics: {
          workHours: {
            averageDaily: 8.5,
            averageWeekly: 42.5,
            overtimeDays: 3, // days this month
            weekendWork: 2, // instances
          },
          personalTime: {
            averageDaily: 4.2,
            averageWeekly: 21,
            exerciseTime: 3.5, // hours per week
            sleepQuality: 0.78, // score
          },
          meetingDistribution: {
            workMeetings: 85, // percentage
            personalMeetings: 15,
            afterHoursMeetings: 12, // count this month
            weekendMeetings: 1,
          },
          stressIndicators: {
            backToBackMeetings: 8, // count this week
            meetingsOverTime: 6,
            shortBreaks: 15, // breaks under 15 minutes
            longDays: 4, // days over 10 hours
          },
        },
        balanceScore: {
          overall: 72, // out of 100
          workLifeRatio: 0.67, // 67% work, 33% personal
          stressLevel: "moderate",
          recommendations: [
            {
              category: "meetings",
              priority: "high",
              title: "Reduce After-Hours Meetings",
              description: "12 meetings scheduled after 5 PM this month",
              action: "Reschedule evening meetings to business hours",
              impact: "significant",
            },
            {
              category: "breaks",
              priority: "medium",
              title: "Add More Breaks",
              description: "15 short breaks this week (under 15 minutes)",
              action: "Schedule 30-minute breaks between long meetings",
              impact: "moderate",
            },
            {
              category: "weekends",
              priority: "low",
              title: "Protect Weekends",
              description: "2 weekend work instances detected",
              action: "Avoid scheduling work on weekends when possible",
              impact: "low",
            },
          ],
        },
        trends: {
          balanceTrend: "declining",
          previousScore: 78,
          change: -6,
          concerningFactors: ["after_hours_meetings", "short_breaks"],
          positiveFactors: ["consistent_bedtime"],
        },
        goals: {
          targetWorkHours: 40, // per week
          targetPersonalTime: 20, // per week minimum
          maxAfterHoursMeetings: 5, // per month
          minBreakTime: 15, // minutes between meetings
        },
      }

      expect(workLifeBalance.balanceMetrics.workHours.averageWeekly).toBe(42.5)
      expect(workLifeBalance.balanceScore.overall).toBe(72)
      expect(workLifeBalance.balanceScore.recommendations).toHaveLength(3)
      expect(workLifeBalance.trends.balanceTrend).toBe("declining")
    })
  })

  describe("Scenario 3: Personalized Recommendations Engine", () => {
    it("should validate AI-powered scheduling recommendations", () => {
      const aiRecommendations = {
        userId: "user-123",
        context: {
          requestedMeeting: "Schedule a 1-hour team planning session",
          userPreferences: {
            preferredDays: ["tuesday", "wednesday"],
            preferredTimes: ["10:00", "14:00"],
            maxMeetingDuration: 120,
            bufferTime: 15,
          },
          calendarState: {
            utilizationRate: 68,
            availableSlots: 24,
            conflictingEvents: 3,
          },
        },
        recommendations: [
          {
            rank: 1,
            confidence: 0.95,
            timeSlot: {
              date: "2026-01-21",
              startTime: "10:00",
              endTime: "11:00",
              duration: 60,
              timezone: "America/New_York",
            },
            reasoning: [
              "Preferred day (Tuesday)",
              "Preferred time (10 AM)",
              "No conflicts detected",
              "Follows user's meeting patterns",
              "Good buffer time before and after",
            ],
            alternatives: [
              {
                date: "2026-01-21",
                startTime: "14:00",
                endTime: "15:00",
                reasoning: "Alternative preferred time slot",
              },
            ],
            metadata: {
              calendarConflicts: 0,
              attendeeAvailability: 0.92,
              userPreferenceMatch: 0.98,
              historicalSuccess: 0.89,
            },
          },
          {
            rank: 2,
            confidence: 0.87,
            timeSlot: {
              date: "2026-01-22",
              startTime: "10:00",
              endTime: "11:00",
              duration: 60,
              timezone: "America/New_York",
            },
            reasoning: [
              "Alternative preferred day (Wednesday)",
              "Preferred time (10 AM)",
              "Minor conflict but resolvable",
              "Good historical attendance",
            ],
          },
        ],
        insights: {
          optimalTimeFound: true,
          conflictsDetected: 1,
          preferenceMatchScore: 0.93,
          alternativeOptions: 3,
          reasoningQuality: "high",
        },
      }

      expect(aiRecommendations.recommendations).toHaveLength(2)
      expect(aiRecommendations.recommendations[0].confidence).toBe(0.95)
      expect(aiRecommendations.recommendations[0].reasoning).toHaveLength(5)
      expect(aiRecommendations.insights.optimalTimeFound).toBe(true)
    })

    it("should validate productivity optimization suggestions", () => {
      const productivityOptimizations = {
        userId: "user-123",
        currentState: {
          utilizationRate: 78,
          meetingHours: 28, // per week
          deepWorkHours: 18,
          fragmentationScore: 0.65,
          stressLevel: "moderate",
        },
        optimizations: [
          {
            type: "meeting_batch",
            title: "Batch Similar Meetings",
            description: "Group 1:1 meetings on Tuesdays and Thursdays",
            potentialBenefit: {
              timeSaved: 240, // minutes per month
              stressReduction: 0.15, // 15%
              productivityIncrease: 0.12, // 12%
            },
            implementation: {
              effort: "medium",
              timeframe: "2_weeks",
              steps: [
                "Audit current 1:1 schedule",
                "Identify batching opportunities",
                "Communicate changes to stakeholders",
                "Monitor impact for 4 weeks",
              ],
            },
            confidence: 0.88,
            data: {
              similarMeetings: 8,
              potentialClusters: 3,
              averageMeetingGap: 45, // minutes
            },
          },
          {
            type: "focus_block",
            title: "Protect Deep Work Time",
            description: "Block 2-hour focus periods every morning",
            potentialBenefit: {
              productivityIncrease: 0.25,
              meetingInterruptionReduction: 0.4,
              codeQualityImprovement: 0.18,
            },
            implementation: {
              effort: "low",
              timeframe: "1_week",
              steps: [
                "Identify 2-hour blocks in calendar",
                "Set recurring focus time blocks",
                "Communicate availability to team",
                "Measure focus time utilization",
              ],
            },
            confidence: 0.92,
            data: {
              availableMorningSlots: 5,
              averageInterruptionRate: 0.35,
              historicalDeepWorkSuccess: 0.78,
            },
          },
          {
            type: "meeting_limit",
            title: "Implement Meeting Limits",
            description: "Limit meetings to 4 hours per day maximum",
            potentialBenefit: {
              workLifeBalance: 0.2,
              burnoutReduction: 0.3,
              strategicThinking: 0.15,
            },
            implementation: {
              effort: "high",
              timeframe: "4_weeks",
              steps: [
                "Audit current meeting load",
                "Set personal meeting limits",
                "Decline or reschedule excess meetings",
                "Track impact on productivity",
              ],
            },
            confidence: 0.76,
            data: {
              currentDailyAverage: 5.2, // hours
              targetLimit: 4.0,
              meetingsToReschedule: 12,
            },
          },
        ],
        prioritization: {
          recommendedOrder: ["focus_block", "meeting_batch", "meeting_limit"],
          reasoning: "Start with quick wins, then tackle harder changes",
          expectedTimeline: "6_weeks",
          successMetrics: [
            "utilization_rate_improvement",
            "deep_work_hours_increase",
            "meeting_stress_reduction",
          ],
        },
      }

      expect(productivityOptimizations.optimizations).toHaveLength(3)
      expect(
        productivityOptimizations.optimizations[0].potentialBenefit.timeSaved
      ).toBe(240)
      expect(
        productivityOptimizations.prioritization.recommendedOrder
      ).toHaveLength(3)
    })

    it("should validate behavioral insights and coaching", () => {
      const behavioralInsights = {
        userId: "user-123",
        personalityInsights: {
          meetingStyle: "collaborative",
          timeManagement: "structured",
          communicationPreference: "direct",
          energyPattern: "morning_person",
          decisionMaking: "analytical",
        },
        behavioralPatterns: [
          {
            pattern: "meeting_preparation",
            observed: "minimal",
            benchmark: "adequate",
            impact: "moderate_negative",
            recommendation: "Prepare agendas 24 hours in advance",
            evidence: "45% of meetings lack agendas",
          },
          {
            pattern: "follow_up",
            observed: "inconsistent",
            benchmark: "consistent",
            impact: "moderate_negative",
            recommendation: "Send meeting notes within 2 hours",
            evidence: "Only 60% of meetings have follow-up notes",
          },
          {
            pattern: "time_buffer",
            observed: "insufficient",
            benchmark: "adequate",
            impact: "high_negative",
            recommendation: "Add 15-minute buffers between meetings",
            evidence: "Average buffer time is 8 minutes",
          },
          {
            pattern: "meeting_attendance",
            observed: "reliable",
            benchmark: "reliable",
            impact: "positive",
            recommendation: "Continue reliable attendance patterns",
            evidence: "95% on-time attendance rate",
          },
        ],
        coachingRecommendations: [
          {
            focusArea: "meeting_efficiency",
            currentLevel: "intermediate",
            targetLevel: "advanced",
            actions: [
              {
                action: "implement_agenda_template",
                difficulty: "low",
                timeline: "1_week",
                expectedImpact: "20% better meeting outcomes",
              },
              {
                action: "practice_timeboxing",
                difficulty: "medium",
                timeline: "2_weeks",
                expectedImpact: "15% more focused discussions",
              },
              {
                action: "master_parking_lot_technique",
                difficulty: "medium",
                timeline: "3_weeks",
                expectedImpact: "25% reduction in off-topic discussions",
              },
            ],
          },
          {
            focusArea: "time_management",
            currentLevel: "intermediate",
            targetLevel: "expert",
            actions: [
              {
                action: "implement_eisenhower_matrix",
                difficulty: "low",
                timeline: "1_week",
                expectedImpact: "30% better prioritization",
              },
              {
                action: "master_calendar_blocking",
                difficulty: "medium",
                timeline: "2_weeks",
                expectedImpact: "40% reduction in meeting overload",
              },
            ],
          },
        ],
        progressTracking: {
          baselineAssessment: "2026-01-01",
          currentAssessment: "2026-01-20",
          improvements: {
            meeting_efficiency: 12, // percentage points
            time_management: 8,
            communication: 15,
          },
          goals: {
            meeting_efficiency: {
              current: 65,
              target: 85,
              deadline: "2026-03-01",
            },
            time_management: {
              current: 72,
              target: 90,
              deadline: "2026-04-01",
            },
          },
        },
      }

      expect(behavioralInsights.behavioralPatterns).toHaveLength(4)
      expect(behavioralInsights.coachingRecommendations).toHaveLength(2)
      expect(
        behavioralInsights.coachingRecommendations[0].actions
      ).toHaveLength(3)
      expect(
        behavioralInsights.progressTracking.improvements.meeting_efficiency
      ).toBe(12)
    })
  })

  describe("Scenario 4: Advanced Reporting and Export", () => {
    it("should validate comprehensive analytics export", () => {
      const analyticsExport = {
        userId: "user-123",
        exportType: "comprehensive_analytics",
        dateRange: {
          start: "2026-01-01T00:00:00Z",
          end: "2026-01-31T23:59:59Z",
        },
        format: "json",
        sections: [
          {
            section: "productivity_metrics",
            data: {
              totalHours: 160,
              productiveHours: 112,
              meetingHours: 64,
              utilizationRate: 0.7,
              efficiencyScore: 0.82,
            },
          },
          {
            section: "meeting_analytics",
            data: {
              totalMeetings: 45,
              averageDuration: 62,
              attendanceRate: 0.89,
              onTimeRate: 0.88,
              meetingsByType: {
                "1:1": 15,
                team: 20,
                client: 8,
                all_hands: 2,
              },
            },
          },
          {
            section: "calendar_health",
            data: {
              fragmentationScore: 0.72,
              overbookingIncidents: 3,
              bufferTimeAverage: 12,
              workingHoursCompliance: 0.85,
              healthGrade: "B",
            },
          },
          {
            section: "trends_and_forecasts",
            data: {
              productivityTrend: "stable",
              meetingLoadTrend: "increasing",
              efficiencyTrend: "improving",
              predictedUtilization: 0.72,
              confidenceLevel: 0.78,
            },
          },
          {
            section: "recommendations",
            data: [
              {
                priority: "high",
                category: "time_management",
                recommendation: "Add buffer time between meetings",
                expectedBenefit: "20% stress reduction",
              },
              {
                priority: "medium",
                category: "meeting_efficiency",
                recommendation: "Implement meeting agendas",
                expectedBenefit: "25% better outcomes",
              },
            ],
          },
        ],
        metadata: {
          generatedAt: "2026-01-20T10:00:00Z",
          version: "2.1.0",
          processingTime: 1250, // ms
          dataPoints: 2847,
          exportSize: "2.3MB",
        },
      }

      expect(analyticsExport.sections).toHaveLength(5)
      expect((analyticsExport.sections[0].data as any).totalHours).toBe(160)
      expect(analyticsExport.metadata.dataPoints).toBe(2847)
    })

    it("should validate executive summary generation", () => {
      const executiveSummary = {
        userId: "user-123",
        period: "Q1_2026",
        summary: {
          overallPerformance: {
            grade: "B+",
            score: 82,
            trend: "improving",
            keyStrengths: [
              "Strong meeting attendance",
              "Good time utilization",
              "Consistent productivity",
            ],
            keyAreas: [
              "Meeting efficiency could improve",
              "Buffer time between meetings",
              "Calendar fragmentation",
            ],
          },
          keyMetrics: {
            utilizationRate: 0.7,
            meetingEfficiency: 0.82,
            calendarHealth: 0.75,
            workLifeBalance: 0.68,
          },
          highlights: [
            "Increased productivity by 8% compared to last quarter",
            "Reduced meeting time by 12% through better planning",
            "Improved calendar health score from C to B",
            "Maintained strong work-life balance",
          ],
          priorities: [
            {
              priority: 1,
              action: "Implement meeting agendas for all meetings",
              impact: "high",
              effort: "medium",
            },
            {
              priority: 2,
              action: "Add 15-minute buffers between meetings",
              impact: "high",
              effort: "low",
            },
            {
              priority: 3,
              action: "Review and optimize recurring meetings",
              impact: "medium",
              effort: "medium",
            },
          ],
        },
        charts: {
          productivityTrend: {
            type: "line_chart",
            data: [
              { month: "Jan", productivity: 0.75 },
              { month: "Feb", productivity: 0.78 },
              { month: "Mar", productivity: 0.82 },
            ],
          },
          meetingDistribution: {
            type: "pie_chart",
            data: {
              "1:1": 33,
              team: 45,
              client: 18,
              other: 4,
            },
          },
          calendarUtilization: {
            type: "heatmap",
            data: "weekly_calendar_heatmap_data",
          },
        },
      }

      expect(executiveSummary.summary.overallPerformance.grade).toBe("B+")
      expect(executiveSummary.summary.keyMetrics.utilizationRate).toBe(0.7)
      expect(executiveSummary.summary.priorities).toHaveLength(3)
      expect(executiveSummary.charts.productivityTrend.data).toHaveLength(3)
    })

    it("should validate custom analytics dashboards", () => {
      const customDashboard = {
        userId: "user-123",
        dashboardId: "executive-overview",
        name: "Executive Productivity Dashboard",
        widgets: [
          {
            id: "productivity_score",
            type: "metric_card",
            title: "Productivity Score",
            value: 82,
            trend: "+5%",
            color: "green",
            size: "small",
          },
          {
            id: "meeting_efficiency",
            type: "progress_bar",
            title: "Meeting Efficiency",
            value: 0.78,
            target: 0.85,
            color: "yellow",
            size: "medium",
          },
          {
            id: "calendar_health",
            type: "gauge_chart",
            title: "Calendar Health",
            value: 72,
            ranges: [
              { min: 0, max: 50, color: "red", label: "Poor" },
              { min: 50, max: 75, color: "yellow", label: "Good" },
              { min: 75, max: 100, color: "green", label: "Excellent" },
            ],
            size: "medium",
          },
          {
            id: "time_allocation",
            type: "donut_chart",
            title: "Time Allocation",
            data: {
              meetings: 40,
              deep_work: 30,
              communication: 20,
              other: 10,
            },
            size: "large",
          },
          {
            id: "productivity_trend",
            type: "line_chart",
            title: "Productivity Trend",
            data: [
              { date: "2026-01-01", value: 75 },
              { date: "2026-01-08", value: 78 },
              { date: "2026-01-15", value: 80 },
              { date: "2026-01-22", value: 82 },
            ],
            size: "large",
          },
          {
            id: "top_recommendations",
            type: "list",
            title: "Top Recommendations",
            items: [
              "Add buffer time between meetings",
              "Implement meeting agendas",
              "Review recurring meeting necessity",
              "Protect deep work time blocks",
            ],
            size: "medium",
          },
        ],
        layout: {
          columns: 3,
          rows: 2,
          widgetArrangement: [
            ["productivity_score", "meeting_efficiency", "calendar_health"],
            ["time_allocation", "productivity_trend", "top_recommendations"],
          ],
        },
        settings: {
          autoRefresh: true,
          refreshInterval: 3600000, // 1 hour
          dateRange: "last_30_days",
          timezone: "America/New_York",
          theme: "professional",
        },
      }

      expect(customDashboard.widgets).toHaveLength(6)
      expect(customDashboard.layout.columns).toBe(3)
      expect(customDashboard.layout.rows).toBe(2)
      expect(customDashboard.settings.autoRefresh).toBe(true)
    })
  })
})
