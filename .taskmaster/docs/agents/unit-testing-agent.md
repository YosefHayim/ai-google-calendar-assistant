# Unit Testing Agent

## Purpose
Establish comprehensive unit testing infrastructure for the AI Google Calendar Assistant, covering all layers of the application with high coverage, clear test patterns, and maintainable test suites.

## Current State

### Test Framework: Jest (Configured, No Tests Written)

**Configuration**: `jest.config.ts` (18 lines)
- ✅ TypeScript support via `ts-jest`
- ✅ ESM module support
- ✅ Path aliases configured (`@/` → `<rootDir>/`)
- ✅ Mock reset/restore enabled
- ✅ Supertest installed for HTTP testing

**Dependencies Installed**:
```json
{
  "@jest/globals": "^30.2.0",
  "@types/jest": "^30.0.0",
  "babel-jest": "^30.2.0",
  "jest": "^30.2.0",
  "supertest": "^7.1.4",
  "@types/supertest": "^6.0.3",
  "ts-jest": "^29.4.5"
}
```

**Critical Gap**: **ZERO test files exist** ❌

## Goals

### 1. Comprehensive Test Coverage
- **Domain Layer**: 95%+ coverage (pure business logic)
- **Application Layer**: 90%+ coverage (services, validators)
- **Infrastructure Layer**: 75%+ coverage (repositories, API clients)
- **Controllers**: 80%+ coverage (HTTP endpoints)
- **Overall Project**: 80%+ coverage minimum

### 2. Test Pyramid Structure
```
        /\
       /  \        10% - E2E Tests (full integration)
      /    \
     /------\      20% - Integration Tests (cross-layer)
    /        \
   /          \    70% - Unit Tests (isolated components)
  /____________\
```

### 3. Testing Best Practices
- **Arrange-Act-Assert (AAA)** pattern in all tests
- **Test isolation** - no shared state between tests
- **Fast execution** - unit tests < 50ms each
- **Descriptive names** - test intent clear from name
- **Minimal mocking** - prefer real implementations where feasible

### 4. Mock Strategy
- **External APIs** (Google Calendar, Supabase) - Always mocked
- **Database calls** - Mocked in unit tests, real in integration tests
- **Domain logic** - Never mocked (test real implementations)
- **Time/Date** - Mocked for deterministic tests

## Test Structure by Layer

### Domain Layer Tests (Pure Unit Tests)

**No mocks needed** - domain entities are pure business logic.

#### Event Entity Tests
```typescript
// __tests__/domain/entities/Event.test.ts
import { describe, it, expect } from '@jest/globals';
import { Event, EventDateTime } from '@/domain/entities/Event';

describe('Event Entity', () => {
  describe('constructor', () => {
    it('should create event with all required fields', () => {
      const start = EventDateTime.fromDateTime(
        new Date('2025-01-15T10:00:00Z'),
        'America/New_York'
      );
      const end = EventDateTime.fromDateTime(
        new Date('2025-01-15T11:00:00Z'),
        'America/New_York'
      );

      const event = new Event(
        'evt-123',
        'Team Meeting',
        start,
        end,
        'cal-456',
        'Discuss Q1 goals',
        'Conference Room A'
      );

      expect(event.id).toBe('evt-123');
      expect(event.summary).toBe('Team Meeting');
      expect(event.description).toBe('Discuss Q1 goals');
      expect(event.location).toBe('Conference Room A');
    });
  });

  describe('duration', () => {
    it('should calculate duration in minutes correctly', () => {
      const start = EventDateTime.fromDateTime(
        new Date('2025-01-15T10:00:00Z'),
        'UTC'
      );
      const end = EventDateTime.fromDateTime(
        new Date('2025-01-15T11:30:00Z'),
        'UTC'
      );
      const event = new Event('1', 'Meeting', start, end, 'primary');

      expect(event.duration.inMinutes()).toBe(90);
    });

    it('should calculate duration for all-day events', () => {
      const start = EventDateTime.fromDate('2025-01-15');
      const end = EventDateTime.fromDate('2025-01-16');
      const event = new Event('1', 'Conference', start, end, 'primary');

      expect(event.duration.inDays()).toBe(1);
    });
  });

  describe('isAllDay', () => {
    it('should return true for date-only events', () => {
      const start = EventDateTime.fromDate('2025-01-15');
      const end = EventDateTime.fromDate('2025-01-16');
      const event = new Event('1', 'Holiday', start, end, 'primary');

      expect(event.isAllDay()).toBe(true);
    });

    it('should return false for dateTime events', () => {
      const start = EventDateTime.fromDateTime(
        new Date('2025-01-15T10:00:00Z'),
        'UTC'
      );
      const end = EventDateTime.fromDateTime(
        new Date('2025-01-15T11:00:00Z'),
        'UTC'
      );
      const event = new Event('1', 'Meeting', start, end, 'primary');

      expect(event.isAllDay()).toBe(false);
    });
  });
});
```

