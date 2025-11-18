# Migration Testing Strategy

## Overview

This document outlines the comprehensive testing strategy for the architecture migration, ensuring safe transition from the old implementation to the new repository pattern, service layer, and enhanced API clients.

## Testing Levels

### 1. Unit Testing

**Target Coverage**: 80% global, 95% domain layer

#### Repository Layer Tests

```typescript
// Example: Event Repository Tests
describe("GoogleCalendarEventRepository", () => {
  let mockCalendar: jest.Mocked<calendar_v3.Calendar>;
  let repository: GoogleCalendarEventRepository;

  beforeEach(() => {
    mockCalendar = createMockCalendar();
    repository = new GoogleCalendarEventRepository(mockCalendar);
  });

  it("should create event successfully", async () => {
    const eventDTO: CreateEventDTO = {
      summary: "Test Event",
      start: { dateTime: "2025-01-01T10:00:00Z", timeZone: "UTC" },
      end: { dateTime: "2025-01-01T11:00:00Z", timeZone: "UTC" },
    };

    const result = await repository.create(eventDTO);

    expect(result.summary).toBe("Test Event");
    expect(mockCalendar.events.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        requestBody: expect.objectContaining({ summary: "Test Event" }),
      })
    );
  });

  it("should handle API errors gracefully", async () => {
    mockCalendar.events.insert.mockRejectedValue(
      new Error("API Error: Rate limit exceeded")
    );

    await expect(repository.create(validEventDTO)).rejects.toThrow(
      "Failed to create event"
    );
  });
});
```

#### Service Layer Tests

```typescript
describe("EventService", () => {
  let service: EventService;
  let mockRepository: jest.Mocked<IEventRepository>;

  beforeEach(() => {
    mockRepository = createMockEventRepository();
    service = new EventService(mockRepository);
  });

  it("should validate event data before creation", async () => {
    const invalidEvent: CreateEventDTO = {
      summary: "", // Invalid: empty summary
      start: { dateTime: "2025-01-01T10:00:00Z" },
      end: { dateTime: "2025-01-01T09:00:00Z" }, // Invalid: end before start
    };

    await expect(service.createEvent(invalidEvent)).rejects.toThrow(
      ValidationError
    );
  });

  it("should log operations with proper context", async () => {
    const loggerSpy = jest.spyOn(service["logger"], "info");

    await service.createEvent(validEventDTO);

    expect(loggerSpy).toHaveBeenCalledWith(
      "Creating new event",
      expect.objectContaining({ summary: validEventDTO.summary })
    );
  });
});
```

#### Middleware Tests

```typescript
describe("RetryMiddleware", () => {
  it("should retry on transient failures", async () => {
    let attempt = 0;
    const failTwiceThenSucceed = async () => {
      attempt++;
      if (attempt < 3) throw new Error("ECONNRESET");
      return "success";
    };

    const result = await retryMiddleware.execute(failTwiceThenSucceed);

    expect(result).toBe("success");
    expect(attempt).toBe(3); // Failed twice, succeeded on third
  });

  it("should not retry on non-retryable errors", async () => {
    const nonRetryableError = async () => {
      throw new Error("Invalid input");
    };

    await expect(retryMiddleware.execute(nonRetryableError)).rejects.toThrow(
      "Invalid input"
    );
  });
});

describe("RateLimiter", () => {
  it("should enforce rate limits", async () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 1000 });

    // Execute 5 requests (should succeed)
    for (let i = 0; i < 5; i++) {
      await limiter.execute(async () => "success");
    }

    // 6th request should wait
    const startTime = Date.now();
    await limiter.execute(async () => "delayed");
    const waitTime = Date.now() - startTime;

    expect(waitTime).toBeGreaterThan(900); // Should wait ~1000ms
  });
});
```

### 2. Integration Testing

**Purpose**: Test interaction between multiple components

#### Old vs New Implementation Comparison

