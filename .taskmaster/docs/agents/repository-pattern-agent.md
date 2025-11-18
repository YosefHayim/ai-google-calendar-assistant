# Repository Pattern Agent

## Purpose
Implement the Repository pattern to abstract data access, separate domain logic from persistence concerns, and provide a consistent interface for data operations in the AI Google Calendar Assistant.

## Current State Analysis

### Problem: Direct Database & API Calls Scattered Everywhere

Currently, data access happens directly in:
1. **Controllers** - Direct Supabase calls (40% of queries)
2. **Utils** - Mixed database and API calls (40% of queries)
3. **Services** - Some Google API calls (20% of queries)

**No abstraction layer exists between business logic and data sources.**

### Examples of Current Anti-Patterns

#### Direct Supabase Calls in Controllers:
```typescript
// controllers/users-controller.ts
const verifyUserTokens = reqResAsyncHandler(async (req, res) => {
  const { email } = req.body;

  // Direct database call in controller
  const { data, error } = await SUPABASE
    .from("user_calendar_tokens")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error || !data) {
    return sendR(res, STATUS_RESPONSE.ERROR, "Tokens not found");
  }

  sendR(res, STATUS_RESPONSE.SUCCESS, "Tokens valid", data);
});
```

**Problems**:
- Controller knows about database structure
- Hard to test (requires real database)
- Can't switch data source without modifying controllers
- No type safety beyond auto-generated Supabase types

#### Direct Google API Calls in Utils:
```typescript
// utils/handle-events.ts
const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);

// Direct Google Calendar API call
const eventsList = await calendar.events.list({
  calendarId: calendarId ?? "primary",
  timeMin: timeMin ?? undefined,
  q: q ?? undefined,
});

return eventsList.data.items;
```

**Problems**:
- Google API response types leak into business logic
- No caching or retry logic
- Hard to mock for testing
- No centralized error handling

## Goals

### 1. Establish Repository Layer
Create repository interfaces and implementations that:
- Abstract all data access (database + external APIs)
- Provide consistent interfaces for CRUD operations
- Return domain entities, not database/API types
- Enable easy testing via mock repositories
- Allow switching data sources without affecting business logic

### 2. Repository Architecture
```
domain/
└── repositories/            # Interfaces (abstractions)
    ├── IEventRepository.ts
    ├── IUserRepository.ts
    ├── ICalendarRepository.ts
    └── ITelegramAccountRepository.ts

infrastructure/
└── repositories/            # Concrete implementations
    ├── GoogleEventRepository.ts       # Google Calendar API
    ├── SupabaseUserRepository.ts      # Supabase database
    ├── SupabaseCalendarRepository.ts  # Supabase database
    └── SupabaseTelegramRepository.ts  # Supabase database
```

### 3. Dependency Flow
```
┌─────────────┐
│  Services   │  ← Depends on repository interfaces
└──────┬──────┘
       │ uses
       ▼
┌─────────────────────┐
│ IEventRepository    │  ← Abstract interface (domain layer)
│ IUserRepository     │
│ ICalendarRepository │
└──────┬──────────────┘
       │ implemented by
       ▼
┌──────────────────────────────┐
│ GoogleEventRepository        │  ← Concrete implementations (infrastructure)
│ SupabaseUserRepository       │
│ SupabaseCalendarRepository   │
└──────────────────────────────┘
```

### 4. Repository Characteristics
- **Interface-based** - services depend on abstractions, not concretions
- **Domain-focused** - methods named after business operations
- **Type-safe** - return domain entities, not raw DB types
- **Testable** - easy to create in-memory implementations for tests
- **Single data source per repository** - one repository = one data source

## Repository Design

### Phase 1: Define Repository Interfaces (Domain Layer)

