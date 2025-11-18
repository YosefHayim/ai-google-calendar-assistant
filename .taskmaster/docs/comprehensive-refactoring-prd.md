# AI Google Calendar Assistant - Comprehensive Refactoring Plan

## Project Overview

This document outlines a complete refactoring plan for the AI Google Calendar Assistant codebase, addressing critical architectural issues including database design, code organization, testing infrastructure, and external API integration.

## Implementation Phases

### Phase 1: Foundation (Weeks 1-3)

#### Agent 1: Unit Testing Infrastructure

**Objective**: Establish comprehensive test coverage with Jest

**Current State**:
- Jest configured but ZERO test files exist
- All dependencies installed (@jest/globals, supertest, ts-jest)
- No testing patterns established

**Requirements**:

1. **Set Up Test Directory Structure**
   - Create `__tests__/` directory with subdirectories for each layer
   - Domain layer tests (95%+ coverage target)
   - Application layer tests (90%+ coverage target)
   - Infrastructure layer tests (75%+ coverage target)
   - Controller tests (80%+ coverage target)

2. **Create Mock Factories**
   - Mock factory for Google Calendar API responses
   - Mock factory for Supabase client
   - Mock factory for OpenAI agents
   - Time/date mocking utilities

3. **Write Domain Layer Tests**
   - Event entity tests
   - Calendar entity tests
   - User entity tests
   - Value object tests (EventDateTime, etc.)

4. **Write Application Layer Tests**
   - EventService tests with mocked repositories
   - CalendarService tests
   - AuthService tests
   - TokenManagementService tests

5. **Write Infrastructure Layer Tests**
   - Repository implementation tests
   - API client tests with retry logic
   - Database migration tests

6. **Write Controller Tests**
   - HTTP endpoint tests with supertest
   - Request/response validation tests
   - Error handling tests

7. **Configure Coverage Reporting**
   - Set up coverage thresholds in jest.config.ts
   - Add coverage scripts to package.json
   - Configure CI/CD to fail if coverage drops below 80%

**Success Criteria**:
- 80%+ overall test coverage
- All tests pass in < 30 seconds
- Clear AAA pattern in all tests
- No flaky tests

---

#### Agent 2: Database Architecture Redesign

**Objective**: Fix database schema for proper data integrity and relationships

**Current State**:
- Excessive nullable fields reducing type safety
- Email-based lookups instead of user_id
- Missing foreign key constraints
- No Row-Level Security policies

**Requirements**:

1. **Create Explicit Users Table**
   - Primary key: user_id (UUID from auth.users)
   - Required fields: email, created_at
   - Foreign key to auth.users with CASCADE DELETE

2. **Redesign user_google_credentials Table**
   - Rename from user_calendar_tokens
   - Use user_id instead of email as foreign key
   - Make access_token, refresh_token, expiry_date NOT NULL
   - Add unique constraint on user_id
   - Add CHECK constraint: expiry_date > created_at

3. **Redesign calendar_metadata Table**
   - Rename from calendar_categories
   - Use user_id instead of email
   - Create enum type for access_role
   - Add unique constraint on (user_id, calendar_id)
   - Add timezone validation

4. **Redesign user_telegram_accounts Table**
   - Rename from user_telegram_links
   - Use user_id as foreign key
   - Make email NOT NULL
   - Add unique constraint on chat_id

5. **Implement Row-Level Security**
   - Enable RLS on all tables
   - Users can only access their own records
   - Admin role can access all records

6. **Create Migration Scripts**
   - Backward-compatible migration strategy
   - Data backfill scripts for new constraints
   - Rollback scripts for each migration

7. **Add Composite Indexes**
   - Index on (user_id, calendar_id) for calendar_metadata
   - Index on (user_id, expiry_date) for credentials
   - Index on chat_id for telegram accounts

8. **Update TypeScript Types**
   - Regenerate database.types.ts from new schema
   - Remove nullable types for required fields
   - Add enum types for categorical fields

**Success Criteria**:
- Zero nullable required fields
- All tables use user_id as primary identifier
- All foreign keys properly defined with CASCADE rules
- RLS policies prevent unauthorized access
- Query performance equal or better than before

---

#### Agent 3: Repository Pattern Implementation

**Objective**: Abstract data access behind repository interfaces

**Current State**:
- Direct Supabase calls scattered throughout controllers
- Direct Google API calls with no abstraction
- No dependency injection
- Hard to test due to tight coupling

**Requirements**:

1. **Define Repository Interfaces (domain layer)**
   - IEventRepository (CRUD for calendar events)
   - IUserRepository (user data access)
   - ICalendarRepository (calendar metadata)
   - ITelegramAccountRepository (Telegram user links)

2. **Implement Google Calendar Repository**
   - GoogleEventRepository implements IEventRepository
   - Handle Google API specifics (pagination, error codes)
   - Map Google event schema to domain Event entity

