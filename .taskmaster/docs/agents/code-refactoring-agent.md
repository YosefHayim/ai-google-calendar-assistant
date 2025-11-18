# Code Refactoring Agent

## Purpose
Refactor the AI Google Calendar Assistant codebase to adhere to Single Responsibility Principle (SRP), eliminate god functions, improve separation of concerns, and establish clean architecture patterns.

## Current State Analysis

### Critical Single Responsibility Violations

#### 1. `handle-events.ts` - God Function (120 lines)
**Location**: `utils/handle-events.ts`

**Current Responsibilities** (6 concerns):
1. Authentication/authorization (extracting email from request)
2. Database operations (fetching tokens via Supabase)
3. OAuth token refresh
4. Google Calendar API calls (4 different CRUD operations)
5. Data transformation (custom vs raw responses)
6. Error handling

**Example Code**:
```typescript
export const eventsHandler = asyncHandler(
  async (req?, action?, eventData?, extra?) => {
    // Auth concern
    const email = req?.user?.email ?? extra?.email;

    // Database concern
    const credentials = await fetchCredentialsByEmail(email);

    // OAuth concern
    const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);

    // Business logic - CRUD operations
    switch (action) {
      case ACTION.GET: { /* 20 lines */ }
      case ACTION.INSERT: { /* 15 lines */ }
      case ACTION.UPDATE: { /* 15 lines */ }
      case ACTION.DELETE: { /* 10 lines */ }
    }

    // Presentation concern
    return customFlag ? transformedData : rawData;
  }
);
```

**Refactored Structure**:
```typescript
// application/services/CalendarService.ts
class CalendarService {
  constructor(
    private calendarClient: GoogleCalendarClient,
    private eventRepository: EventRepository,
    private tokenManager: TokenManager
  ) {}

  async listEvents(userId: string, filters: EventFilters): Promise<Event[]> {
    const calendar = await this.tokenManager.getAuthenticatedClient(userId);
    return this.eventRepository.list(calendar, filters);
  }

  async createEvent(userId: string, eventData: CreateEventDTO): Promise<Event> {
    const calendar = await this.tokenManager.getAuthenticatedClient(userId);
    return this.eventRepository.create(calendar, eventData);
  }

  async updateEvent(userId: string, eventId: string, updates: UpdateEventDTO): Promise<Event> {
    const calendar = await this.tokenManager.getAuthenticatedClient(userId);
    return this.eventRepository.update(calendar, eventId, updates);
  }

  async deleteEvent(userId: string, eventId: string): Promise<void> {
    const calendar = await this.tokenManager.getAuthenticatedClient(userId);
    return this.eventRepository.delete(calendar, eventId);
  }
}
```

#### 2. `users-controller.ts` - Controller Doing Too Much (159 lines)
**Location**: `controllers/users-controller.ts`

**Current Responsibilities** (5+ concerns):
1. HTTP routing
2. OAuth flow management
3. JWT decoding
4. Database operations
5. Client type detection (Postman vs browser)
6. Response formatting

**Example Violation** (`generateAuthGoogleUrl` function):
```typescript
const generateAuthGoogleUrl = reqResAsyncHandler(async (req, res) => {
  const code = req.query.code;
  const url = OAUTH2CLIENT.generateAuthUrl(...); // OAuth concern

  if (!code) {
    // Client detection (middleware concern)
    if (postmanHeaders?.includes("Postman")) {
      return sendR(res, STATUS_RESPONSE.SUCCESS, url);
    }
    return res.redirect(url);
  }

  // OAuth token exchange (service concern)
  const { tokens } = await OAUTH2CLIENT.getToken(code);

  // JWT decoding (auth service concern)
  const user = jwt.decode(id_token);

  // Database operations (repository concern)
  const { data } = await SUPABASE.from("user_calendar_tokens")
    .update({...tokens})
    .eq("email", user.email);

  sendR(res, STATUS_RESPONSE.SUCCESS, "Tokens updated", { data });
});
```