#### IEventRepository
```typescript
// domain/repositories/IEventRepository.ts
import type { Event } from '@/domain/entities/Event';

export interface EventFilters {
  timeMin?: Date;
  timeMax?: Date;
  searchQuery?: string;
  maxResults?: number;
}

export interface IEventRepository {
  /**
   * Find event by ID in specified calendar
   */
  findById(calendarId: string, eventId: string): Promise<Event | null>;

  /**
   * List events in calendar with optional filters
   */
  list(calendarId: string, filters?: EventFilters): Promise<Event[]>;

  /**
   * Create new event in calendar
   */
  create(calendarId: string, event: Event): Promise<Event>;

  /**
   * Update existing event
   */
  update(eventId: string, event: Partial<Event>): Promise<Event>;

  /**
   * Delete event by ID
   */
  delete(eventId: string): Promise<void>;

  /**
   * Search events across all user calendars
   */
  search(userId: string, query: string): Promise<Event[]>;
}
```

#### IUserRepository
```typescript
// domain/repositories/IUserRepository.ts
import type { User } from '@/domain/entities/User';
import type { GoogleCredentials } from '@/domain/value-objects/GoogleCredentials';

export interface IUserRepository {
  /**
   * Find user by unique ID
   */
  findById(userId: string): Promise<User | null>;

  /**
   * Find user by email address
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create new user account
   */
  create(email: string, password: string): Promise<User>;

  /**
   * Get user's Google OAuth credentials
   */
  getCredentials(userId: string): Promise<GoogleCredentials>;

  /**
   * Update user's Google OAuth tokens
   */
  updateTokens(userId: string, tokens: Partial<GoogleCredentials>): Promise<void>;

  /**
   * Check if user has valid tokens
   */
  hasValidTokens(userId: string): Promise<boolean>;

  /**
   * Deactivate user's credentials
   */
  deactivateCredentials(userId: string): Promise<void>;
}
```

#### ICalendarRepository
```typescript
// domain/repositories/ICalendarRepository.ts
import type { Calendar } from '@/domain/entities/Calendar';

export interface ICalendarRepository {
  /**
   * Get all calendars for a user
   */
  getByUserId(userId: string): Promise<Calendar[]>;

  /**
   * Get user's primary calendar
   */
  getPrimaryCalendar(userId: string): Promise<Calendar | null>;

  /**
   * Find calendar by ID
   */
  findById(calendarId: string): Promise<Calendar | null>;

  /**
   * Sync calendars from Google to database
   */
  syncCalendars(userId: string, calendars: Calendar[]): Promise<void>;

  /**
   * Upsert calendar metadata
   */
  upsert(userId: string, calendar: Calendar): Promise<void>;

  /**
   * Delete calendars not in the provided list
   */
  deleteNotIn(userId: string, calendarIds: string[]): Promise<void>;
}
```

#### ITelegramAccountRepository
```typescript
// domain/repositories/ITelegramAccountRepository.ts
import type { TelegramAccount } from '@/domain/entities/TelegramAccount';

export interface ITelegramAccountRepository {
  /**
   * Find account by Telegram chat ID
   */
  findByChatId(chatId: number): Promise<TelegramAccount | null>;

  /**
   * Find account by user ID
   */
  findByUserId(userId: string): Promise<TelegramAccount | null>;

  /**
   * Link Telegram account to user
   */
  create(userId: string, chatId: number, metadata: TelegramMetadata): Promise<TelegramAccount>;

  /**
   * Update account metadata
   */
  update(chatId: number, metadata: Partial<TelegramMetadata>): Promise<void>;

  /**
   * Deactivate account
   */
  deactivate(chatId: number): Promise<void>;

  /**
   * Record last interaction timestamp
   */
  recordInteraction(chatId: number): Promise<void>;
}

export interface TelegramMetadata {
  username?: string;
  firstName?: string;
  languageCode?: string;
}
```

### Phase 2: Implement Repositories (Infrastructure Layer)