#### EventDateTime Value Object Tests
```typescript
// __tests__/domain/value-objects/EventDateTime.test.ts
import { describe, it, expect } from '@jest/globals';
import { EventDateTime } from '@/domain/value-objects/EventDateTime';

describe('EventDateTime Value Object', () => {
  describe('fromDateTime', () => {
    it('should create from Date object with timezone', () => {
      const edt = EventDateTime.fromDateTime(
        new Date('2025-01-15T10:00:00Z'),
        'America/New_York'
      );

      expect(edt.isDateOnly()).toBe(false);
      expect(edt.toGoogleFormat()).toEqual({
        dateTime: '2025-01-15T10:00:00.000Z',
        timeZone: 'America/New_York',
      });
    });

    it('should throw error if timezone missing', () => {
      expect(() => {
        EventDateTime.fromDateTime(new Date('2025-01-15T10:00:00Z'), '');
      }).toThrow('Timezone required for dateTime events');
    });
  });

  describe('fromDate', () => {
    it('should create from YYYY-MM-DD string', () => {
      const edt = EventDateTime.fromDate('2025-01-15');

      expect(edt.isDateOnly()).toBe(true);
      expect(edt.toGoogleFormat()).toEqual({
        date: '2025-01-15',
      });
    });

    it('should throw error for invalid date format', () => {
      expect(() => {
        EventDateTime.fromDate('01/15/2025');
      }).toThrow('Invalid date format. Expected YYYY-MM-DD');
    });
  });

  describe('toGoogleFormat', () => {
    it('should convert dateTime to Google Calendar format', () => {
      const edt = EventDateTime.fromDateTime(
        new Date('2025-01-15T14:30:00Z'),
        'UTC'
      );

      expect(edt.toGoogleFormat()).toEqual({
        dateTime: '2025-01-15T14:30:00.000Z',
        timeZone: 'UTC',
      });
    });

    it('should convert date to Google Calendar format', () => {
      const edt = EventDateTime.fromDate('2025-01-15');

      expect(edt.toGoogleFormat()).toEqual({
        date: '2025-01-15',
      });
    });
  });
});
```

### Application Layer Tests (Service Unit Tests with Mocks)