```typescript
describe("Migration Integration Tests", () => {
  it("should produce identical results for event creation", async () => {
    const eventData = createTestEventData();

    // Old implementation
    const oldResult = await oldEventsHandler(eventData);

    // New implementation (using feature flag)
    featureFlags.enable(FeatureFlags.USE_EVENT_REPOSITORY);
    const newResult = await newEventsHandler(eventData);

    expect(newResult).toEqual(oldResult);
  });

  it("should handle errors consistently", async () => {
    const invalidEvent = createInvalidEventData();

    // Both should throw similar errors
    await expect(oldEventsHandler(invalidEvent)).rejects.toThrow();
    await expect(newEventsHandler(invalidEvent)).rejects.toThrow();
  });
});
```

#### Feature Flag Integration

```typescript
describe("Feature Flag Integration", () => {
  it("should route to new implementation when flag is enabled", async () => {
    const repository = createMockEventRepository();
    featureFlags.enable(FeatureFlags.USE_EVENT_REPOSITORY, 100);

    await createEvent(eventData);

    expect(repository.create).toHaveBeenCalled();
  });

  it("should route to old implementation when flag is disabled", async () => {
    const oldImplementation = jest.fn();
    featureFlags.disable(FeatureFlags.USE_EVENT_REPOSITORY);

    await createEvent(eventData);

    expect(oldImplementation).toHaveBeenCalled();
  });

  it("should respect rollout percentage", async () => {
    featureFlags.setRolloutPercentage(FeatureFlags.USE_EVENT_REPOSITORY, 50);

    const results = { old: 0, new: 0 };

    // Execute 100 requests with different user IDs
    for (let i = 0; i < 100; i++) {
      const userId = `user-${i}`;
      const usedNew = await trackImplementationUsed(userId);
      results[usedNew ? "new" : "old"]++;
    }

    // Should be roughly 50/50 split
    expect(results.new).toBeGreaterThan(40);
    expect(results.new).toBeLessThan(60);
  });
});
```

### 3. Performance Testing

**Goal**: Ensure new implementation meets or exceeds performance of old implementation

#### Load Testing

```typescript
describe("Performance Tests", () => {
  it("should handle high concurrency", async () => {
    const requests = Array(1000)
      .fill(null)
      .map(() => createEvent(generateRandomEventData()));

    const startTime = Date.now();
    await Promise.all(requests);
    const duration = Date.now() - startTime;

    expect(duration).toBeLessThan(10000); // Should complete in < 10 seconds
  });

  it("should maintain latency under load", async () => {
    const latencies: number[] = [];

    for (let i = 0; i < 100; i++) {
      const start = Date.now();
      await createEvent(generateRandomEventData());
      latencies.push(Date.now() - start);
    }

    const p95 = calculatePercentile(latencies, 95);
    const p99 = calculatePercentile(latencies, 99);

    expect(p95).toBeLessThan(500); // P95 < 500ms
    expect(p99).toBeLessThan(1000); // P99 < 1000ms
  });
});
```

#### Comparison Benchmarks

```bash
# Run benchmark comparing old vs new
pnpm test:benchmark

# Expected output:
# Old Implementation:
#   - P50: 120ms
#   - P95: 350ms
#   - P99: 650ms
#   - Throughput: 250 req/s
#
# New Implementation:
#   - P50: 115ms (-4%)
#   - P95: 320ms (-9%)
#   - P99: 580ms (-11%)
#   - Throughput: 270 req/s (+8%)
```

### 4. End-to-End Testing

**Scope**: Full user journey through the application