**Refactored Structure**:
```typescript
// interfaces/http/controllers/AuthController.ts
class AuthController {
  constructor(
    private authService: AuthService,
    private userRepository: UserRepository
  ) {}

  async handleGoogleCallback(req: Request, res: Response): Promise<void> {
    const { code } = req.query;

    if (!code) {
      const authUrl = await this.authService.getAuthorizationUrl();

      if (req.accepts('json')) {
        return sendR(res, STATUS_RESPONSE.SUCCESS, authUrl);
      }
      return res.redirect(authUrl);
    }

    const tokens = await this.authService.exchangeCodeForTokens(code as string);
    const userInfo = await this.authService.getUserInfo(tokens.id_token);
    await this.userRepository.updateTokens(userInfo.email, tokens);

    sendR(res, STATUS_RESPONSE.SUCCESS, "Authentication successful");
  }
}

// application/services/AuthService.ts
class AuthService {
  constructor(private oauth2Client: OAuth2Client) {}

  async getAuthorizationUrl(): Promise<string> {
    return this.oauth2Client.generateAuthUrl({...});
  }

  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  getUserInfo(idToken: string): GoogleUserInfo {
    return jwt.decode(idToken) as GoogleUserInfo;
  }
}
```

#### 3. `calendar-controller.ts` - Tight Coupling (140 lines)
**Location**: `controllers/calendar-controller.ts`

**Current Pattern** (7 concerns per method):
```typescript
const getAllCalendars = reqResAsyncHandler(async (req, res) => {
  // 1. Extract user (auth concern)
  const user = req.user;

  // 2. Fetch tokens (repository concern)
  const tokenData = await fetchCredentialsByEmail(user.email);

  // 3. Initialize Google client (service concern)
  const calendar = await initCalendarWithUserTokensAndUpdateTokens(tokenData);

  // 4. Make API call (service concern)
  const r = await calendar.calendarList.list({ prettyPrint: true });

  // 5. Transform data (transformer concern)
  const allCalendars = r.data.items?.map(item => ({...}));

  // 6. Side effect: update database (repository concern)
  await updateCalenderCategories(allCalendars, user.email, user.id);

  // 7. Send response (controller concern)
  sendR(res, STATUS_RESPONSE.SUCCESS, "Success", allCalendars);
});
```

**Refactored Structure**:
```typescript
// interfaces/http/controllers/CalendarController.ts
class CalendarController {
  constructor(private calendarService: CalendarService) {}

  async getAllCalendars(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user.id;
    const calendars = await this.calendarService.listUserCalendars(userId);
    sendR(res, STATUS_RESPONSE.SUCCESS, "Calendars retrieved", calendars);
  }
}

// application/services/CalendarService.ts
class CalendarService {
  constructor(
    private calendarClient: GoogleCalendarClient,
    private calendarRepository: CalendarRepository,
    private tokenManager: TokenManager
  ) {}

  async listUserCalendars(userId: string): Promise<Calendar[]> {
    const client = await this.tokenManager.getAuthenticatedClient(userId);
    const googleCalendars = await this.calendarClient.listCalendars(client);
    const calendars = googleCalendars.map(this.transformGoogleCalendar);

    // Sync with database
    await this.calendarRepository.syncCalendars(userId, calendars);

    return calendars;
  }
}
```

#### 4. `init-calendar-with-user-tokens-and-update-tokens.ts` - Misnamed & Multi-Purpose
**Location**: `utils/init-calendar-with-user-tokens-and-update-tokens.ts`

**Current Issues**:
- Name describes implementation, not intent
- Does 3 things: sets credentials, refreshes tokens, updates database

**Refactored Structure**:
```typescript
// infrastructure/google/GoogleCalendarClientFactory.ts
class GoogleCalendarClientFactory {
  constructor(
    private oauth2Client: OAuth2Client,
    private tokenRefreshService: TokenRefreshService
  ) {}

  async createAuthenticatedClient(credentials: GoogleCredentials): Promise<calendar_v3.Calendar> {
    this.oauth2Client.setCredentials(credentials);

    // Auto-refresh tokens when expired
    this.oauth2Client.on('tokens', async (tokens) => {
      await this.tokenRefreshService.updateTokens(credentials.userId, tokens);
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }
}
```

#### 5. `agent-utils.ts` - Validation Mixed with Transformation
**Location**: `ai-agents/agent-utils.ts`