#### CalendarService Tests
```typescript
// __tests__/application/services/CalendarService.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { CalendarService } from '@/application/services/CalendarService';
import type { IEventRepository } from '@/domain/repositories/IEventRepository';
import type { ITokenManager } from '@/domain/repositories/ITokenManager';
import { Event, EventDateTime } from '@/domain/entities/Event';
import type { CreateEventDTO } from '@/application/dto/CreateEventDTO';

describe('CalendarService', () => {
  let service: CalendarService;
  let mockEventRepo: jest.Mocked<IEventRepository>;
  let mockTokenManager: jest.Mocked<ITokenManager>;

  beforeEach(() => {
    // Create mocks
    mockEventRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockTokenManager = {
      getAuthenticatedClient: jest.fn(),
    };

    // Inject mocks into service
    service = new CalendarService(mockEventRepo, mockTokenManager);
  });

  describe('createEvent', () => {
    it('should create event in specified calendar', async () => {
      // Arrange
      const userId = 'user-123';
      const dto: CreateEventDTO = {
        summary: 'Team Standup',
        start: {
          dateTime: '2025-01-15T10:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2025-01-15T10:30:00Z',
          timeZone: 'America/New_York',
        },
        calendarId: 'work-calendar',
      };

      const expectedEvent = new Event(
        'evt-new',
        'Team Standup',
        EventDateTime.fromDateTime(
          new Date('2025-01-15T10:00:00Z'),
          'America/New_York'
        ),
        EventDateTime.fromDateTime(
          new Date('2025-01-15T10:30:00Z'),
          'America/New_York'
        ),
        'work-calendar'
      );

      mockEventRepo.create.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(userId, dto);

      // Assert
      expect(mockTokenManager.getAuthenticatedClient).toHaveBeenCalledWith(userId);
      expect(mockEventRepo.create).toHaveBeenCalledWith(
        'work-calendar',
        expect.objectContaining({
          summary: 'Team Standup',
        })
      );
      expect(result).toBe(expectedEvent);
    });

    it('should use primary calendar when calendarId not specified', async () => {
      // Arrange
      const userId = 'user-123';
      const dto: CreateEventDTO = {
        summary: 'Personal Event',
        start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
        end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
        // calendarId omitted
      };

      const expectedEvent = new Event(
        'evt-new',
        'Personal Event',
        EventDateTime.fromDateTime(new Date('2025-01-15T10:00:00Z'), 'UTC'),
        EventDateTime.fromDateTime(new Date('2025-01-15T11:00:00Z'), 'UTC'),
        'primary'
      );

      mockEventRepo.create.mockResolvedValue(expectedEvent);

      // Act
      const result = await service.createEvent(userId, dto);

      // Assert
      expect(mockEventRepo.create).toHaveBeenCalledWith(
        'primary',
        expect.any(Event)
      );
    });

    it('should throw error when event creation fails', async () => {
      // Arrange
      const userId = 'user-123';
      const dto: CreateEventDTO = {
        summary: 'Meeting',
        start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
        end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
      };

      mockEventRepo.create.mockRejectedValue(
        new Error('Calendar API error')
      );

      // Act & Assert
      await expect(service.createEvent(userId, dto)).rejects.toThrow(
        'Calendar API error'
      );
    });
  });

  describe('listEvents', () => {
    it('should list events with filters', async () => {
      // Arrange
      const userId = 'user-123';
      const filters = {
        calendarId: 'work-calendar',
        timeMin: new Date('2025-01-01T00:00:00Z'),
        timeMax: new Date('2025-01-31T23:59:59Z'),
      };

      const mockEvents = [
        new Event(
          'evt-1',
          'Meeting 1',
          EventDateTime.fromDateTime(new Date('2025-01-10T10:00:00Z'), 'UTC'),
          EventDateTime.fromDateTime(new Date('2025-01-10T11:00:00Z'), 'UTC'),
          'work-calendar'
        ),
      ];

      mockEventRepo.list.mockResolvedValue(mockEvents);

      // Act
      const result = await service.listEvents(userId, filters);

      // Assert
      expect(mockTokenManager.getAuthenticatedClient).toHaveBeenCalledWith(userId);
      expect(mockEventRepo.list).toHaveBeenCalledWith('work-calendar', filters);
      expect(result).toEqual(mockEvents);
    });
  });
});
```