```typescript
describe("E2E Migration Tests", () => {
  it("should complete full event creation flow", async () => {
    // 1. User authentication
    const authToken = await authenticateUser("test@example.com", "password");

    // 2. Create calendar event
    const response = await request(app)
      .post("/api/events")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        summary: "E2E Test Event",
        start: { dateTime: "2025-01-01T10:00:00Z", timeZone: "UTC" },
        end: { dateTime: "2025-01-01T11:00:00Z", timeZone: "UTC" },
      });

    expect(response.status).toBe(201);
    expect(response.body.summary).toBe("E2E Test Event");

    // 3. Verify event was created
    const getResponse = await request(app)
      .get(`/api/events/${response.body.id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body.summary).toBe("E2E Test Event");

    // 4. Clean up
    await request(app)
      .delete(`/api/events/${response.body.id}`)
      .set("Authorization", `Bearer ${authToken}`);
  });
});
```

### 5. Chaos Testing

**Purpose**: Test resilience and fallback mechanisms

```typescript
describe("Chaos Tests", () => {
  it("should fallback to old implementation on new implementation failure", async () => {
    // Enable new implementation
    featureFlags.enable(FeatureFlags.USE_EVENT_REPOSITORY);

    // Simulate failure in new implementation
    mockNewRepository.create.mockRejectedValue(new Error("Database timeout"));

    // Should fallback to old implementation
    const result = await createEventWithFallback(eventData);

    expect(result).toBeDefined();
    expect(oldImplementation.create).toHaveBeenCalled();
  });

  it("should handle API rate limiting", async () => {
    // Simulate rate limit error
    mockGoogleCalendar.events.insert.mockRejectedValue({
      code: 429,
      message: "Rate limit exceeded",
    });

    // Retry middleware should handle this
    await expect(createEvent(eventData)).rejects.toThrow("Rate limit exceeded");

    // Should have retried
    expect(mockGoogleCalendar.events.insert).toHaveBeenCalledTimes(3);
  });

  it("should handle database connection loss", async () => {
    // Simulate database error
    mockSupabase.from.mockImplementation(() => {
      throw new Error("Connection lost");
    });

    // Should log error and fail gracefully
    await expect(userRepository.findById("user-123")).rejects.toThrow();

    // Should not crash the application
    expect(process.exitCode).toBeUndefined();
  });
});
```

### 6. Shadow Testing

**Description**: Run both implementations in parallel, compare results

```typescript
import { getMetricsService } from "@/infrastructure/monitoring/MetricsService";

async function shadowTest<T>(
  oldImpl: () => Promise<T>,
  newImpl: () => Promise<T>,
  comparator: (a: T, b: T) => boolean
): Promise<T> {
  const metrics = getMetricsService();

  const [oldResult, newResult] = await Promise.allSettled([oldImpl(), newImpl()]);

  // Always return old result (safe)
  if (oldResult.status === "rejected") {
    throw oldResult.reason;
  }

  // Compare results
  if (newResult.status === "fulfilled") {
    const match = comparator(oldResult.value, newResult.value);

    if (match) {
      metrics.incrementCounter("shadow_test.match");
    } else {
      metrics.incrementCounter("shadow_test.mismatch");
      console.warn("Shadow test mismatch:", {
        old: oldResult.value,
        new: newResult.value,
      });
    }
  } else {
    metrics.incrementCounter("shadow_test.new_impl_error");
    console.error("New implementation failed:", newResult.reason);
  }

  return oldResult.value;
}

// Usage
const result = await shadowTest(
  () => oldEventService.createEvent(eventData),
  () => newEventService.createEvent(eventData),
  (a, b) => a.id === b.id && a.summary === b.summary
);
```

## Test Environments

### 1. Development
- **Purpose**: Local testing during development
- **Database**: Local PostgreSQL or Supabase local
- **API**: Mock external APIs
- **Feature Flags**: All enabled for testing

### 2. Staging
- **Purpose**: Pre-production testing
- **Database**: Staging database (copy of production schema)
- **API**: Real APIs with test accounts
- **Feature Flags**: Gradual rollout simulation (5% → 25% → 50% → 100%)

### 3. Production
- **Purpose**: Live environment with real users
- **Database**: Production database
- **API**: Real APIs
- **Feature Flags**: Controlled rollout per migration plan

## Continuous Integration Tests

### Pre-Commit
```bash
# Run before committing
pnpm test:unit
pnpm lint
```

### Pull Request
```yaml
# .github/workflows/pr-tests.yml
name: PR Tests
on: pull_request

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: pnpm install
      - name: Run unit tests
        run: pnpm test:unit
      - name: Run integration tests
        run: pnpm test:integration
      - name: Check coverage
        run: pnpm test:coverage
```

### Main Branch
```yaml
# Additional E2E and performance tests on main
- name: Run E2E tests
  run: pnpm test:e2e