#### GoogleEventRepository
```typescript
// infrastructure/repositories/GoogleEventRepository.ts
import type { calendar_v3 } from 'googleapis';
import { injectable, inject } from 'inversify';
import type { IEventRepository, EventFilters } from '@/domain/repositories/IEventRepository';
import { Event, EventDateTime } from '@/domain/entities/Event';
import { TYPES } from '@/infrastructure/di/types';

@injectable()
export class GoogleEventRepository implements IEventRepository {
  constructor(
    @inject(TYPES.GoogleCalendarClient)
    private readonly calendarClient: calendar_v3.Calendar
  ) {}

  async findById(calendarId: string, eventId: string): Promise<Event | null> {
    try {
      const response = await this.calendarClient.events.get({
        calendarId,
        eventId,
      });

      return this.toDomain(response.data);
    } catch (error: any) {
      if (error.code === 404) {
        return null;
      }
      throw new EventRepositoryError('Failed to fetch event', error);
    }
  }

  async list(calendarId: string, filters?: EventFilters): Promise<Event[]> {
    try {
      const response = await this.calendarClient.events.list({
        calendarId,
        timeMin: filters?.timeMin?.toISOString(),
        timeMax: filters?.timeMax?.toISOString(),
        q: filters?.searchQuery,
        maxResults: filters?.maxResults ?? 250,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return (response.data.items ?? []).map(item => this.toDomain(item));
    } catch (error: any) {
      throw new EventRepositoryError('Failed to list events', error);
    }
  }

  async create(calendarId: string, event: Event): Promise<Event> {
    try {
      const googleEvent = this.toGoogleFormat(event);

      const response = await this.calendarClient.events.insert({
        calendarId,
        requestBody: googleEvent,
      });

      return this.toDomain(response.data);
    } catch (error: any) {
      throw new EventRepositoryError('Failed to create event', error);
    }
  }

  async update(eventId: string, event: Partial<Event>): Promise<Event> {
    try {
      const googleEvent = this.toGoogleFormat(event as Event);

      const response = await this.calendarClient.events.patch({
        calendarId: 'primary', // TODO: get from event
        eventId,
        requestBody: googleEvent,
      });

      return this.toDomain(response.data);
    } catch (error: any) {
      throw new EventRepositoryError('Failed to update event', error);
    }
  }

  async delete(eventId: string): Promise<void> {
    try {
      await this.calendarClient.events.delete({
        calendarId: 'primary',
        eventId,
      });
    } catch (error: any) {
      if (error.code === 404) {
        return; // Already deleted
      }
      throw new EventRepositoryError('Failed to delete event', error);
    }
  }

  async search(userId: string, query: string): Promise<Event[]> {
    // Search across all user calendars
    // Implementation would fetch user calendars first, then search each
    throw new Error('Not implemented');
  }

  // --- Mapping methods ---

  private toDomain(googleEvent: calendar_v3.Schema$Event): Event {
    return new Event(
      googleEvent.id!,
      googleEvent.summary ?? 'Untitled Event',
      this.toEventDateTime(googleEvent.start!),
      this.toEventDateTime(googleEvent.end!),
      googleEvent.organizer?.email ?? 'unknown',
      googleEvent.description,
      googleEvent.location
    );
  }

  private toEventDateTime(googleDateTime: calendar_v3.Schema$EventDateTime): EventDateTime {
    if (googleDateTime.date) {
      return EventDateTime.fromDate(googleDateTime.date);
    }
    return EventDateTime.fromDateTime(
      new Date(googleDateTime.dateTime!),
      googleDateTime.timeZone ?? 'UTC'
    );
  }

  private toGoogleFormat(event: Event): calendar_v3.Schema$Event {
    return {
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start.toGoogleFormat(),
      end: event.end.toGoogleFormat(),
    };
  }
}

class EventRepositoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'EventRepositoryError';
  }
}
```