3. **Implement Supabase Repositories**
   - SupabaseUserRepository implements IUserRepository
   - SupabaseCalendarRepository implements ICalendarRepository
   - SupabaseTelegramRepository implements ITelegramAccountRepository

4. **Create In-Memory Repositories for Testing**
   - InMemoryEventRepository for fast unit tests
   - InMemoryUserRepository
   - Support for resetting state between tests

5. **Set Up Dependency Injection Container**
   - Install and configure InversifyJS
   - Define DI symbols/identifiers for each interface
   - Configure bindings for production and test environments

6. **Migrate Existing Code to Use Repositories**
   - Replace direct Supabase calls with repository methods
   - Replace direct Google API calls with repository methods
   - Inject repositories via constructor

**Success Criteria**:
- All data access abstracted behind interfaces
- Services depend on interfaces, not implementations
- Zero direct API calls in service layer
- Tests use in-memory repositories (10x faster)

---

### Phase 2: Architecture (Weeks 4-6)

#### Agent 4: Code Refactoring & SRP Enforcement

**Objective**: Eliminate god functions and enforce Single Responsibility Principle

**Current State**:
- handle-events.ts (120 lines, 6 responsibilities)
- users-controller.ts (159 lines, controller doing services work)
- Validation mixed with transformation
- No clear architectural layers

**Requirements**:

1. **Refactor handle-events.ts God Function**
   - Extract authentication logic to AuthMiddleware
   - Extract token refresh to TokenManagementService
   - Extract CRUD operations to EventService
   - Extract data transformation to DTOs and mappers
   - Each resulting function < 30 lines

2. **Refactor users-controller.ts**
   - Move OAuth logic to AuthService
   - Move JWT decoding to JWTService
   - Move database calls to UserRepository
   - Controller should only: validate input, call service, format response
   - Target: < 10 lines per controller method

3. **Separate Validation from Transformation**
   - Create validator classes using class-validator
   - Create mapper classes for DTO ↔ Entity conversion
   - Remove inline validation/transformation

4. **Establish Clean Architecture Layers**
   - domain/ - entities, value objects, interfaces
   - application/ - services, DTOs, validators
   - infrastructure/ - repositories, API clients
   - interfaces/ - controllers, middleware

5. **Enforce Dependency Rules**
   - domain depends on nothing
   - application depends on domain only
   - infrastructure depends on domain + application
   - interfaces depends on all layers
   - Configure ESLint to enforce these rules

6. **Break Down Large Files**
   - No file > 200 lines
   - No function > 30 lines
   - Extract related functions into cohesive classes

**Success Criteria**:
- No function exceeds 30 lines
- No file exceeds 200 lines
- All classes follow SRP
- Clear 4-layer architecture
- No circular dependencies

---

#### Agent 5: Service Layer Extraction

**Objective**: Extract business logic into dedicated service classes

**Current State**:
- Business logic scattered across controllers and utils
- No clear service layer
- Difficult to reuse logic across different interfaces

**Requirements**:

1. **Create EventService**
   - createEvent(userId, dto): Promise<Event>
   - updateEvent(userId, eventId, dto): Promise<Event>
   - deleteEvent(userId, eventId): Promise<void>
   - listEvents(userId, filters): Promise<Event[]>
   - Uses EventRepository for persistence

2. **Create CalendarService**
   - listCalendars(userId): Promise<Calendar[]>
   - getCalendarMetadata(userId, calendarId): Promise<Calendar>
   - Uses CalendarRepository

3. **Create AuthService**
   - generateAuthUrl(): Promise<string>
   - exchangeCodeForTokens(code): Promise<Credentials>
   - validateSession(token): Promise<User>
   - Uses UserRepository

4. **Create TokenManagementService**
   - getValidAccessToken(userId): Promise<string>
   - refreshToken(userId): Promise<Credentials>
   - storeTokens(userId, credentials): Promise<void>
   - Uses CredentialsRepository

5. **Create CalendarSelectionService (AI-powered)**
   - selectOptimalCalendar(userId, eventIntent): Promise<string>
   - Uses AI agent to determine best calendar based on event description
   - Fallback to primary calendar if AI fails

6. **Define Data Transfer Objects (DTOs)**
   - CreateEventDTO, UpdateEventDTO, EventFiltersDTO
   - CreateUserDTO, UpdateUserDTO
   - Separate API contracts from domain entities

7. **Implement Service Error Handling**
   - Custom error classes (EventNotFoundError, UnauthorizedError)
   - Consistent error format across all services
   - Error logging and monitoring

**Success Criteria**:
- All business logic in service layer
- Controllers are < 10 lines per method
- Services fully unit tested (90%+ coverage)
- Clear DTO boundaries

---

### Phase 3: Resilience (Weeks 7-8)

#### Agent 6: API Integration & Resilience

**Objective**: Centralize external API integrations with resilience patterns

**Current State**:
- Raw API calls with no error handling
- No retry logic for transient failures
- No rate limiting
- No monitoring/logging

**Requirements**:

