# AI Google Calendar Assistant - Agent Specifications

## Overview

This directory contains comprehensive agent specifications for refactoring and improving the AI Google Calendar Assistant codebase. Each agent focuses on a specific architectural concern and provides detailed implementation plans.

## Agent Specifications

### 1. [Database Architecture Agent](./db-architecture-agent.md)
**Purpose**: Redesign database schema for data integrity and type safety

**Key Improvements**:
- Remove excessive nullable fields
- Establish proper foreign key relationships
- Add composite indexes for performance
- Implement Row-Level Security (RLS) policies
- Use `user_id` as primary identifier instead of email

**Estimated Effort**: 1-2 weeks
**Priority**: High (foundation for other improvements)

**Before**: Weak schema with nullable fields everywhere, email-based lookups
**After**: Strongly-typed schema with proper constraints, user_id-based relationships

---

### 2. [Code Refactoring Agent](./code-refactoring-agent.md)
**Purpose**: Eliminate god functions and enforce Single Responsibility Principle

**Key Refactorings**:
- Break down 120-line `eventsHandler` god function into service classes
- Extract business logic from controllers (reduce from 60+ lines to <10 lines)
- Separate validation from transformation logic
- Implement Clean Architecture layers (domain → application → infrastructure → interfaces)

**Estimated Effort**: 3-4 weeks
**Priority**: High (improves maintainability dramatically)

**Before**: `handle-events.ts` does 6 different things in one function
**After**: `CalendarService`, `TokenManager`, `EventRepository` with single responsibilities

---

### 3. [Unit Testing Agent](./unit-testing-agent.md)
**Purpose**: Establish comprehensive test coverage with Jest

**Testing Strategy**:
- 95%+ coverage for domain layer (pure logic)
- 90%+ coverage for application layer (services)
- 75%+ coverage for infrastructure layer (repositories)
- Test pyramid: 70% unit, 20% integration, 10% E2E

**Estimated Effort**: 2-3 weeks
**Priority**: High (enables safe refactoring)

**Before**: **ZERO test files**
**After**: 80%+ overall coverage with clear test patterns

---

### 4. [Service Layer Extraction Agent](./service-layer-agent.md)
**Purpose**: Extract business logic into dedicated service classes

**Services to Create**:
- `EventService` - Event CRUD operations
- `CalendarService` - Calendar metadata management
- `AuthService` - OAuth and authentication
- `TokenManagementService` - Token refresh and validation
- `CalendarSelectionService` - AI-powered calendar selection

**Estimated Effort**: 2-3 weeks
**Priority**: Medium (depends on Code Refactoring Agent)

**Before**: Business logic scattered across controllers and utils
**After**: Clean service layer with dependency injection

---

### 5. [Repository Pattern Agent](./repository-pattern-agent.md)
**Purpose**: Abstract data access behind repository interfaces

**Repositories to Implement**:
- `IEventRepository` → `GoogleEventRepository`
- `IUserRepository` → `SupabaseUserRepository`
- `ICalendarRepository` → `SupabaseCalendarRepository`
- `ITelegramAccountRepository` → `SupabaseTelegramRepository`

**Estimated Effort**: 2 weeks
**Priority**: Medium (enables testability and flexibility)

**Before**: Direct Supabase and Google API calls everywhere
**After**: Repository interfaces in domain, implementations in infrastructure

---

### 6. [API Integration Agent](./api-integration-agent.md)
**Purpose**: Centralize external API integrations with resilience patterns

**API Clients to Create**:
- `GoogleCalendarClient` - Wraps Google Calendar API with retry logic
- `EnhancedSupabaseClient` - Wraps Supabase with timeout and logging
- Custom error classes (`GoogleAPIError`, `RateLimitError`, `DatabaseError`)
- Middleware for retry, rate limiting, and logging

**Estimated Effort**: 1-2 weeks
**Priority**: Medium (improves reliability)

**Before**: Raw API calls with no error handling or retry logic
**After**: Resilient API clients with exponential backoff and monitoring

---

## Recommended Implementation Order