#### SupabaseUserRepository
```typescript
// infrastructure/repositories/SupabaseUserRepository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import { User } from '@/domain/entities/User';
import { GoogleCredentials } from '@/domain/value-objects/GoogleCredentials';
import { TYPES } from '@/infrastructure/di/types';
import type { Database } from '@/database.types';

type DBUserCredentials = Database['public']['Tables']['user_google_credentials']['Row'];

@injectable()
export class SupabaseUserRepository implements IUserRepository {
  constructor(
    @inject(TYPES.SupabaseClient)
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async findById(userId: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('user_google_credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    // Note: After DB refactor, this should use users table with user_id FK
    const { data, error } = await this.supabase
      .from('user_google_credentials')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async create(email: string, password: string): Promise<User> {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      throw new UserRepositoryError('Failed to create user', error);
    }

    // Create credentials row
    const { data: credData, error: credError } = await this.supabase
      .from('user_google_credentials')
      .insert({
        user_id: data.user.id,
        email,
        is_active: false, // No tokens yet
      })
      .select()
      .single();

    if (credError) {
      throw new UserRepositoryError('Failed to create credentials', credError);
    }

    return this.toDomain(credData);
  }

  async getCredentials(userId: string): Promise<GoogleCredentials> {
    const { data, error } = await this.supabase
      .from('user_google_credentials')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      throw new UserRepositoryError('User credentials not found');
    }

    if (!data.access_token || !data.refresh_token) {
      throw new UserRepositoryError('User has no Google credentials');
    }

    return new GoogleCredentials(
      data.access_token,
      data.refresh_token,
      data.id_token ?? undefined,
      data.expiry_date ?? Date.now(),
      data.token_type ?? 'Bearer',
      data.scope ?? ''
    );
  }

  async updateTokens(userId: string, tokens: Partial<GoogleCredentials>): Promise<void> {
    const { error } = await this.supabase
      .from('user_google_credentials')
      .update({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
        id_token: tokens.idToken,
        expiry_date: tokens.expiryDate,
        token_type: tokens.tokenType,
        scope: tokens.scope,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) {
      throw new UserRepositoryError('Failed to update tokens', error);
    }
  }

  async hasValidTokens(userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('user_google_credentials')
      .select('access_token, refresh_token, expiry_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (!data?.access_token || !data?.refresh_token) {
      return false;
    }

    // Check if not expired (with 5 min buffer)
    const expiryDate = data.expiry_date ?? 0;
    const buffer = 5 * 60 * 1000;
    return Date.now() < (expiryDate - buffer);
  }

  async deactivateCredentials(userId: string): Promise<void> {
    await this.supabase
      .from('user_google_credentials')
      .update({ is_active: false })
      .eq('user_id', userId);
  }

  // --- Mapping methods ---

  private toDomain(row: DBUserCredentials): User {
    const credentials = row.access_token && row.refresh_token
      ? new GoogleCredentials(
          row.access_token,
          row.refresh_token,
          row.id_token ?? undefined,
          row.expiry_date ?? Date.now(),
          row.token_type ?? 'Bearer',
          row.scope ?? ''
        )
      : undefined;

    return new User(
      row.user_id,
      row.email ?? '',
      credentials
    );
  }
}

class UserRepositoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'UserRepositoryError';
  }
}
```