**Current Violation** (`formatEventData` function):
```typescript
export const formatEventData = (params: Partial<Event>): Event => {
  const cleaned = deepClean(params || {}); // Transformation
  const start = normalizeEDT(cleaned.start); // Transformation

  // Validation (throwing errors)
  if (!cleaned.summary) throw new Error("Summary required");
  if (!(start.dateTime || start.date)) throw new Error("Start required");
  if (!tzStart && !tzEnd) throw new Error("Timezone required");

  // More transformation
  return deepClean({ summary, description, location, start, end });
}
```

**Refactored Structure**:
```typescript
// domain/validators/EventValidator.ts
class EventValidator {
  validate(event: Partial<Event>): ValidationResult<Event> {
    const errors: ValidationError[] = [];

    if (!event.summary) {
      errors.push({ field: 'summary', message: 'Summary is required' });
    }

    if (!event.start?.dateTime && !event.start?.date) {
      errors.push({ field: 'start', message: 'Start time is required' });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, value: event as Event };
  }
}

// domain/transformers/EventTransformer.ts
class EventTransformer {
  normalize(event: Partial<Event>): Event {
    const cleaned = this.deepClean(event);
    const start = this.normalizeEventDateTime(cleaned.start);
    const end = this.normalizeEventDateTime(cleaned.end);

    return {
      summary: cleaned.summary!,
      description: cleaned.description,
      location: cleaned.location,
      start,
      end,
    };
  }
}
```

#### 6. `execution-tools.ts` - Mixed Concerns (133 lines)
**Location**: `ai-agents/execution-tools.ts`

**Current Pattern** (4-5 concerns per function):
```typescript
insertEvent: asyncHandler((params) => {
  // 1. Input validation
  const { email, calendarId, eventLike } = coerceArgs(params);
  if (!(email && isEmail(email))) {
    throw new Error("Invalid email address.");
  }

  // 2. Transformation
  const eventData = formatEventData(eventLike);

  // 3. External API call (delegates to eventsHandler)
  return eventsHandler(null, ACTION.INSERT, eventData, {
    email,
    calendarId: calendarId ?? "primary"
  });
})
```

**Refactored Structure**:
```typescript
// ai-agents/tools/InsertEventTool.ts
class InsertEventTool implements AgentTool {
  constructor(
    private calendarService: CalendarService,
    private eventValidator: EventValidator,
    private eventTransformer: EventTransformer
  ) {}

  async execute(params: InsertEventParams): Promise<Event> {
    // Validation (returns Result type, doesn't throw)
    const validationResult = this.eventValidator.validate(params);
    if (!validationResult.success) {
      throw new AgentExecutionError('Validation failed', validationResult.errors);
    }

    // Transformation
    const eventData = this.eventTransformer.normalize(params);

    // Delegate to service layer
    return this.calendarService.createEvent(params.userId, eventData);
  }
}
```

## Goals

### 1. Single Responsibility Principle (SRP)
- Each function/class has ONE reason to change
- Clear separation between validation, transformation, business logic, and I/O
- No god functions that do everything

### 2. Clean Architecture Layers
```
interfaces/          # Entry points (HTTP, Telegram, CLI)
  ├── http/
  │   ├── controllers/    # Thin controllers (orchestration only)
  │   ├── middleware/     # Request/response processing
  │   └── routes/         # Route definitions
  └── telegram/
      └── bot/            # Telegram bot handlers

application/         # Use cases / services
  ├── services/          # Business logic orchestration
  ├── validators/        # Business rule validation
  └── dto/              # Data transfer objects

domain/              # Business models & core logic
  ├── entities/          # Event, Calendar, User models
  ├── value-objects/     # TimeRange, EventDuration, etc.
  └── repositories/      # Repository interfaces (abstract)

infrastructure/      # External concerns & implementations
  ├── repositories/      # Concrete repository implementations
  ├── google/           # Google Calendar client
  ├── supabase/         # Database client & migrations
  └── ai-agents/        # OpenAI Agents configuration
```

### 3. Dependency Inversion
- High-level modules don't depend on low-level modules
- Both depend on abstractions (interfaces)
- Use dependency injection throughout