#### EventValidator Tests
```typescript
// __tests__/application/validators/EventValidator.test.ts
import { describe, it, expect } from '@jest/globals';
import { EventValidator } from '@/application/validators/EventValidator';
import type { CreateEventDTO } from '@/application/dto/CreateEventDTO';

describe('EventValidator', () => {
  let validator: EventValidator;

  beforeEach(() => {
    validator = new EventValidator();
  });

  describe('validate', () => {
    it('should pass validation for valid event', () => {
      // Arrange
      const dto: CreateEventDTO = {
        summary: 'Team Meeting',
        start: {
          dateTime: '2025-01-15T10:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2025-01-15T11:00:00Z',
          timeZone: 'America/New_York',
        },
      };

      // Act
      const result = validator.validate(dto);

      // Assert
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toEqual(dto);
      }
    });

    it('should fail when summary is empty', () => {
      // Arrange
      const dto: CreateEventDTO = {
        summary: '   ', // Only whitespace
        start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
        end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
      };

      // Act
      const result = validator.validate(dto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: 'summary',
          message: 'Summary cannot be empty',
        });
      }
    });

    it('should fail when start time is invalid', () => {
      // Arrange
      const dto: CreateEventDTO = {
        summary: 'Meeting',
        start: {}, // No dateTime or date
        end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
      };

      // Act
      const result = validator.validate(dto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toContainEqual({
          field: 'start',
          message: 'Invalid start time',
        });
      }
    });

    it('should return multiple errors when multiple fields invalid', () => {
      // Arrange
      const dto: CreateEventDTO = {
        summary: '',
        start: {},
        end: {},
      };

      // Act
      const result = validator.validate(dto);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors).toHaveLength(3);
      }
    });
  });
});
```

### Infrastructure Layer Tests (Repository Tests with Mocks)

#### GoogleEventRepository Tests
```typescript
// __tests__/infrastructure/repositories/GoogleEventRepository.test.ts
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { GoogleEventRepository } from '@/infrastructure/repositories/GoogleEventRepository';
import { Event, EventDateTime } from '@/domain/entities/Event';
import type { calendar_v3 } from 'googleapis';

describe('GoogleEventRepository', () => {
  let repository: GoogleEventRepository;
  let mockCalendarClient: jest.Mocked<calendar_v3.Calendar>;

  beforeEach(() => {
    // Mock Google Calendar client
    mockCalendarClient = {
      events: {
        insert: jest.fn(),
        get: jest.fn(),
        list: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repository = new GoogleEventRepository(mockCalendarClient);
  });

  describe('create', () => {
    it('should create event in Google Calendar', async () => {
      // Arrange
      const event = new Event(
        '', // ID not set yet
        'Team Meeting',
        EventDateTime.fromDateTime(
          new Date('2025-01-15T10:00:00Z'),
          'America/New_York'
        ),
        EventDateTime.fromDateTime(
          new Date('2025-01-15T11:00:00Z'),
          'America/New_York'
        ),
        'work-calendar',
        'Discuss Q1 goals'
      );

      const googleResponse: calendar_v3.Schema$Event = {
        id: 'evt-google-123',
        summary: 'Team Meeting',
        description: 'Discuss Q1 goals',
        start: {
          dateTime: '2025-01-15T10:00:00.000Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2025-01-15T11:00:00.000Z',
          timeZone: 'America/New_York',
        },
      };

      mockCalendarClient.events.insert.mockResolvedValue({
        data: googleResponse,
      } as any);

      // Act
      const result = await repository.create('work-calendar', event);

      // Assert
      expect(mockCalendarClient.events.insert).toHaveBeenCalledWith({
        calendarId: 'work-calendar',
        requestBody: {
          summary: 'Team Meeting',
          description: 'Discuss Q1 goals',
          start: {
            dateTime: '2025-01-15T10:00:00.000Z',
            timeZone: 'America/New_York',
          },
          end: {
            dateTime: '2025-01-15T11:00:00.000Z',
            timeZone: 'America/New_York',
          },
        },
      });
      expect(result.id).toBe('evt-google-123');
      expect(result.summary).toBe('Team Meeting');
    });

    it('should handle all-day events correctly', async () => {
      // Arrange
      const event = new Event(
        '',
        'Conference',
        EventDateTime.fromDate('2025-01-15'),
        EventDateTime.fromDate('2025-01-16'),
        'work-calendar'
      );

      mockCalendarClient.events.insert.mockResolvedValue({
        data: {
          id: 'evt-allday-123',
          summary: 'Conference',
          start: { date: '2025-01-15' },
          end: { date: '2025-01-16' },
        },
      } as any);

      // Act
      const result = await repository.create('work-calendar', event);

      // Assert
      expect(mockCalendarClient.events.insert).toHaveBeenCalledWith({
        calendarId: 'work-calendar',
        requestBody: {
          summary: 'Conference',
          start: { date: '2025-01-15' },
          end: { date: '2025-01-16' },
        },
      });
    });
  });
});
```