1. **Create GoogleCalendarClient Wrapper**
   - Wraps google.calendar('v3') with middleware
   - Standardized error handling
   - Request/response logging
   - Timeout configuration

2. **Create EnhancedSupabaseClient Wrapper**
   - Wraps Supabase client with middleware
   - Connection pooling
   - Query timeout handling
   - Transaction helpers

3. **Implement Retry Middleware**
   - Exponential backoff (100ms, 200ms, 400ms, 800ms)
   - Jitter to prevent thundering herd
   - Retry only on transient errors (429, 500, 503)
   - Max 4 retries, then fail

4. **Implement Rate Limiting Middleware**
   - Respect Google Calendar API quota (10 requests/second)
   - Implement token bucket algorithm
   - Queue requests if rate limit exceeded
   - Log rate limit warnings

5. **Define Custom Error Classes**
   - GoogleAPIError extends Error
   - RateLimitError extends GoogleAPIError
   - DatabaseError extends Error
   - NetworkError extends Error
   - All errors include original error + context

6. **Add Request/Response Logging**
   - Log all API calls with timing
   - Log request payload (sanitize sensitive data)
   - Log response status and size
   - Integrate with structured logging (Winston/Pino)

7. **Implement Circuit Breaker (Optional)**
   - Open circuit after 5 consecutive failures
   - Half-open after 30 seconds
   - Close if subsequent requests succeed

**Success Criteria**:
- API error rate < 1%
- All API calls have retry logic
- Requests timeout after 10 seconds
- Rate limits respected
- All errors logged with context

---

## Cross-Cutting Concerns

### Testing Strategy for All Agents

- Test-Driven Refactoring (TDR): Write tests before refactoring
- Keep old implementation until new one is fully tested
- Use feature flags to switch between old and new code
- Run regression tests continuously

### Migration Strategy

1. **Build Alongside**: Create new implementation without touching old code
2. **Feature Flag**: Add environment variable to toggle new vs old
3. **Gradual Rollout**: Enable for 10% → 50% → 100% of requests
4. **Monitor Metrics**: Error rate, latency, success rate
5. **Rollback Plan**: Keep old code for 30 days after 100% cutover

### Documentation Requirements

- Architecture Decision Records (ADRs) for major changes
- Update README.md with new architecture diagram
- API documentation with Swagger/OpenAPI
- Developer onboarding guide

---

## Success Metrics

### Code Quality
- [ ] No function exceeds 30 lines
- [ ] No file exceeds 200 lines
- [ ] All classes follow SRP
- [ ] 80%+ overall test coverage

### Architecture
- [ ] Clear 4-layer separation (domain → application → infrastructure → interfaces)
- [ ] All dependencies point inward
- [ ] No circular dependencies
- [ ] All external I/O abstracted behind interfaces

### Performance
- [ ] Query times equal or better than before
- [ ] API error rate < 1%
- [ ] All API calls have retry logic
- [ ] Database queries properly indexed

### Maintainability
- [ ] New features can be added without modifying core logic
- [ ] Tests run in < 30 seconds
- [ ] New developers can onboard in < 2 hours
- [ ] Documentation covers all architectural decisions

---

## Current Project Statistics

- **Total TypeScript files**: 37
- **Total lines of code**: ~2,500
- **Current test files**: 0 ❌
- **Controllers**: 3 files (325 lines)
- **Utils**: 11 files (600+ lines)
- **AI Agents**: 8 files (1,100+ lines)

### Technical Debt Hotspots

1. `utils/handle-events.ts` - 120 lines, 6 responsibilities
2. `controllers/users-controller.ts` - 159 lines, controller doing services work
3. `controllers/calendar-controller.ts` - 140 lines, direct API calls
4. `ai-agents/execution-tools.ts` - 133 lines, mixed concerns
5. `ai-agents/agent-utils.ts` - 169 lines, validation + transformation

---

## Timeline Estimate

- **Phase 1 (Foundation)**: 3 weeks
  - Week 1: Unit Testing Infrastructure
  - Week 2: Database Architecture Redesign
  - Week 3: Repository Pattern Implementation

- **Phase 2 (Architecture)**: 3 weeks
  - Week 4-5: Code Refactoring & SRP
  - Week 6: Service Layer Extraction

- **Phase 3 (Resilience)**: 2 weeks
  - Week 7-8: API Integration & Resilience

**Total**: 6-8 weeks for full implementation (1 developer full-time)

Can be parallelized to 3-4 weeks with 2-3 developers.

---

## Dependencies Between Phases

```
Unit Testing (parallel with all phases)
     │
     ├─→ Database Architecture
     │        └─→ Repository Pattern
     │                 └─→ Service Layer
     │                          └─→ Code Refactoring
     │                                   └─→ API Integration
```

- Unit Testing can start immediately and run in parallel
- Database Architecture should complete before Repository Pattern
- Repository Pattern should complete before Service Layer
- Service Layer should complete before Code Refactoring
- API Integration can be done last or in parallel with Service Layer