### 4. Testability
- All business logic pure and testable without mocks
- Infrastructure dependencies injected, easily mockable
- Clear boundaries between layers

## Implementation Plan

### Phase 1: Establish Domain Layer (Week 1)

#### 1.1 Create Domain Entities
```typescript
// domain/entities/Event.ts
export class Event {
  constructor(
    public readonly id: string,
    public readonly summary: string,
    public readonly start: EventDateTime,
    public readonly end: EventDateTime,
    public readonly calendarId: string,
    public readonly description?: string,
    public readonly location?: string
  ) {}

  get duration(): Duration {
    return Duration.between(this.start, this.end);
  }

  isAllDay(): boolean {
    return this.start.isDateOnly() && this.end.isDateOnly();
  }
}

// domain/value-objects/EventDateTime.ts
export class EventDateTime {
  private constructor(
    private readonly value: Date | string, // Date object or YYYY-MM-DD
    private readonly timeZone?: string
  ) {}

  static fromDateTime(dateTime: Date, timeZone: string): EventDateTime {
    return new EventDateTime(dateTime, timeZone);
  }

  static fromDate(date: string): EventDateTime {
    return new EventDateTime(date);
  }

  isDateOnly(): boolean {
    return typeof this.value === 'string';
  }

  toGoogleFormat(): GoogleEventDateTime {
    if (this.isDateOnly()) {
      return { date: this.value as string };
    }
    return {
      dateTime: (this.value as Date).toISOString(),
      timeZone: this.timeZone!
    };
  }
}
```

#### 1.2 Create Repository Interfaces
```typescript
// domain/repositories/IEventRepository.ts
export interface IEventRepository {
  findById(calendarId: string, eventId: string): Promise<Event | null>;
  list(calendarId: string, filters: EventFilters): Promise<Event[]>;
  create(calendarId: string, event: Event): Promise<Event>;
  update(eventId: string, event: Partial<Event>): Promise<Event>;
  delete(eventId: string): Promise<void>;
}

// domain/repositories/IUserRepository.ts
export interface IUserRepository {
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  updateTokens(userId: string, tokens: GoogleTokens): Promise<void>;
  getCredentials(userId: string): Promise<GoogleCredentials>;
}
```

### Phase 2: Build Application Layer (Week 2)

#### 2.1 Create Service Classes
```typescript
// application/services/CalendarService.ts
export class CalendarService {
  constructor(
    private readonly eventRepository: IEventRepository,
    private readonly calendarRepository: ICalendarRepository,
    private readonly tokenManager: ITokenManager
  ) {}

  async createEvent(userId: string, dto: CreateEventDTO): Promise<Event> {
    // 1. Get authenticated client
    const client = await this.tokenManager.getAuthenticatedClient(userId);

    // 2. Determine target calendar
    const calendarId = dto.calendarId ?? await this.getDefaultCalendarId(userId);

    // 3. Create domain entity
    const event = Event.fromDTO(dto);

    // 4. Persist
    return this.eventRepository.create(calendarId, event);
  }

  private async getDefaultCalendarId(userId: string): Promise<string> {
    const calendars = await this.calendarRepository.listByUser(userId);
    const primary = calendars.find(c => c.isPrimary);
    return primary?.id ?? 'primary';
  }
}
```

#### 2.2 Create DTOs (Data Transfer Objects)
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
```

#### 2.3 Create Validators
```typescript
// application/validators/EventValidator.ts
export class EventValidator {
  validate(dto: CreateEventDTO): ValidationResult<CreateEventDTO> {
    const errors: ValidationError[] = [];

    if (!dto.summary?.trim()) {
      errors.push({ field: 'summary', message: 'Summary cannot be empty' });
    }

    if (!this.isValidEventDateTime(dto.start)) {
      errors.push({ field: 'start', message: 'Invalid start time' });
    }

    if (!this.isValidEventDateTime(dto.end)) {
      errors.push({ field: 'end', message: 'Invalid end time' });
    }

    if (errors.length > 0) {
      return { success: false, errors };
    }

    return { success: true, value: dto };
  }