#### SupabaseCalendarRepository
```typescript
// infrastructure/repositories/SupabaseCalendarRepository.ts
import type { SupabaseClient } from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import type { ICalendarRepository } from '@/domain/repositories/ICalendarRepository';
import { Calendar } from '@/domain/entities/Calendar';
import { TYPES } from '@/infrastructure/di/types';
import type { Database } from '@/database.types';

type DBCalendar = Database['public']['Tables']['user_calendars']['Row'];

@injectable()
export class SupabaseCalendarRepository implements ICalendarRepository {
  constructor(
    @inject(TYPES.SupabaseClient)
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async getByUserId(userId: string): Promise<Calendar[]> {
    const { data, error } = await this.supabase
      .from('user_calendars')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw new CalendarRepositoryError('Failed to fetch calendars', error);
    }

    return (data ?? []).map(row => this.toDomain(row));
  }

  async getPrimaryCalendar(userId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('user_calendars')
      .select('*')
      .eq('user_id', userId)
      .eq('is_primary', true)
      .maybeSingle();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async findById(calendarId: string): Promise<Calendar | null> {
    const { data, error } = await this.supabase
      .from('user_calendars')
      .select('*')
      .eq('calendar_id', calendarId)
      .maybeSingle();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async syncCalendars(userId: string, calendars: Calendar[]): Promise<void> {
    // Upsert all provided calendars
    for (const calendar of calendars) {
      await this.upsert(userId, calendar);
    }

    // Delete calendars that no longer exist
    const calendarIds = calendars.map(c => c.calendarId);
    await this.deleteNotIn(userId, calendarIds);
  }

  async upsert(userId: string, calendar: Calendar): Promise<void> {
    const { error } = await this.supabase
      .from('user_calendars')
      .upsert({
        user_id: userId,
        calendar_id: calendar.calendarId,
        calendar_name: calendar.name,
        access_role: calendar.accessRole,
        time_zone: calendar.timeZone,
        is_primary: calendar.isPrimary,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,calendar_id',
      });

    if (error) {
      throw new CalendarRepositoryError('Failed to upsert calendar', error);
    }
  }

  async deleteNotIn(userId: string, calendarIds: string[]): Promise<void> {
    const { error } = await this.supabase
      .from('user_calendars')
      .delete()
      .eq('user_id', userId)
      .not('calendar_id', 'in', `(${calendarIds.join(',')})`);

    if (error) {
      throw new CalendarRepositoryError('Failed to delete old calendars', error);
    }
  }

  // --- Mapping methods ---

  private toDomain(row: DBCalendar): Calendar {
    return new Calendar(
      row.calendar_id,
      row.calendar_name,
      row.time_zone,
      row.access_role as 'owner' | 'writer' | 'reader',
      row.is_primary ?? false
    );
  }
}

class CalendarRepositoryError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'CalendarRepositoryError';
  }
}
```

## Testing Repositories

### Unit Tests with Mocked Clients
```typescript
// __tests__/infrastructure/repositories/GoogleEventRepository.test.ts
import { GoogleEventRepository } from '@/infrastructure/repositories/GoogleEventRepository';
import type { calendar_v3 } from 'googleapis';

describe('GoogleEventRepository', () => {
  let repository: GoogleEventRepository;
  let mockCalendarClient: jest.Mocked<calendar_v3.Calendar>;

  beforeEach(() => {
    mockCalendarClient = {
      events: {
        get: jest.fn(),
        list: jest.fn(),
        insert: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
      },
    } as any;

    repository = new GoogleEventRepository(mockCalendarClient);
  });

  describe('findById', () => {
    it('should return event when found', async () => {
      mockCalendarClient.events.get.mockResolvedValue({
        data: {
          id: 'evt-123',
          summary: 'Test Event',
          start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
        },
      } as any);

      const result = await repository.findById('primary', 'evt-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('evt-123');
      expect(result?.summary).toBe('Test Event');
    });

    it('should return null when event not found', async () => {
      mockCalendarClient.events.get.mockRejectedValue({ code: 404 });

      const result = await repository.findById('primary', 'not-found');

      expect(result).toBeNull();
    });
  });
});
```

