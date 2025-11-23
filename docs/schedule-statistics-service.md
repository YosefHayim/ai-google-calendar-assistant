# Schedule Statistics Service Documentation

## Overview

The `ScheduleStatisticsService` provides comprehensive schedule analysis and insights by calculating statistics from Google Calendar events. It supports caching, optimization for large date ranges, and integration with the routine learning system.

## Features

- **Comprehensive Statistics**: Total events, hours, averages, breakdowns (daily, weekly, monthly)
- **Hourly Analysis**: Busiest/quiet hours, peak activity windows, average duration per hour
- **Work Time Tracking**: Work/personal categorization, overtime detection, work-life balance metrics
- **Routine Insights**: Recurring patterns, event type preferences, time slot preferences
- **Caching**: TTL-based cache with automatic expiration (1h daily, 6h weekly, 24h monthly)
- **Optimization**: Batch fetching for large date ranges (30-day chunks)
- **Natural Language Support**: Parse queries like "this week", "last month", "last 7 days"

## API Reference

### `getStatistics(userId, email, startDate, endDate, options?)`

Get comprehensive statistics for a date range.

**Returns**: `ScheduleStatistics` with:
- `totalEvents`: Total number of events
- `totalHours`: Total scheduled hours
- `averageEventsPerDay`: Average events per day
- `averageHoursPerDay`: Average hours per day
- `busiestDay`: Date with most events
- `freeTimeHours`: Average free time per day
- `dailyBreakdown`: Events per day
- `weeklyBreakdown`: Events per day of week
- `monthlyBreakdown`: Events per month

**Example**:
```typescript
const stats = await service.getStatistics(
  userId,
  email,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
```

### `getDailyStatistics(userId, email, date, options?)`

Get statistics for a specific day.

**Returns**: `DailyBreakdown` with events for that day.

### `getWeeklyStatistics(userId, email, weekStart, options?)`

Get statistics for a week starting from `weekStart` (Monday).

### `getMonthlyStatistics(userId, email, month, options?)`

Get statistics for a specific month.

### `getHourlyStatistics(userId, email, startDate, endDate, options?)`

Get hourly analysis including:
- `eventsPerHour`: Events per hour (0-23)
- `busiestHours`: Top 5 busiest hours
- `quietHours`: Hours with fewest events
- `peakActivityWindows`: Consecutive busy hours
- `averageDurationPerHour`: Average event duration per hour

### `getWorkTimeAnalysis(userId, email, startDate, endDate, options?)`

Get work time analysis including:
- `totalWorkHours`: Total work hours
- `totalPersonalHours`: Total personal hours
- `meetingHours`: Hours spent in meetings
- `focusTimeHours`: Hours for focused work
- `overtimeDetected`: Whether overtime threshold exceeded
- `workLifeBalanceRatio`: Work hours / personal hours
- `workHoursByDayOfWeek`: Work hours per day

**Options**:
- `workHoursStart`: Default 9 (9 AM)
- `workHoursEnd`: Default 17 (5 PM)
- `overtimeThreshold`: Default 40 hours/week
- `workKeywords`: Keywords to identify work events
- `personalKeywords`: Keywords to identify personal events

### `getRoutineInsights(userId, email, startDate, endDate, options?)`

Get routine insights including:
- `recurringPatterns`: Detected recurring events
- `mostCommonEventTypes`: Most frequent event types
- `timeSlotPreferences`: Favorite hours for events
- `dayOfWeekPreferences`: Favorite days
- `durationPatterns`: Common event durations
- `actionableInsights`: Natural language insights
- `optimizationSuggestions`: Suggestions for optimization

### `getEnhancedInsights(userId, email, startDate, endDate, options?)`

Get enhanced insights by integrating with routine learning system. Cross-references statistics with learned routines.

**Returns**: Combined statistics, routine insights, learned routines, and cross-referenced insights.

### `invalidateCache(userId, startDate?, endDate?)`

Invalidate cached statistics for a user. Call when new events are added.

## Caching

Statistics are automatically cached for common periods:
- **Daily**: 1 hour TTL
- **Weekly**: 6 hours TTL
- **Monthly**: 24 hours TTL

Cache is stored in `user_schedule_statistics` table. Custom date ranges are not cached.

## Natural Language Date Parsing

The service supports natural language date expressions:

- `"today"`, `"yesterday"`
- `"this week"`, `"last week"`, `"next week"`
- `"this month"`, `"last month"`, `"next month"`
- `"last 7 days"`, `"last 30 days"`
- `"last 2 weeks"`, `"last 3 months"`
- ISO date strings: `"2025-01-23"`

## Agent Tool Usage

The service is accessible via the `get_schedule_statistics` agent tool:

```typescript
// Basic usage
get_schedule_statistics({
  email: "user@example.com",
  periodType: "weekly"
})

// With natural language dates
get_schedule_statistics({
  email: "user@example.com",
  startDate: "last week",
  endDate: "today",
  statisticsType: "work_time"
})
```

## Performance Considerations

- **Large Date Ranges**: Automatically batches in 30-day chunks
- **Caching**: Use common periods (daily, weekly, monthly) for best performance
- **Memory**: Processes events in chunks to avoid memory issues
- **Timeout**: Real-time calculations timeout after 30 seconds

## Error Handling

All methods throw errors that should be caught. Caching failures are non-critical and fall back to real-time calculation.

## Integration with Routine Learning

The service integrates with `RoutineLearningService` to provide enhanced insights:
- Cross-references statistics with learned routines
- Compares actual vs predicted patterns
- Provides proactive suggestions based on routine deviations

## Examples

### Get weekly statistics
```typescript
const stats = await service.getWeeklyStatistics(
  userId,
  email,
  new Date('2025-01-20') // Monday
);
console.log(`Total events: ${stats.totalEvents}`);
console.log(`Busiest day: ${stats.busiestDay?.date}`);
```

### Get work time analysis
```typescript
const workTime = await service.getWorkTimeAnalysis(
  userId,
  email,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
if (workTime.overtimeDetected) {
  console.log(`Overtime detected: ${workTime.overtimeHours} hours`);
}
```

### Get enhanced insights
```typescript
const insights = await service.getEnhancedInsights(
  userId,
  email,
  new Date('2025-01-01'),
  new Date('2025-01-31')
);
console.log(`Learned routines: ${insights.learnedRoutines.length}`);
insights.crossReferencedInsights.forEach(insight => {
  console.log(`- ${insight}`);
});
```

