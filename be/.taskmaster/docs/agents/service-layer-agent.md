# Service Layer Extraction Agent

## Purpose
Extract business logic from controllers and utilities into a dedicated service layer, establishing clear boundaries between HTTP concerns and domain operations in the AI Google Calendar Assistant.

## Current State Analysis

### Problem: Business Logic Scattered Across Layers

Currently, business logic resides in:
1. **Controllers** (`controllers/*.ts`) - 60% of business logic
2. **Utility functions** (`utils/*.ts`) - 30% of business logic
3. **Agent execution tools** (`ai-agents/execution-tools.ts`) - 10% of business logic

**No dedicated service layer exists.**

### Examples of Misplaced Business Logic

#### In Controllers (`calendar-controller.ts`):
```typescript
const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = req.user;

  // Business logic: fetch tokens, refresh if needed
  const tokenData = await fetchCredentialsByEmail(user.email);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);

  // Business logic: call external API
  const r = await calendar.calendarList.list({ prettyPrint: true });

  // Business logic: transform data
  const allCalendars = r.data.items?.map(item => ({
    access_role: item.accessRole,
    calendar_id: item.id,
    calendar_name: item.summary,
    time_zone_of_calendar: item.timeZone,
  }));

  // Business logic: sync with database
  await updateCalenderCategories(allCalendars, user.email, user.id);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Success", allCalendars);
});
```

**Problem**: Controller is doing 5 things beyond HTTP handling.

#### In Utils (`handle-events.ts`):
```typescript
export const eventsHandler = asyncHandler(
  async (req?, action?, eventData?, extra?) => {
    const email = req?.user?.email ?? extra?.email;
    const credentials = await fetchCredentialsByEmail(email);
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);

    // Business logic: CRUD operations
    switch (action) {
      case ACTION.GET:
        const { calendarId, timeMin, q } = extra ?? {};
        const eventsList = await calendar.events.list({...});
        return eventsList.data.items;

      case ACTION.INSERT:
        const inserted = await calendar.events.insert({...});
        return inserted.data;

      // ... more cases
    }
  }
);
```

**Problem**: God function mixing authentication, database access, API calls, and business decisions.

## Goals

### 1. Establish Clear Service Layer
Create dedicated service classes that:
- Contain all business logic
- Have single, well-defined responsibilities
- Are independent of HTTP framework
- Are easily testable with mocked dependencies

### 2. Service Architecture
```
application/
├── services/
│   ├── CalendarService.ts          # Calendar CRUD operations
│   ├── EventService.ts              # Event CRUD operations
│   ├── AuthService.ts               # Authentication & OAuth
│   ├── TokenManagementService.ts    # Token refresh & validation
│   ├── CalendarSyncService.ts       # Sync calendar metadata to DB
│   └── CalendarSelectionService.ts  # Smart calendar selection logic
└── dto/
    ├── CreateEventDTO.ts
    ├── UpdateEventDTO.ts
    ├── EventFiltersDTO.ts
    └── CalendarDTO.ts
```

### 3. Dependency Flow
```
┌─────────────────┐
│   Controllers   │  ← HTTP concerns only
└────────┬────────┘
         │ calls
         ▼
┌─────────────────┐
│    Services     │  ← Business logic
└────────┬────────┘
         │ uses
         ▼
┌─────────────────┐
│  Repositories   │  ← Data access
└─────────────────┘
```

### 4. Service Characteristics
- **Stateless** - no instance state beyond injected dependencies
- **Testable** - all dependencies injected via constructor
- **Focused** - single responsibility (one service = one domain concept)
- **Framework-agnostic** - no Express/HTTP types in services
- **Composable** - services can call other services

## Service Extraction Plan

### Phase 1: Core Services (Week 1-2)

#### 1.1 EventService
**Responsibility**: Event CRUD operations and event-related business logic