### Controller Tests (HTTP Integration Tests)

#### EventController Tests with Supertest
```typescript
// __tests__/interfaces/http/controllers/EventController.test.ts
import { describe, it, expect, jest, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import express, { type Express } from 'express';
import { EventController } from '@/interfaces/http/controllers/EventController';
import { CalendarService } from '@/application/services/CalendarService';

describe('EventController', () => {
  let app: Express;
  let mockCalendarService: jest.Mocked<CalendarService>;

  beforeAll(() => {
    // Create mocks
    mockCalendarService = {
      createEvent: jest.fn(),
      listEvents: jest.fn(),
      updateEvent: jest.fn(),
      deleteEvent: jest.fn(),
    } as any;

    // Create test Express app
    app = express();
    app.use(express.json());

    const controller = new EventController(mockCalendarService);

    // Mock authentication middleware
    app.use((req, res, next) => {
      (req as any).user = { id: 'user-test-123', email: 'test@example.com' };
      next();
    });

    // Register routes
    app.post('/api/calendar/events', controller.createEvent);
    app.get('/api/calendar/events', controller.listEvents);
  });

  describe('POST /api/calendar/events', () => {
    it('should create event and return 200', async () => {
      // Arrange
      const requestBody = {
        summary: 'Team Meeting',
        start: {
          dateTime: '2025-01-15T10:00:00Z',
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: '2025-01-15T11:00:00Z',
          timeZone: 'America/New_York',
        },
      };

      const createdEvent = {
        id: 'evt-123',
        summary: 'Team Meeting',
        start: requestBody.start,
        end: requestBody.end,
        calendarId: 'primary',
      };

      mockCalendarService.createEvent.mockResolvedValue(createdEvent as any);

      // Act
      const response = await request(app)
        .post('/api/calendar/events')
        .send(requestBody);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toEqual(createdEvent);
      expect(mockCalendarService.createEvent).toHaveBeenCalledWith(
        'user-test-123',
        requestBody
      );
    });

    it('should return 400 for invalid event data', async () => {
      // Arrange
      const invalidBody = {
        summary: '', // Empty summary
        start: {},
        end: {},
      };

      // Act
      const response = await request(app)
        .post('/api/calendar/events')
        .send(invalidBody);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('validation_error');
      expect(response.body.data).toBeInstanceOf(Array);
      expect(mockCalendarService.createEvent).not.toHaveBeenCalled();
    });

    it('should return 401 when user not authenticated', async () => {
      // Create app without auth middleware
      const unauthedApp = express();
      unauthedApp.use(express.json());
      const controller = new EventController(mockCalendarService);
      unauthedApp.post('/api/calendar/events', controller.createEvent);

      // Act
      const response = await request(unauthedApp)
        .post('/api/calendar/events')
        .send({
          summary: 'Meeting',
          start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
        });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/calendar/events', () => {
    it('should list events with default filters', async () => {
      // Arrange
      const mockEvents = [
        {
          id: 'evt-1',
          summary: 'Meeting 1',
          start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
        },
      ];

      mockCalendarService.listEvents.mockResolvedValue(mockEvents as any);

      // Act
      const response = await request(app).get('/api/calendar/events');

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toEqual(mockEvents);
    });

    it('should list events with query filters', async () => {
      // Arrange
      mockCalendarService.listEvents.mockResolvedValue([]);

      // Act
      const response = await request(app)
        .get('/api/calendar/events')
        .query({
          calendarId: 'work-calendar',
          timeMin: '2025-01-01T00:00:00Z',
          timeMax: '2025-01-31T23:59:59Z',
          q: 'meeting',
        });

      // Assert
      expect(response.status).toBe(200);
      expect(mockCalendarService.listEvents).toHaveBeenCalledWith(
        'user-test-123',
        expect.objectContaining({
          calendarId: 'work-calendar',
          q: 'meeting',
        })
      );
    });
  });
});
```

