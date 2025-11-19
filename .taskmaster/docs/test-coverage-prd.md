# Product Requirements Document: 100% Test Coverage

## Project: AI Google Calendar Assistant - Complete Test Coverage

### Overview
Implement comprehensive unit tests for all untested and partially tested code to achieve 100% test coverage across the entire codebase.

### Current State
- Overall coverage: 90.73% statements, 88.15% branches, 92.68% functions
- Coverage threshold: 90% (currently failing on branches at 88.76%)
- 2 failing tests in Event.test.ts
- Multiple files with 0% coverage
- Several directories completely excluded from testing

---

## Phase 1: Fix Failing Tests

### Task 1.1: Fix Event Entity Time Method Tests
**Priority:** Critical
**Description:** Fix the 2 failing tests in Event.test.ts related to time validation
**Details:**
- Test: "should throw error when start has no valid time"
- Test: "should throw error when end has no valid time"
- Both tests are failing because they expect validation to throw for missing times, but format mismatch validation is firing first
- Need to adjust test expectations or Event validation logic

---

## Phase 2: Complete Coverage for Partially Tested Files

### Task 2.1: Complete EventDateTime Coverage (91.17% → 100%)
**Priority:** High
**Description:** Add tests for uncovered lines in EventDateTime.ts
**Uncovered Lines:** 12, 15, 156, 175, 207, 220
**Test Cases Needed:**
- Edge cases for dateTime parsing
- Timezone handling edge cases
- Date-only event scenarios

### Task 2.2: Complete Event Entity Coverage (94.06% → 100%)
**Priority:** High
**Description:** Add tests for uncovered lines in Event.ts
**Uncovered Lines:** 195-198, 208-211, 310
**Test Cases Needed:**
- Edge cases in time validation
- Boundary conditions for event updates
- Error handling paths

### Task 2.3: Complete EventMapper Coverage (91.83% → 100%)
**Priority:** High
**Description:** Add tests for uncovered lines in EventMapper.ts
**Uncovered Lines:** 165, 180, 184-186
**Test Cases Needed:**
- Edge cases in DTO to entity mapping
- Error handling in transformation logic

### Task 2.4: Complete formatDate Coverage (92.85% → 100%)
**Priority:** Medium
**Description:** Add tests for uncovered line 13 in formatDate.ts
**Test Cases Needed:**
- Edge case that triggers line 13

### Task 2.5: Complete Calendar Entity Coverage (100% → true 100%)
**Priority:** Medium
**Description:** Add tests for branch coverage on lines 131, 221-222 in Calendar.ts
**Test Cases Needed:**
- Conditional branches not currently tested

### Task 2.6: Complete User Entity Coverage (100% → true 100%)
**Priority:** Medium
**Description:** Add tests for branch coverage on lines 294-295 in User.ts
**Test Cases Needed:**
- Conditional branches not currently tested

---

## Phase 3: Test Utility Files with 0% Coverage

### Task 3.1: Test activateAgent.ts
**Priority:** High
**Description:** Create comprehensive tests for AI agent activation logic
**Coverage:** 0% → 100%
**Test Cases:**
- Agent initialization
- Error handling
- Configuration validation

### Task 3.2: Test getTokensUserAI.ts
**Priority:** High
**Description:** Create tests for AI token retrieval logic
**Coverage:** 0% → 100%
**Test Cases:**
- Successful token retrieval
- Error scenarios
- Token validation

### Task 3.3: Test handleEvents.ts
**Priority:** High
**Description:** Create tests for event handling utilities
**Coverage:** 0% → 100%
**Test Cases:**
- Event processing logic
- Error handling
- Edge cases

### Task 3.4: Test initCalendarWithUserTokens.ts
**Priority:** High
**Description:** Create tests for calendar initialization with user tokens
**Coverage:** 0% → 100%
**Test Cases:**
- Successful initialization
- Token validation
- Error scenarios

### Task 3.5: Test thirdPartyAuth.ts
**Priority:** High
**Description:** Create tests for third-party authentication logic
**Coverage:** 0% → 100%
**Test Cases:**
- OAuth flow handling
- Token management
- Error scenarios

### Task 3.6: Test updateCalendarCategories.ts
**Priority:** Medium
**Description:** Create tests for calendar category updates
**Coverage:** 0% → 100%
**Test Cases:**
- Category update logic
- Validation
- Error handling

### Task 3.7: Test updateUserTokens.ts
**Priority:** High
**Description:** Create tests for user token update logic
**Coverage:** 0% → 100%
**Test Cases:**
- Token refresh
- Token storage
- Error scenarios

---

## Phase 4: Test Auth Utilities (Currently Ignored)

### Task 4.1: Test exchangeOAuthToken.ts
**Priority:** High
**Description:** Create tests for OAuth token exchange
**Test Cases:**
- Successful token exchange
- Invalid codes
- Network errors
- Token validation

### Task 4.2: Test generateAuthUrl.ts
**Priority:** High
**Description:** Create tests for auth URL generation
**Test Cases:**
- URL generation with various configs
- State parameter handling
- Scope validation

### Task 4.3: Test storeUserTokens.ts
**Priority:** High
**Description:** Create tests for token storage logic
**Test Cases:**
- Token encryption/storage
- Update scenarios
- Error handling