```typescript
// application/services/EventService.ts
import type { IEventRepository } from '@/domain/repositories/IEventRepository';
import type { ITokenManager } from '@/application/services/TokenManagementService';
import type { Event } from '@/domain/entities/Event';
import type { CreateEventDTO, UpdateEventDTO, EventFiltersDTO } from '@/application/dto';

export class EventService {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly tokenManager: ITokenManager,
    private readonly calendarSelectionService: CalendarSelectionService
  ) {}

  async createEvent(userId: string, dto: CreateEventDTO): Promise<Event> {
    // Business logic: determine target calendar
    const calendarId = dto.calendarId ??
      await this.calendarSelectionService.selectOptimalCalendar(userId, dto);

    // Business logic: create domain entity
    const event = this.mapDTOToEvent(dto);

    // Delegate to repository for persistence
    return this.eventRepository.create(calendarId, event);
  }

  async getEvent(userId: string, eventId: string, calendarId?: string): Promise<Event | null> {
    const targetCalendarId = calendarId ?? 'primary';
    return this.eventRepository.findById(targetCalendarId, eventId);
  }

  async listEvents(userId: string, filters: EventFiltersDTO): Promise<Event[]> {
    const calendarId = filters.calendarId ?? 'primary';
    return this.eventRepository.list(calendarId, {
      timeMin: filters.timeMin,
      timeMax: filters.timeMax,
      q: filters.searchQuery,
    });
  }

  async updateEvent(
    userId: string,
    eventId: string,
    updates: UpdateEventDTO
  ): Promise<Event> {
    // Business logic: fetch existing event
    const existing = await this.eventRepository.findById('primary', eventId);
    if (!existing) {
      throw new EventNotFoundError(eventId);
    }

    // Business logic: merge updates
    const updatedEvent = this.mergeUpdates(existing, updates);

    return this.eventRepository.update(eventId, updatedEvent);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    // Business logic: verify event exists before deletion
    const existing = await this.eventRepository.findById('primary', eventId);
    if (!existing) {
      throw new EventNotFoundError(eventId);
    }

    await this.eventRepository.delete(eventId);
  }

  private mapDTOToEvent(dto: CreateEventDTO): Event {
    return Event.fromDTO(dto);
  }

  private mergeUpdates(existing: Event, updates: UpdateEventDTO): Event {
    return new Event(
      existing.id,
      updates.summary ?? existing.summary,
      updates.start ? EventDateTime.fromDTO(updates.start) : existing.start,
      updates.end ? EventDateTime.fromDTO(updates.end) : existing.end,
      existing.calendarId,
      updates.description ?? existing.description,
      updates.location ?? existing.location
    );
  }
}
```

**Extracts logic from**:
- `utils/handle-events.ts` → All event CRUD operations
- `ai-agents/execution-tools.ts` → `insertEvent`, `updateEvent`, `getEvent`, `deleteEvent`

#### 1.2 CalendarService
**Responsibility**: Calendar metadata operations

```typescript
// application/services/CalendarService.ts
import type { ICalendarRepository } from '@/domain/repositories/ICalendarRepository';
import type { Calendar } from '@/domain/entities/Calendar';

export class CalendarService {
  constructor(
    private readonly calendarRepository: ICalendarRepository,
    private readonly tokenManager: ITokenManager
  ) {}

  async listUserCalendars(userId: string): Promise<Calendar[]> {
    // Business logic: fetch from Google API
    const client = await this.tokenManager.getAuthenticatedClient(userId);
    const googleCalendars = await client.calendarList.list({ prettyPrint: true });

    // Business logic: transform to domain entities
    const calendars = googleCalendars.data.items?.map(item =>
      Calendar.fromGoogleAPI(item)
    ) ?? [];

    // Business logic: sync with database for caching
    await this.calendarRepository.syncCalendars(userId, calendars);

    return calendars;
  }

  async getUserPrimaryCalendar(userId: string): Promise<Calendar> {
    const calendars = await this.calendarRepository.getByUserId(userId);
    const primary = calendars.find(c => c.isPrimary);

    if (!primary) {
      throw new PrimaryCalendarNotFoundError(userId);
    }

    return primary;
  }

  async getCalendarsByUser(userId: string): Promise<Calendar[]> {
    return this.calendarRepository.getByUserId(userId);
  }
}
```

**Extracts logic from**:
- `controllers/calendar-controller.ts` → `getAllCalendars`, `getCalendars`
- `utils/update-calendar-categories.ts` → Calendar sync logic

#### 1.3 AuthService
**Responsibility**: OAuth authentication and user registration