## Test Organization

### Directory Structure
```
__tests__/
├── domain/
│   ├── entities/
│   │   ├── Event.test.ts
│   │   ├── Calendar.test.ts
│   │   └── User.test.ts
│   └── value-objects/
│       ├── EventDateTime.test.ts
│       ├── Duration.test.ts
│       └── TimeZone.test.ts
├── application/
│   ├── services/
│   │   ├── CalendarService.test.ts
│   │   ├── AuthService.test.ts
│   │   └── TokenRefreshService.test.ts
│   └── validators/
│       ├── EventValidator.test.ts
│       └── UserValidator.test.ts
├── infrastructure/
│   ├── repositories/
│   │   ├── GoogleEventRepository.test.ts
│   │   ├── SupabaseUserRepository.test.ts
│   │   └── SupabaseCalendarRepository.test.ts
│   └── google/
│       ├── TokenManager.test.ts
│       └── OAuth2Service.test.ts
├── interfaces/
│   └── http/
│       ├── controllers/
│       │   ├── EventController.test.ts
│       │   ├── CalendarController.test.ts
│       │   └── AuthController.test.ts
│       └── middleware/
│           ├── authMiddleware.test.ts
│           └── errorMiddleware.test.ts
├── integration/
│   ├── calendar-event-flow.test.ts
│   ├── oauth-flow.test.ts
│   └── telegram-bot-flow.test.ts
├── helpers/
│   ├── mockFactories.ts        # Factory functions for test data
│   ├── testHelpers.ts           # Common test utilities
│   └── fixtureData.ts           # Shared test fixtures
└── setup/
    ├── globalSetup.ts           # Jest global setup
    ├── globalTeardown.ts        # Jest global teardown
    └── testEnvironment.ts       # Custom test environment
```

## Mock Factories & Test Helpers

### Mock Factory Pattern
```typescript
// __tests__/helpers/mockFactories.ts
import type { IEventRepository } from '@/domain/repositories/IEventRepository';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import { Event, EventDateTime } from '@/domain/entities/Event';

export const createMockEventRepository = (): jest.Mocked<IEventRepository> => ({
  create: jest.fn(),
  findById: jest.fn(),
  list: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

export const createMockUserRepository = (): jest.Mocked<IUserRepository> => ({
  findById: jest.fn(),
  findByEmail: jest.fn(),
  updateTokens: jest.fn(),
  getCredentials: jest.fn(),
});

export const createTestEvent = (overrides?: Partial<Event>): Event => {
  const defaults = {
    id: 'test-evt-123',
    summary: 'Test Event',
    start: EventDateTime.fromDateTime(
      new Date('2025-01-15T10:00:00Z'),
      'UTC'
    ),
    end: EventDateTime.fromDateTime(
      new Date('2025-01-15T11:00:00Z'),
      'UTC'
    ),
    calendarId: 'primary',
    description: 'Test description',
    location: 'Test location',
  };

  return new Event(
    overrides?.id ?? defaults.id,
    overrides?.summary ?? defaults.summary,
    overrides?.start ?? defaults.start,
    overrides?.end ?? defaults.end,
    overrides?.calendarId ?? defaults.calendarId,
    overrides?.description ?? defaults.description,
    overrides?.location ?? defaults.location
  );
};
```

### Test Helpers
```typescript
// __tests__/helpers/testHelpers.ts
import { jest } from '@jest/globals';

/**
 * Mock Date.now() to return fixed timestamp
 */
export const mockCurrentTime = (timestamp: number): jest.Spied<typeof Date.now> => {
  return jest.spyOn(Date, 'now').mockReturnValue(timestamp);
};

/**
 * Restore all mocked time functions
 */
export const restoreTime = (): void => {
  jest.restoreAllMocks();
};

/**
 * Wait for all pending promises to resolve
 */
export const flushPromises = (): Promise<void> => {
  return new Promise((resolve) => setImmediate(resolve));
};
```

