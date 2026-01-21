# User Business Scenario Tests

This directory contains comprehensive tests covering all user business scenarios and journeys in the AI Google Calendar Assistant. Tests are organized by user experience rather than technical layers for better understanding and maintenance.

## Directory Structure

```
tests/
├── journeys/                    # End-to-end user journey tests
│   ├── onboarding-journey.test.ts     # New user registration & setup
│   ├── calendar-management-journey.test.ts # Calendar operations workflow
│   ├── ai-assistant-journey.test.ts   # AI chat interactions
│   ├── subscription-journey.test.ts   # Payment & subscription flow
│   ├── team-collaboration-journey.test.ts # Team features
│   └── advanced-features-journey.test.ts # Analytics, voice, integrations
├── cross-modal/                 # Cross-platform interaction tests
│   ├── web-to-telegram-sync.test.ts
│   ├── voice-to-web-continuation.test.ts
│   ├── whatsapp-integration.test.ts
│   └── slack-workspace-sync.test.ts
├── scenarios/                   # Business scenario tests (existing)
│   ├── ai-chat-journey.test.ts
│   ├── calendar-operations-journey.test.ts
│   └── user-subscription-journey.test.ts
├── edge-cases/                  # Error handling & boundary tests
│   ├── error-recovery.test.ts
│   ├── rate-limiting.test.ts
│   ├── data-validation.test.ts
│   └── security-boundaries.test.ts
├── integration/                 # Full integration tests
│   ├── api-endpoints.test.ts
│   ├── database-integrations.test.ts
│   └── external-services.test.ts
├── controllers/                 # Unit tests for controllers
├── services/                    # Unit tests for services
├── utils/                       # Unit tests for utilities
├── middlewares/                 # Middleware tests
├── infrastructure/              # Infrastructure integration tests
└── ai-agents/                   # AI agent specific tests
```

## Test Categories & Coverage Targets

| Category | Coverage Target | Description |
|----------|----------------|-------------|
| **Journeys** | 95%+ | Critical user paths from onboarding to advanced features |
| **Cross-modal** | 90%+ | Multi-platform synchronization and interactions |
| **Edge Cases** | 85%+ | Error handling, security, and boundary conditions |
| **Integration** | 80%+ | End-to-end API and service integrations |
| **Unit Tests** | 75%+ | Individual components and utilities |

## Running Tests

```bash
# Run all tests
bun run jest

# Run tests with coverage
bun run jest --coverage

# Run specific test categories
bun run jest journeys/        # User journey tests
bun run jest cross-modal/     # Cross-platform tests
bun run jest edge-cases/      # Error handling tests
bun run jest integration/     # Integration tests
bun run jest scenarios/       # Business scenario tests (existing)

# Run specific business scenarios
bun run jest journeys/onboarding-journey.test.ts
bun run jest journeys/calendar-management-journey.test.ts
bun run jest journeys/ai-assistant-journey.test.ts
bun run jest cross-modal/web-to-telegram-sync.test.ts
bun run jest edge-cases/error-recovery.test.ts
bun run jest integration/end-to-end-user-journey.test.ts

# Run tests by business domain
bun run jest --testNamePattern="subscription|payment"  # Payment-related tests
bun run jest --testNamePattern="calendar|event"        # Calendar tests
bun run jest --testNamePattern="ai|assistant"          # AI tests
bun run jest --testNamePattern="voice|telegram"        # Multi-modal tests

# Watch mode
bun run jest --watch

# Run tests with detailed output
bun run jest --verbose

# Run tests in band (single process, better for debugging)
bun run jest --runInBand
```

## Test Organization Principles

### 1. Journey-Based Organization
Tests are organized around user experiences rather than technical components:
- **Journeys**: Complete user workflows from start to finish
- **Scenarios**: Specific business use cases
- **Cross-modal**: Interactions across different platforms/channels

### 2. Business Logic First
Each test focuses on business value:
- What user problem is being solved?
- What business rules apply?
- What user expectations exist?

### 3. Clear Test Naming
Tests use descriptive names that explain the business scenario:
```typescript
describe("New User Onboarding Journey", () => {
  it("should complete full registration and calendar setup", () => {
    // Test implementation
  });
});
```

### 4. Comprehensive Coverage
Tests cover all user touchpoints:
- **Happy path**: Expected user flows
- **Edge cases**: Error conditions and boundaries
- **Cross-platform**: Consistency across web, mobile, voice, chat
- **Data integrity**: Business rules and validations

## Business Scenarios Covered

### Core User Journeys
1. **Onboarding**: Registration → OAuth → Calendar sync → First AI interaction
2. **Calendar Management**: View events → Create events → Edit → Delete → Recurring
3. **AI Assistant**: Chat → Voice → Quick add → Smart suggestions → Context awareness
4. **Subscription**: Free trial → Payment → Upgrades → Cancellation → Refunds
5. **Team Collaboration**: Invites → Shared calendars → Permissions → Notifications
6. **Advanced Features**: Analytics → Voice calls → Integrations → Customizations

### Cross-Modal Scenarios
1. **Context Sync**: Start on web, continue on Telegram
2. **Channel Switching**: Voice to chat to web seamlessly
3. **Unified Experience**: Consistent behavior across all platforms
4. **Notification Routing**: Appropriate channel for each notification type

### Edge Cases & Error Handling
1. **Network failures**: Retry logic and graceful degradation
2. **Rate limiting**: Proper handling of API limits
3. **Data validation**: Malformed inputs and security boundaries
4. **Authentication**: Token refresh, session management, security
5. **Payment failures**: Subscription issues, refunds, disputes
6. **Calendar conflicts**: Overlapping events, permission issues

## Best Practices

### 1. Business-Focused Testing
```typescript
// ✅ Good: Business scenario
describe("User schedules meeting with AI", () => {
  it("should create event when user says 'schedule team meeting tomorrow at 3pm'", () => {
    // Test the complete business flow
  });
});

// ❌ Bad: Technical implementation
describe("ChatController.processMessage", () => {
  it("should call AI agent with correct parameters", () => {
    // Too focused on implementation details
  });
});
```

### 2. Comprehensive Mocking Strategy
- **External APIs**: Mock Google Calendar, OpenAI, LemonSqueezy
- **Database**: Mock Supabase queries and mutations
- **Internal Services**: Mock complex business logic
- **Time-dependent**: Mock dates and timers for predictable tests

### 3. Test Data Management
- **Factories**: Reusable test data builders
- **Constants**: Well-known test values for consistency
- **Cleanup**: Proper teardown and isolation

### 4. Async Testing Best Practices
- **Proper awaits**: All async operations properly awaited
- **Promise flushing**: Handle microtask queues correctly
- **Timeout handling**: Appropriate timeouts for external calls

### 5. Error Testing
- **Expected errors**: Test that errors are thrown for invalid inputs
- **Recovery scenarios**: Test retry logic and fallback behavior
- **User-friendly messages**: Verify error messages are helpful

## Coverage Reports

After running tests with coverage, view the report at:
- HTML report: `coverage/index.html`
- Terminal output: Displayed after test run
- JSON summary: `coverage/coverage-summary.json`