```typescript
// application/services/AuthService.ts
import type { OAuth2Client } from 'google-auth-library';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { GoogleTokens, GoogleUserInfo } from '@/domain/types';
import jwt from 'jsonwebtoken';

export class AuthService {
  constructor(
    private readonly oauth2Client: OAuth2Client,
    private readonly userRepository: IUserRepository
  ) {}

  async getAuthorizationUrl(scopes: string[]): Promise<string> {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);

    if (!tokens.access_token || !tokens.refresh_token) {
      throw new InvalidTokensError('Missing required tokens');
    }

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token!,
      idToken: tokens.id_token,
      expiryDate: tokens.expiry_date!,
      tokenType: tokens.token_type ?? 'Bearer',
      scope: tokens.scope!,
    };
  }

  async getUserInfo(idToken: string): Promise<GoogleUserInfo> {
    const decoded = jwt.decode(idToken);

    if (!decoded || typeof decoded !== 'object') {
      throw new InvalidTokenError('Invalid ID token');
    }

    return {
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      sub: decoded.sub,
    };
  }

  async registerUser(email: string, password: string): Promise<void> {
    // Business logic: create user in Supabase Auth
    await this.userRepository.create(email, password);
  }

  async validateUserExists(email: string): Promise<boolean> {
    const user = await this.userRepository.findByEmail(email);
    return user !== null;
  }
}
```

**Extracts logic from**:
- `controllers/users-controller.ts` → `generateAuthGoogleUrl`, `verifyUserTokens`
- `ai-agents/execution-tools.ts` → `registerUser`, `validateUser`

#### 1.4 TokenManagementService
**Responsibility**: Token refresh, validation, and client initialization

```typescript
// application/services/TokenManagementService.ts
import type { calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import type { IUserRepository } from '@/domain/repositories/IUserRepository';
import type { GoogleCredentials } from '@/domain/types';

export interface ITokenManager {
  getAuthenticatedClient(userId: string): Promise<calendar_v3.Calendar>;
}

export class TokenManagementService implements ITokenManager {
  constructor(
    private readonly oauth2Client: OAuth2Client,
    private readonly userRepository: IUserRepository
  ) {}

  async getAuthenticatedClient(userId: string): Promise<calendar_v3.Calendar> {
    // Business logic: fetch user credentials
    const credentials = await this.userRepository.getCredentials(userId);

    // Business logic: check if token expired
    if (this.isTokenExpired(credentials.expiryDate)) {
      const newTokens = await this.refreshAccessToken(credentials.refreshToken);
      await this.userRepository.updateTokens(userId, newTokens);
      credentials.accessToken = newTokens.accessToken;
    }

    // Set credentials on OAuth2 client
    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    // Return authenticated Google Calendar client
    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  private isTokenExpired(expiryDate: number): boolean {
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes buffer
    return now >= (expiryDate - buffer);
  }

  private async refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });

    const { credentials } = await this.oauth2Client.refreshAccessToken();

    return {
      accessToken: credentials.access_token!,
      refreshToken: credentials.refresh_token ?? refreshToken,
      expiryDate: credentials.expiry_date!,
      tokenType: credentials.token_type ?? 'Bearer',
      scope: credentials.scope ?? '',
    };
  }
}
```

**Extracts logic from**:
- `utils/init-calendar-with-user-tokens-and-update-tokens.ts` → Entire file
- `utils/update-tokens-of-user.ts` → Token update logic

#### 1.5 CalendarSelectionService
**Responsibility**: Smart calendar selection based on event context

```typescript
// application/services/CalendarSelectionService.ts
import type { ICalendarRepository } from '@/domain/repositories/ICalendarRepository';
import type { CreateEventDTO } from '@/application/dto';

export class CalendarSelectionService {
  constructor(private readonly calendarRepository: ICalendarRepository) {}

  async selectOptimalCalendar(
    userId: string,
    eventContext: CreateEventDTO
  ): Promise<string> {
    // Business logic: AI-powered calendar selection
    const userCalendars = await this.calendarRepository.getByUserId(userId);

    if (userCalendars.length === 0) {
      return 'primary';
    }

    // Business logic: analyze event summary, location, attendees
    const keywords = this.extractKeywords(eventContext.summary);
    const matchingCalendar = this.findBestMatch(userCalendars, keywords);

    return matchingCalendar?.calendarId ?? 'primary';
  }

  private extractKeywords(summary: string): string[] {
    // Business logic: keyword extraction
    const lowerSummary = summary.toLowerCase();
    const keywords: string[] = [];

    if (lowerSummary.includes('work') || lowerSummary.includes('meeting')) {
      keywords.push('work');
    }
    if (lowerSummary.includes('personal') || lowerSummary.includes('family')) {
      keywords.push('personal');
    }

    return keywords;
  }

  private findBestMatch(calendars: Calendar[], keywords: string[]): Calendar | null {
    // Business logic: match calendars by name similarity
    for (const calendar of calendars) {
      const calendarName = calendar.name.toLowerCase();
      for (const keyword of keywords) {
        if (calendarName.includes(keyword)) {
          return calendar;
        }
      }
    }

    return null;
  }
}
```