### In-Memory Repository for Testing
```typescript
// __tests__/helpers/InMemoryEventRepository.ts
import type { IEventRepository, EventFilters } from '@/domain/repositories/IEventRepository';
import { Event } from '@/domain/entities/Event';

export class InMemoryEventRepository implements IEventRepository {
  private events: Map<string, Event> = new Map();

  async findById(calendarId: string, eventId: string): Promise<Event | null> {
    return this.events.get(eventId) ?? null;
  }

  async list(calendarId: string, filters?: EventFilters): Promise<Event[]> {
    let results = Array.from(this.events.values());

    if (filters?.searchQuery) {
      results = results.filter(e =>
        e.summary.toLowerCase().includes(filters.searchQuery!.toLowerCase())
      );
    }

    if (filters?.timeMin) {
      results = results.filter(e => e.start.toDate() >= filters.timeMin!);
    }

    return results;
  }

  async create(calendarId: string, event: Event): Promise<Event> {
    const id = `evt-${Date.now()}`;
    const newEvent = new Event(id, event.summary, event.start, event.end, calendarId);
    this.events.set(id, newEvent);
    return newEvent;
  }

  async update(eventId: string, event: Partial<Event>): Promise<Event> {
    const existing = this.events.get(eventId);
    if (!existing) throw new Error('Event not found');

    const updated = { ...existing, ...event };
    this.events.set(eventId, updated as Event);
    return updated as Event;
  }

  async delete(eventId: string): Promise<void> {
    this.events.delete(eventId);
  }

  async search(userId: string, query: string): Promise<Event[]> {
    return this.list('primary', { searchQuery: query });
  }

  // Test helper methods
  clear(): void {
    this.events.clear();
  }

  seed(events: Event[]): void {
    events.forEach(e => this.events.set(e.id, e));
  }
}
```

## Migration Strategy

### Step 1: Create Repository Interfaces (Domain Layer)
- Define all repository interfaces in `domain/repositories/`
- No implementation yet, just contracts

### Step 2: Implement Repositories (Infrastructure Layer)
- Create concrete implementations in `infrastructure/repositories/`
- Write unit tests for each repository
- Use mocked external clients (Supabase, Google API)

### Step 3: Refactor Services to Use Repositories
- Inject repositories into services via constructors
- Remove direct Supabase/Google API calls from services
- Update service tests to use in-memory repositories

### Step 4: Feature Flag Switching
```typescript
const USE_REPOSITORIES = process.env.USE_REPOSITORIES === 'true';

if (USE_REPOSITORIES) {
  const event = await eventRepository.create(calendarId, eventData);
} else {
  // Old direct Google API call
  const event = await calendar.events.insert({...});
}
```

### Step 5: Remove Old Data Access Code
- Delete direct database calls from controllers
- Delete direct API calls from utils
- Consolidate all data access in repositories

## Success Criteria

- [ ] All repository interfaces defined in domain layer
- [ ] All repository implementations in infrastructure layer
- [ ] Services depend only on repository interfaces (not implementations)
- [ ] No direct Supabase calls outside repositories
- [ ] No direct Google API calls outside repositories
- [ ] All repositories have 85%+ unit test coverage
- [ ] In-memory repositories created for testing
- [ ] Existing functionality preserved (regression tests pass)

## Files to Create

### Domain Layer (Interfaces)
- `domain/repositories/IEventRepository.ts`
- `domain/repositories/IUserRepository.ts`
- `domain/repositories/ICalendarRepository.ts`
- `domain/repositories/ITelegramAccountRepository.ts`

### Infrastructure Layer (Implementations)
- `infrastructure/repositories/GoogleEventRepository.ts`
- `infrastructure/repositories/SupabaseUserRepository.ts`
- `infrastructure/repositories/SupabaseCalendarRepository.ts`
- `infrastructure/repositories/SupabaseTelegramRepository.ts`

### Test Helpers
- `__tests__/helpers/InMemoryEventRepository.ts`
- `__tests__/helpers/InMemoryUserRepository.ts`
- `__tests__/helpers/InMemoryCalendarRepository.ts`

### Tests
- `__tests__/infrastructure/repositories/GoogleEventRepository.test.ts`
- `__tests__/infrastructure/repositories/SupabaseUserRepository.test.ts`
- `__tests__/infrastructure/repositories/SupabaseCalendarRepository.test.ts`

## References

- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Inversion Principle](https://en.wikipedia.org/wiki/Dependency_inversion_principle)