### Task 4.4: Test userOperations.ts
**Priority:** High
**Description:** Create tests for user CRUD operations
**Test Cases:**
- User creation
- User updates
- User deletion
- Error scenarios

---

## Phase 5: Test Infrastructure Components (Currently Ignored)

### Task 5.1: Test GoogleCalendarCalendarRepository.ts
**Priority:** High
**Description:** Create tests for Google Calendar repository
**Test Cases:**
- Calendar CRUD operations
- Google API integration mocking
- Error handling
- Rate limiting scenarios

### Task 5.2: Test GoogleCalendarEventRepository.ts
**Priority:** High
**Description:** Create tests for Google Calendar Event repository
**Test Cases:**
- Event CRUD operations
- Batch operations
- Recurring events
- Error scenarios

### Task 5.3: Test SupabaseUserRepository.ts
**Priority:** High
**Description:** Create tests for Supabase user repository
**Test Cases:**
- User CRUD operations
- Query operations
- Error handling
- Connection failures

### Task 5.4: Test DI Container (container.ts)
**Priority:** Medium
**Description:** Create tests for dependency injection container
**Test Cases:**
- Service registration
- Service resolution
- Lifecycle management
- Error scenarios

### Task 5.5: Test Infrastructure Clients
**Priority:** High
**Description:** Create tests for all client implementations in infrastructure/clients/
**Test Cases:**
- Client initialization
- API calls
- Error handling
- Retry logic

### Task 5.6: Test Feature Flags
**Priority:** Medium
**Description:** Create tests for feature flag system in infrastructure/feature-flags/
**Test Cases:**
- Flag evaluation
- Default values
- Configuration loading

### Task 5.7: Test Middleware
**Priority:** High
**Description:** Create tests for all middleware in infrastructure/middleware/
**Test Cases:**
- Request processing
- Error handling
- Next() calls

### Task 5.8: Test Monitoring
**Priority:** Medium
**Description:** Create tests for monitoring infrastructure
**Test Cases:**
- Metrics collection
- Logging
- Error tracking

---

## Phase 6: Test Services (Currently Ignored)

### Task 6.1: Test CalendarService.ts
**Priority:** High
**Description:** Create comprehensive tests for calendar service
**Test Cases:**
- Calendar operations orchestration
- Business logic validation
- Error handling
- Repository integration

### Task 6.2: Test EventService.ts
**Priority:** High
**Description:** Create comprehensive tests for event service
**Test Cases:**
- Event operations orchestration
- Business logic validation
- Conflict detection
- Repository integration

---

## Phase 7: Test Controllers (Currently Ignored)

### Task 7.1: Test All Controllers
**Priority:** High
**Description:** Create tests for all controllers in controllers/ directory
**Test Cases:**
- Request handling
- Response formatting
- Validation
- Error handling
- Service integration

---

## Phase 8: Test Routes (Currently Ignored)

### Task 8.1: Test All Routes
**Priority:** High
**Description:** Create integration tests for all routes in routes/ directory
**Test Cases:**
- Route registration
- Request/response handling
- Middleware integration
- Error scenarios
- Authentication/authorization

---

## Phase 9: Test AI Agents (Currently Ignored)

### Task 9.1: Test AI Agent System
**Priority:** High
**Description:** Create tests for AI agent system in ai-agents/ directory
**Test Cases:**
- Agent initialization
- Message processing
- Tool usage
- Error handling
- OpenAI API mocking

---

## Phase 10: Test Telegram Bot (Currently Ignored)

### Task 10.1: Test Telegram Bot Integration
**Priority:** High
**Description:** Create tests for Telegram bot in telegram-bot/ directory
**Test Cases:**
- Command handling
- Message processing
- User session management
- Error handling
- Telegram API mocking

---

## Success Criteria

1. All existing tests pass (0 failures)
2. Overall test coverage >= 90% for all metrics (statements, branches, functions, lines)
3. No files with 0% coverage (except explicitly ignored config files)
4. All critical paths have test coverage
5. Edge cases and error scenarios are tested
6. Integration tests cover main user flows

## Testing Standards

- Use Jest with ts-jest
- Follow AAA pattern (Arrange, Act, Assert)
- Mock external dependencies (Google Calendar API, Supabase, OpenAI, Telegram)
- Use descriptive test names
- Group related tests with describe blocks
- Test both success and failure paths
- Test edge cases and boundary conditions
- Maintain test isolation (no shared state)
- Use setup/teardown appropriately

## Dependencies

- Jest
- ts-jest
- @types/jest
- jest-mock-extended (for advanced mocking)
- Existing mock implementations

## Timeline Estimate

- Phase 1: 1 day (fix failing tests)
- Phase 2: 2-3 days (complete partial coverage)
- Phase 3: 3-4 days (utility files)
- Phase 4: 2-3 days (auth utilities)
- Phase 5: 5-7 days (infrastructure)
- Phase 6: 3-4 days (services)
- Phase 7: 3-4 days (controllers)
- Phase 8: 3-4 days (routes)
- Phase 9: 2-3 days (AI agents)
- Phase 10: 2-3 days (Telegram bot)

**Total: ~30-40 days** (can be parallelized across multiple developers)