**Extracts logic from**:
- `ai-agents/execution-tools.ts` → `getCalendarTypesByEventDetails`
- `ai-agents/agent-utils.ts` → `getCalendarCategoriesByEmail`

### Phase 2: Supporting Services (Week 3)

#### 2.1 CalendarSyncService
```typescript
// application/services/CalendarSyncService.ts
export class CalendarSyncService {
  constructor(private readonly calendarRepository: ICalendarRepository) {}

  async syncUserCalendars(userId: string, googleCalendars: Calendar[]): Promise<void> {
    // Business logic: upsert calendars in database
    for (const calendar of googleCalendars) {
      await this.calendarRepository.upsert(userId, calendar);
    }

    // Business logic: remove calendars that no longer exist in Google
    const existingCalendarIds = googleCalendars.map(c => c.calendarId);
    await this.calendarRepository.deleteNotIn(userId, existingCalendarIds);
  }
}
```

**Extracts logic from**:
- `utils/update-calendar-categories.ts` → Entire file

#### 2.2 UserDefaultsService
```typescript
// application/services/UserDefaultsService.ts
export class UserDefaultsService {
  constructor(
    private readonly calendarRepository: ICalendarRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async getUserDefaultTimeZone(userId: string): Promise<string> {
    // Business logic: fetch from user profile or primary calendar
    const primaryCalendar = await this.calendarRepository.getPrimaryCalendar(userId);

    if (primaryCalendar?.timeZone) {
      return primaryCalendar.timeZone;
    }

    // Fallback to UTC
    return 'UTC';
  }
}
```

**Extracts logic from**:
- `ai-agents/execution-tools.ts` → `getUserDefaultTimeZone` tool

## Data Transfer Objects (DTOs)

### Event DTOs
```typescript
// application/dto/CreateEventDTO.ts
export interface CreateEventDTO {
  summary: string;
  start: EventDateTimeDTO;
  end: EventDateTimeDTO;
  calendarId?: string;
  description?: string;
  location?: string;
  attendees?: string[];
}

export interface EventDateTimeDTO {
  dateTime?: string; // ISO 8601
  date?: string;     // YYYY-MM-DD
  timeZone?: string; // IANA timezone
}

// application/dto/UpdateEventDTO.ts
export interface UpdateEventDTO {
  summary?: string;
  start?: EventDateTimeDTO;
  end?: EventDateTimeDTO;
  description?: string;
  location?: string;
  attendees?: string[];
}

// application/dto/EventFiltersDTO.ts
export interface EventFiltersDTO {
  calendarId?: string;
  timeMin?: Date;
  timeMax?: Date;
  searchQuery?: string;
  maxResults?: number;
}
```

### Calendar DTOs
```typescript
// application/dto/CalendarDTO.ts
export interface CalendarDTO {
  id: string;
  name: string;
  timeZone: string;
  accessRole: 'owner' | 'writer' | 'reader' | 'freeBusyReader';
  isPrimary: boolean;
}
```

## Controller Refactoring (After Services)

### Before (God Controller):
```typescript
const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  const user = req.user;
  const tokenData = await fetchCredentialsByEmail(user.email);
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);
  const r = await calendar.calendarList.list({ prettyPrint: true });
  const allCalendars = r.data.items?.map(item => ({...}));
  await updateCalenderCategories(allCalendars, user.email, user.id);
  sendR(res, STATUS_RESPONSE.SUCCESS, "Success", allCalendars);
});
```

### After (Thin Controller):
```typescript
// interfaces/http/controllers/CalendarController.ts
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  listCalendars = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;

    // Single service call - all business logic delegated
    const calendars = await this.calendarService.listUserCalendars(userId);

    sendR(res, STATUS_RESPONSE.SUCCESS, 'Calendars retrieved', calendars);
  });
}
```

**Result**: Controller reduced from 15 lines to 5 lines, 0 business logic.

## Service Dependency Injection

### Dependency Injection Container
```typescript
// infrastructure/di/container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

const container = new Container();

// Repositories
container.bind<IEventRepository>(TYPES.EventRepository)
  .to(GoogleEventRepository)
  .inSingletonScope();

container.bind<IUserRepository>(TYPES.UserRepository)
  .to(SupabaseUserRepository)
  .inSingletonScope();

// Services
container.bind<EventService>(TYPES.EventService)
  .to(EventService)
  .inSingletonScope();

container.bind<CalendarService>(TYPES.CalendarService)
  .to(CalendarService)
  .inSingletonScope();

container.bind<AuthService>(TYPES.AuthService)
  .to(AuthService)
  .inSingletonScope();

container.bind<ITokenManager>(TYPES.TokenManager)
  .to(TokenManagementService)
  .inSingletonScope();

// Controllers
container.bind<EventController>(TYPES.EventController)
  .to(EventController)
  .inSingletonScope();

export { container };
```