### Phase 1: Foundation (Weeks 1-3)
1. **Unit Testing Agent** - Set up testing infrastructure first
2. **Database Architecture Agent** - Fix schema issues early
3. **Repository Pattern Agent** - Abstract data access

### Phase 2: Architecture (Weeks 4-6)
4. **Code Refactoring Agent** - Break down god functions
5. **Service Layer Extraction Agent** - Extract business logic

### Phase 3: Resilience (Weeks 7-8)
6. **API Integration Agent** - Add retry logic and error handling

## Dependencies Between Agents

```
Unit Testing Agent (parallel with all)
     │
     ├─→ Database Architecture Agent
     │        └─→ Repository Pattern Agent
     │                 └─→ Service Layer Extraction Agent
     │                          └─→ Code Refactoring Agent
     │                                   └─→ API Integration Agent
```

- **Unit Testing** can start immediately and run in parallel
- **Database Architecture** should complete before Repository Pattern
- **Repository Pattern** should complete before Service Layer
- **Service Layer** should complete before Code Refactoring
- **API Integration** can be done last or in parallel with Service Layer

## Success Metrics

### Code Quality
- [ ] No function exceeds 30 lines
- [ ] No file exceeds 200 lines
- [ ] All classes follow Single Responsibility Principle
- [ ] 80%+ overall test coverage

### Architecture
- [ ] Clear separation of concerns (4 distinct layers)
- [ ] All dependencies point inward (domain ← application ← infrastructure)
- [ ] No circular dependencies
- [ ] All external I/O abstracted behind interfaces

### Performance
- [ ] Query times equal or better than before
- [ ] API error rate < 1%
- [ ] All API calls have retry logic
- [ ] Database queries indexed properly

### Maintainability
- [ ] New features can be added without modifying core business logic
- [ ] Tests run in < 30 seconds
- [ ] New developers can onboard in < 2 hours
- [ ] Documentation covers all major architectural decisions

## Current Project Statistics

### Codebase Size
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

### After Refactoring (Projected)
- **Total TypeScript files**: ~60-70 (more files, but smaller and focused)
- **Average file size**: ~80 lines (down from ~140)
- **Test files**: ~40
- **Test coverage**: 80%+
- **Layered architecture**: domain / application / infrastructure / interfaces

## Questions & Answers

### Q: Which agent should I start with?
**A**: Start with **Unit Testing Agent** and **Database Architecture Agent** in parallel. Testing infrastructure enables safe refactoring, and DB fixes prevent future issues.

### Q: Can I skip any agents?
**A**: You can defer **API Integration Agent** if time is limited, but do NOT skip:
- Unit Testing Agent (critical for safe refactoring)
- Code Refactoring Agent (eliminates god functions)
- Service Layer Extraction Agent (organizes business logic)

### Q: How long will this take?
**A**: 6-8 weeks for all agents with 1 developer full-time. Can be parallelized with 2-3 developers to 3-4 weeks.

### Q: Will this break existing functionality?
**A**: No, if you follow the migration strategies in each agent spec:
1. Build new implementation alongside old code
2. Use feature flags to switch gradually
3. Run regression tests continuously
4. Keep old code for 30 days after cutover

### Q: What if I only have time for one agent?
**A**: Choose **Code Refactoring Agent** - it provides the most immediate value by eliminating god functions and improving code organization.

## Files Created

All agent specifications are located in:
```
.taskmaster/docs/agents/
├── README.md (this file)
├── db-architecture-agent.md
├── code-refactoring-agent.md
├── unit-testing-agent.md
├── service-layer-agent.md
├── repository-pattern-agent.md
└── api-integration-agent.md
```

## Contributing

When implementing these agents:
1. Read the full agent specification before starting
2. Follow the implementation order suggested
3. Write tests before refactoring (Test-Driven Refactoring)
4. Use feature flags for gradual rollout
5. Update this README with progress

## Progress Tracking

Use Task Master AI to track progress:
```bash
# Create tasks from agent specifications
task-master parse-prd .taskmaster/docs/agents/db-architecture-agent.md --append

# Track implementation
task-master next
task-master set-status --id=X --status=done
```

---

**Last Updated**: 2025-11-18
**Version**: 1.0
**Status**: Specifications complete, implementation pending