- name: Run performance benchmarks
  run: pnpm test:benchmark
```

## Migration-Specific Test Scenarios

### Scenario 1: Gradual Rollout
```typescript
describe("Gradual Rollout Scenarios", () => {
  it("should maintain stability during 5% rollout", async () => {
    featureFlags.setRolloutPercentage(FeatureFlags.USE_REPOSITORY_PATTERN, 5);

    const results = await runLoadTest(1000);

    expect(results.errorRate).toBeLessThan(0.001);
    expect(results.p95Latency).toBeLessThan(baselineLatency * 1.1);
  });
});
```

### Scenario 2: Rollback Testing
```typescript
describe("Rollback Scenarios", () => {
  it("should rollback successfully under high error rate", async () => {
    featureFlags.enable(FeatureFlags.USE_REPOSITORY_PATTERN, 50);

    // Simulate errors in new implementation
    mockRepository.create.mockRejectedValue(new Error("Service unavailable"));

    // Trigger automatic rollback
    await monitorAndRollbackIfNeeded();

    // Verify rollback
    const flagStatus = featureFlags.isEnabled(FeatureFlags.USE_REPOSITORY_PATTERN);
    expect(flagStatus).toBe(false);
  });
});
```

### Scenario 3: Data Integrity
```typescript
describe("Data Integrity Scenarios", () => {
  it("should maintain data consistency across implementations", async () => {
    const userId = "test-user-123";

    // Create event using old implementation
    const oldEvent = await oldCreateEvent(eventData, userId);

    // Update using new implementation
    featureFlags.enable(FeatureFlags.USE_EVENT_SERVICE);
    const updatedEvent = await newUpdateEvent(oldEvent.id, updateData, userId);

    // Verify data integrity
    expect(updatedEvent.id).toBe(oldEvent.id);
    expect(updatedEvent.summary).toBe(updateData.summary);

    // Verify in database
    const dbEvent = await fetchEventFromDB(oldEvent.id);
    expect(dbEvent).toEqual(updatedEvent);
  });
});
```

## Test Metrics and Reporting

### Coverage Goals
- **Global**: 80%
- **Domain Layer**: 95%
- **Service Layer**: 90%
- **Infrastructure**: 75%
- **Controllers**: 80%

### Performance Benchmarks
- **Latency P95**: < baseline + 10%
- **Throughput**: > baseline
- **Error Rate**: < 0.1%
- **Resource Usage**: < baseline + 20%

### Test Execution Time
- **Unit Tests**: < 2 minutes
- **Integration Tests**: < 5 minutes
- **E2E Tests**: < 10 minutes
- **Full Suite**: < 15 minutes

## Monitoring Test Results

```typescript
// Generate test report
import { generateTestReport } from "./test-utils";

const report = await generateTestReport();
console.log(report);

// Output:
// Test Summary
// ============
// Total Tests: 1,234
// Passed: 1,230
// Failed: 4
// Skipped: 0
// Coverage: 85.3%
// Duration: 8m 45s
//
// Failed Tests:
// - EventService: should handle rate limiting (timeout)
// - CalendarRepository: should retry on network error (assertion failed)
// - FeatureFlags: should respect rollout percentage (flaky)
// - Migration: should match results (data mismatch)
```

## Pre-Release Checklist

Before proceeding with production rollout:

- [ ] All unit tests passing (100%)
- [ ] Integration tests passing (100%)
- [ ] E2E tests passing (100%)
- [ ] Coverage meets thresholds (80%+ global)
- [ ] Performance benchmarks met or exceeded
- [ ] Shadow testing shows 99%+ result match
- [ ] Chaos tests pass (resilience validated)
- [ ] Rollback procedures tested successfully
- [ ] Feature flags tested in staging
- [ ] Load testing completed (no degradation)
- [ ] Security scan completed (no critical issues)
- [ ] Documentation updated
- [ ] Team trained on new features and rollback

## Conclusion

This comprehensive testing strategy ensures a safe, controlled migration with minimal risk to production systems. Regular testing, monitoring, and validation at each phase provide confidence in the new architecture while maintaining the ability to quickly rollback if issues arise.