  private isValidEventDateTime(edt: EventDateTimeDTO): boolean {
    return !!(edt.dateTime || edt.date);
  }
}
```

### Phase 3: Refactor Infrastructure Layer (Week 3)

#### 3.1 Implement Repositories
```typescript
// infrastructure/repositories/SupabaseUserRepository.ts
export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from('user_google_credentials')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !data) return null;

    return this.toDomain(data);
  }

  async updateTokens(userId: string, tokens: GoogleTokens): Promise<void> {
    await this.supabase
      .from('user_google_credentials')
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);
  }

  private toDomain(row: DBUserCredentials): User {
    return new User(
      row.user_id,
      row.email,
      new GoogleCredentials(
        row.access_token,
        row.refresh_token,
        row.expiry_date
      )
    );
  }
}

// infrastructure/repositories/GoogleEventRepository.ts
export class GoogleEventRepository implements IEventRepository {
  constructor(private readonly calendarClient: GoogleCalendarClient) {}

  async create(calendarId: string, event: Event): Promise<Event> {
    const googleEvent = this.toGoogleFormat(event);

    const response = await this.calendarClient.events.insert({
      calendarId,
      requestBody: googleEvent,
    });

    return this.toDomain(response.data);
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

  private toDomain(googleEvent: calendar_v3.Schema$Event): Event {
    return new Event(
      googleEvent.id!,
      googleEvent.summary!,
      EventDateTime.fromGoogleFormat(googleEvent.start!),
      EventDateTime.fromGoogleFormat(googleEvent.end!),
      googleEvent.organizer?.email ?? '',
      googleEvent.description,
      googleEvent.location
    );
  }
}
```

#### 3.2 Token Management Service
```typescript
// infrastructure/google/TokenManager.ts
export class TokenManager implements ITokenManager {
  constructor(
    private readonly oauth2Client: OAuth2Client,
    private readonly userRepository: IUserRepository,
    private readonly tokenRefreshService: TokenRefreshService
  ) {}

  async getAuthenticatedClient(userId: string): Promise<calendar_v3.Calendar> {
    const credentials = await this.userRepository.getCredentials(userId);

    // Check if token is expired
    if (this.isTokenExpired(credentials.expiryDate)) {
      const newTokens = await this.tokenRefreshService.refresh(credentials.refreshToken);
      await this.userRepository.updateTokens(userId, newTokens);
      credentials.accessToken = newTokens.access_token;
    }

    this.oauth2Client.setCredentials({
      access_token: credentials.accessToken,
      refresh_token: credentials.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  private isTokenExpired(expiryDate: number): boolean {
    return Date.now() >= expiryDate;
  }
}
```

### Phase 4: Refactor Controllers (Week 4)

#### 4.1 Thin Controllers
```typescript
// interfaces/http/controllers/EventController.ts
export class EventController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly eventValidator: EventValidator
  ) {}

  createEvent = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const dto: CreateEventDTO = req.body;
    const userId = req.user.id;

    // Validate
    const validationResult = this.eventValidator.validate(dto);
    if (!validationResult.success) {
      return sendR(res, STATUS_RESPONSE.VALIDATION_ERROR,
        'Invalid event data', validationResult.errors);
    }

    // Delegate to service
    const event = await this.calendarService.createEvent(userId, dto);

    sendR(res, STATUS_RESPONSE.SUCCESS, 'Event created', event);
  });

  listEvents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user.id;
    const filters = this.parseFilters(req.query);

    const events = await this.calendarService.listEvents(userId, filters);

    sendR(res, STATUS_RESPONSE.SUCCESS, 'Events retrieved', events);
  });

  private parseFilters(query: any): EventFilters {
    return {
      calendarId: query.calendarId,
      timeMin: query.timeMin ? new Date(query.timeMin) : undefined,
      timeMax: query.timeMax ? new Date(query.timeMax) : undefined,
      q: query.q,
    };
  }
}
```

#### 4.2 Dependency Injection Setup
```typescript
// infrastructure/di/container.ts
import { Container } from 'inversify';
import { TYPES } from './types';

export const container = new Container();

// Repositories
container.bind<IUserRepository>(TYPES.UserRepository)
  .to(SupabaseUserRepository)
  .inSingletonScope();

container.bind<IEventRepository>(TYPES.EventRepository)
  .to(GoogleEventRepository)
  .inSingletonScope();