### Service Resolution
```typescript
// interfaces/http/routes/calendar-route.ts
import { container } from '@/infrastructure/di/container';
import { TYPES } from '@/infrastructure/di/types';
import type { CalendarController } from '@/interfaces/http/controllers/CalendarController';

const calendarController = container.get<CalendarController>(TYPES.CalendarController);

router.get('/calendars', calendarController.listCalendars);
router.get('/calendars/:id', calendarController.getCalendar);
```

## Migration Strategy

### Step 1: Create Services Alongside Existing Code
- Build all service classes in `application/services/`
- Do not modify existing controllers/utils yet
- Write unit tests for each service

### Step 2: Feature Flag Switching
```typescript
// Feature flag to switch between old and new implementation
const USE_NEW_SERVICES = process.env.USE_NEW_SERVICES === 'true';

const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  if (USE_NEW_SERVICES) {
    // New implementation via service
    const calendars = await calendarService.listUserCalendars(req.user.id);
    return sendR(res, STATUS_RESPONSE.SUCCESS, 'Success', calendars);
  }

  // Old implementation (original code)
  const tokenData = await fetchCredentialsByEmail(req.user.email);
  // ... rest of old code
});
```

### Step 3: Gradual Rollout
1. Enable for 10% of traffic
2. Monitor errors and performance
3. Increase to 50%
4. Increase to 100%
5. Remove old code after 30 days

### Step 4: Delete Old Code
- Remove `utils/handle-events.ts`
- Remove `utils/init-calendar-with-user-tokens-and-update-tokens.ts`
- Remove `utils/update-calendar-categories.ts`
- Refactor `ai-agents/execution-tools.ts` to use services

## Testing Services

### Unit Test Example
```typescript
// __tests__/application/services/EventService.test.ts
describe('EventService', () => {
  let service: EventService;
  let mockEventRepo: jest.Mocked<IEventRepository>;
  let mockTokenManager: jest.Mocked<ITokenManager>;

  beforeEach(() => {
    mockEventRepo = createMockEventRepository();
    mockTokenManager = createMockTokenManager();
    service = new EventService(mockEventRepo, mockTokenManager);
  });

  it('should create event in specified calendar', async () => {
    const dto: CreateEventDTO = {
      summary: 'Meeting',
      start: { dateTime: '2025-01-15T10:00:00Z', timeZone: 'UTC' },
      end: { dateTime: '2025-01-15T11:00:00Z', timeZone: 'UTC' },
      calendarId: 'work-cal',
    };

    const result = await service.createEvent('user-123', dto);

    expect(mockEventRepo.create).toHaveBeenCalledWith('work-cal', expect.any(Event));
  });
});
```

## Success Criteria

- [ ] All business logic moved to service layer
- [ ] Controllers contain only HTTP concerns (< 10 lines per method)
- [ ] All services are stateless
- [ ] All services have 90%+ unit test coverage
- [ ] Services are framework-agnostic (no Express types)
- [ ] All dependencies injected via constructors
- [ ] DTOs defined for all service inputs/outputs
- [ ] Existing functionality preserved (regression tests pass)

## Files to Create

### Services
- `application/services/EventService.ts`
- `application/services/CalendarService.ts`
- `application/services/AuthService.ts`
- `application/services/TokenManagementService.ts`
- `application/services/CalendarSelectionService.ts`
- `application/services/CalendarSyncService.ts`
- `application/services/UserDefaultsService.ts`

### DTOs
- `application/dto/CreateEventDTO.ts`
- `application/dto/UpdateEventDTO.ts`
- `application/dto/EventFiltersDTO.ts`
- `application/dto/CalendarDTO.ts`

### DI Configuration
- `infrastructure/di/container.ts`
- `infrastructure/di/types.ts`

### Tests
- `__tests__/application/services/EventService.test.ts`
- `__tests__/application/services/CalendarService.test.ts`
- `__tests__/application/services/AuthService.test.ts`
- `__tests__/application/services/TokenManagementService.test.ts`

## References

- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Dependency Injection in TypeScript](https://github.com/inversify/InversifyJS)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [DTOs vs Domain Models](https://enterprisecraftsmanship.com/posts/dto-vs-value-object-vs-poco/)