## Coverage Configuration

Update `jest.config.ts`:
```typescript
const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    "^.+\\.[tj]sx?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.json" }],
  },
  resetMocks: true,
  restoreMocks: true,
  clearMocks: true,

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8", // Faster than default
  collectCoverageFrom: [
    "domain/**/*.ts",
    "application/**/*.ts",
    "infrastructure/**/*.ts",
    "interfaces/**/*.ts",
    "!**/*.d.ts",
    "!**/*.test.ts",
    "!**/*.spec.ts",
    "!**/node_modules/**",
  ],
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/__tests__/",
    "/ai-agents/", // Tested separately via integration tests
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
    "./domain/": {
      statements: 95,
      branches: 90,
      functions: 95,
      lines: 95,
    },
    "./application/": {
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90,
    },
  },
  coverageReporters: ["text", "lcov", "html", "json-summary"],
};
```

## Testing Checklist

### Setup Tasks
- [ ] Configure coverage thresholds in `jest.config.ts`
- [ ] Create `__tests__` directory structure
- [ ] Create mock factories in `__tests__/helpers/mockFactories.ts`
- [ ] Create test helpers in `__tests__/helpers/testHelpers.ts`
- [ ] Add npm scripts for testing (`test`, `test:watch`, `test:coverage`)

### Domain Layer Tests (95%+ coverage)
- [ ] Test all entity constructors
- [ ] Test all entity methods (getters, computed properties)
- [ ] Test all value object creation patterns
- [ ] Test all value object transformations
- [ ] Test edge cases (empty strings, null values, invalid formats)

### Application Layer Tests (90%+ coverage)
- [ ] Test all service methods with mocked dependencies
- [ ] Test all validators with valid and invalid inputs
- [ ] Test error handling in services
- [ ] Test business logic edge cases

### Infrastructure Layer Tests (75%+ coverage)
- [ ] Test repository CRUD operations with mocked external clients
- [ ] Test OAuth token refresh logic
- [ ] Test database query builders
- [ ] Test API client error handling

### Controller Tests (80%+ coverage)
- [ ] Test all HTTP endpoints (happy path)
- [ ] Test authentication/authorization
- [ ] Test validation error responses
- [ ] Test error handling (500, 400, 401, 403)

### Integration Tests
- [ ] Test full event creation flow (HTTP → Service → Repository → Google API)
- [ ] Test OAuth authentication flow
- [ ] Test Telegram bot message handling

## CI/CD Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm lint

      - name: Run tests with coverage
        run: pnpm test:coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true

      - name: Check coverage thresholds
        run: |
          if [ $(jq '.total.statements.pct' coverage/coverage-summary.json | bc) -lt 80 ]; then
            echo "Coverage below 80%"
            exit 1
          fi
```

## NPM Scripts

Add to `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:ci": "jest --ci --coverage --maxWorkers=2",
    "test:unit": "jest --testPathPattern='__tests__/(domain|application)/'",
    "test:integration": "jest --testPathPattern='__tests__/integration/'",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  }
}
```

## Success Criteria

- [ ] 80%+ overall code coverage
- [ ] 95%+ domain layer coverage
- [ ] 90%+ application layer coverage
- [ ] All tests pass in CI/CD
- [ ] Test execution time < 30 seconds for unit tests
- [ ] Test execution time < 2 minutes for all tests
- [ ] Zero flaky tests (tests pass consistently)
- [ ] All tests follow AAA pattern
- [ ] All tests have descriptive names
- [ ] Test failures provide clear, actionable error messages

## References

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Best Practices](https://testingjavascript.com/)
- [Test Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)
- [AAA Pattern](https://wiki.c2.com/?ArrangeActAssert)