// Services
container.bind<CalendarService>(TYPES.CalendarService)
  .to(CalendarService)
  .inSingletonScope();

container.bind<ITokenManager>(TYPES.TokenManager)
  .to(TokenManager)
  .inSingletonScope();

// Controllers
container.bind<EventController>(TYPES.EventController)
  .to(EventController)
  .inSingletonScope();
```

### Phase 5: Refactor AI Agent Tools (Week 5)

#### 5.1 Clean Tool Implementations
```typescript
// infrastructure/ai-agents/tools/InsertEventTool.ts
export class InsertEventTool {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly eventValidator: EventValidator
  ) {}

  async execute(params: InsertEventToolParams): Promise<AgentToolResult> {
    try {
      // Extract user context from agent params
      const userId = params.userId;

      // Map agent params to DTO
      const dto: CreateEventDTO = {
        summary: params.summary,
        start: params.start,
        end: params.end,
        calendarId: params.calendarId,
        description: params.description,
        location: params.location,
      };

      // Validate
      const validationResult = this.eventValidator.validate(dto);
      if (!validationResult.success) {
        return {
          success: false,
          error: this.formatValidationErrors(validationResult.errors),
        };
      }

      // Execute service
      const event = await this.calendarService.createEvent(userId, dto);

      return {
        success: true,
        data: event,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to insert event: ${error.message}`,
      };
    }
  }

  private formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(e => `${e.field}: ${e.message}`).join(', ');
  }
}
```

## Refactoring Checklist

### General Principles
- [ ] Every class has a single, well-defined responsibility
- [ ] No function exceeds 30 lines (excluding type definitions)
- [ ] No file exceeds 200 lines
- [ ] All dependencies injected via constructors
- [ ] No direct imports of concrete implementations in domain/application layers
- [ ] All external I/O isolated in infrastructure layer

### Specific Refactorings

#### handle-events.ts
- [ ] Extract `CalendarService` class
- [ ] Extract `TokenManager` class
- [ ] Extract `EventRepository` interface + implementation
- [ ] Move auth logic to middleware
- [ ] Move response formatting to separate transformer
- [ ] Delete original god function

#### users-controller.ts
- [ ] Extract `AuthService` for OAuth operations
- [ ] Extract `UserRepository` for database operations
- [ ] Create middleware for client-type detection
- [ ] Thin down controller to orchestration only
- [ ] Add dependency injection

#### calendar-controller.ts
- [ ] Extract `CalendarService` class
- [ ] Extract `CalendarRepository` interface + implementation
- [ ] Remove direct Google API calls
- [ ] Remove direct database calls
- [ ] Thin down to HTTP concerns only

#### execution-tools.ts
- [ ] Separate validation from execution
- [ ] Use dependency injection for services
- [ ] Return Result types instead of throwing errors
- [ ] Map to DTOs explicitly

#### agent-utils.ts
- [ ] Split `formatEventData` into `EventValidator` + `EventTransformer`
- [ ] Return `ValidationResult` from validators
- [ ] Make transformers pure functions
- [ ] Remove error throwing from validation

#### init-calendar-with-user-tokens-and-update-tokens.ts
- [ ] Rename to `GoogleCalendarClientFactory`
- [ ] Extract `TokenRefreshService`
- [ ] Use event emitter pattern for token refresh callbacks
- [ ] Inject dependencies

## Testing Strategy

### Unit Tests (each layer independently)
```typescript
// __tests__/domain/entities/Event.test.ts
describe('Event', () => {
  it('should calculate duration correctly', () => {
    const event = new Event(
      '123',
      'Meeting',
      EventDateTime.fromDateTime(new Date('2025-01-01T10:00:00Z'), 'UTC'),
      EventDateTime.fromDateTime(new Date('2025-01-01T11:00:00Z'), 'UTC'),
      'primary'
    );

    expect(event.duration.inMinutes()).toBe(60);
  });
});

// __tests__/application/services/CalendarService.test.ts
describe('CalendarService', () => {
  let service: CalendarService;
  let mockEventRepo: jest.Mocked<IEventRepository>;
  let mockTokenManager: jest.Mocked<ITokenManager>;

  beforeEach(() => {
    mockEventRepo = createMockEventRepository();
    mockTokenManager = createMockTokenManager();
    service = new CalendarService(mockEventRepo, mockTokenManager);
  });

  it('should create event in default calendar when no calendarId provided', async () => {
    const dto: CreateEventDTO = { /* ... */ };

    await service.createEvent('user123', dto);

    expect(mockEventRepo.create).toHaveBeenCalledWith(
      'primary',
      expect.any(Event)
    );
  });
});
```

### Integration Tests (cross-layer)
```typescript
// __tests__/integration/calendar-flow.test.ts
describe('Calendar Event Creation Flow', () => {
  let app: Express;

  beforeAll(async () => {
    app = await createTestApp(); // With real DI container
  });

  it('should create event via HTTP endpoint', async () => {
    const response = await request(app)
      .post('/api/calendar/events')
      .set('Authorization', `Bearer ${testToken}`)
      .send({
        summary: 'Test Event',
        start: { dateTime: '2025-01-01T10:00:00Z', timeZone: 'UTC' },
        end: { dateTime: '2025-01-01T11:00:00Z', timeZone: 'UTC' },
      });

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('id');
  });
});
```

## Success Criteria

- [ ] No function longer than 30 lines (excluding types)
- [ ] No file longer than 200 lines
- [ ] All classes follow SRP (single responsibility)
- [ ] Clear architectural layers with no circular dependencies
- [ ] All dependencies injected (no global singletons accessed directly)
- [ ] 90%+ unit test coverage on domain and application layers
- [ ] 70%+ integration test coverage on infrastructure layer
- [ ] All existing functionality preserved (regression tests pass)
- [ ] Response times equal or better than before refactoring

## Migration Strategy

### Phase 1: Build Parallel Implementation
- Create new architecture alongside existing code
- Use feature flags to switch between old and new implementations
- No changes to existing files initially

### Phase 2: Gradual Migration
- Route 10% of traffic to new implementation
- Monitor for errors and performance
- Increase traffic gradually (10% → 25% → 50% → 100%)

### Phase 3: Deprecate Old Code
- Remove old implementation after 30 days of 100% new traffic
- Delete god functions and legacy utils
- Clean up dead code

## Files to Create

### Domain Layer
- `domain/entities/Event.ts`
- `domain/entities/Calendar.ts`
- `domain/entities/User.ts`
- `domain/value-objects/EventDateTime.ts`
- `domain/value-objects/Duration.ts`
- `domain/value-objects/TimeZone.ts`
- `domain/repositories/IEventRepository.ts`
- `domain/repositories/IUserRepository.ts`
- `domain/repositories/ICalendarRepository.ts`

### Application Layer
- `application/services/CalendarService.ts`
- `application/services/AuthService.ts`
- `application/services/TokenRefreshService.ts`
- `application/validators/EventValidator.ts`
- `application/validators/UserValidator.ts`
- `application/dto/CreateEventDTO.ts`
- `application/dto/UpdateEventDTO.ts`
- `application/dto/EventFilters.ts`

### Infrastructure Layer
- `infrastructure/repositories/SupabaseUserRepository.ts`
- `infrastructure/repositories/SupabaseCalendarRepository.ts`
- `infrastructure/repositories/GoogleEventRepository.ts`
- `infrastructure/google/GoogleCalendarClient.ts`
- `infrastructure/google/TokenManager.ts`
- `infrastructure/google/OAuth2Service.ts`
- `infrastructure/di/container.ts`
- `infrastructure/di/types.ts`

### Interface Layer (HTTP)
- `interfaces/http/controllers/EventController.ts`
- `interfaces/http/controllers/CalendarController.ts`
- `interfaces/http/controllers/AuthController.ts`
- `interfaces/http/middleware/authMiddleware.ts`
- `interfaces/http/middleware/clientDetectionMiddleware.ts`

### Tests
- `__tests__/domain/entities/Event.test.ts`
- `__tests__/application/services/CalendarService.test.ts`
- `__tests__/infrastructure/repositories/GoogleEventRepository.test.ts`
- `__tests__/integration/calendar-api.test.ts`

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Dependency Injection in TypeScript](https://github.com/inversify/InversifyJS)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
