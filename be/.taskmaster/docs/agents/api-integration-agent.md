# API Integration Agent

## Purpose
Abstract and centralize all external API integrations (Google Calendar, Supabase, Telegram, OpenAI) with proper error handling, retry logic, rate limiting, and monitoring for the AI Google Calendar Assistant.

## Current State Analysis

### Problem: Raw API Calls Scattered Throughout Codebase

Currently, external API calls happen directly in:
1. **Controllers** - Raw Google API calls (30%)
2. **Utils** - Mixed API calls (40%)
3. **Repositories** - Direct Supabase queries (20%)
4. **AI Agents** - OpenAI agent calls (10%)

**Issues**:
- No centralized error handling
- No retry logic for transient failures
- No rate limit management
- No request/response logging
- No timeout configuration
- Difficult to monitor API usage

### Examples of Current Anti-Patterns

#### Raw Google Calendar API Call:
```typescript
// utils/handle-events.ts
const calendar = await initCalendarWithUserTokensAndUpdateTokens(credentials);
const eventsList = await calendar.events.list({
  calendarId: calendarId ?? "primary",
  timeMin: timeMin ?? undefined,
  q: q ?? undefined,
});
return eventsList.data.items;
```

**Problems**:
- No error handling beyond try/catch
- No retry for 503 Service Unavailable
- No logging of request params
- No timeout handling
- Rate limit errors crash the application

#### Direct Supabase Call:
```typescript
// controllers/users-controller.ts
const { data, error } = await SUPABASE
  .from("user_calendar_tokens")
  .select("*")
  .eq("email", email)
  .maybeSingle();

if (error) {
  // Generic error handling
  return sendR(res, STATUS_RESPONSE.ERROR, "Database error");
}
```

**Problems**:
- No retry logic for connection failures
- Generic error messages
- No query performance monitoring
- No connection pooling management

## Goals

### 1. Establish API Client Layer
Create dedicated client classes for each external service that:
- Wrap raw API clients with error handling
- Implement retry logic with exponential backoff
- Handle rate limiting automatically
- Log all requests/responses for debugging
- Provide type-safe interfaces
- Abstract vendor-specific details

### 2. API Client Architecture
```
infrastructure/
├── clients/
│   ├── GoogleCalendarClient.ts      # Wraps google.calendar()
│   ├── SupabaseClient.ts            # Wraps @supabase/supabase-js
│   ├── TelegramClient.ts            # Wraps telegraf
│   └── OpenAIAgentClient.ts         # Wraps @openai/agents
├── errors/
│   ├── GoogleAPIError.ts
│   ├── DatabaseError.ts
│   └── RateLimitError.ts
└── middleware/
    ├── RetryMiddleware.ts
    ├── RateLimitMiddleware.ts
    └── LoggingMiddleware.ts
```

### 3. Client Characteristics
- **Type-safe** - Strong TypeScript types for all operations
- **Resilient** - Automatic retries, circuit breakers, timeouts
- **Observable** - Logging, metrics, tracing
- **Testable** - Easy to mock for testing
- **Configurable** - Environment-based configuration

## API Client Implementations

### Phase 1: Google Calendar Client

#### GoogleCalendarClient Wrapper
```typescript
// infrastructure/clients/GoogleCalendarClient.ts
import { google, type calendar_v3 } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/di/types';
import { RetryMiddleware } from '@/infrastructure/middleware/RetryMiddleware';
import { RateLimitMiddleware } from '@/infrastructure/middleware/RateLimitMiddleware';
import { GoogleAPIError, RateLimitError } from '@/infrastructure/errors';

export interface GoogleCalendarConfig {
  maxRetries: number;
  retryDelayMs: number;
  timeout: number;
  rateLimitPerSecond: number;
}

@injectable()
export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;
  private retryMiddleware: RetryMiddleware;
  private rateLimitMiddleware: RateLimitMiddleware;

  constructor(
    @inject(TYPES.OAuth2Client) private oauth2Client: OAuth2Client,
    @inject(TYPES.GoogleCalendarConfig) private config: GoogleCalendarConfig
  ) {
    this.calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    this.retryMiddleware = new RetryMiddleware(config.maxRetries, config.retryDelayMs);
    this.rateLimitMiddleware = new RateLimitMiddleware(config.rateLimitPerSecond);
  }

  async listEvents(
    calendarId: string,
    params: calendar_v3.Params$Resource$Events$List
  ): Promise<calendar_v3.Schema$Event[]> {
    return this.executeWithMiddleware(async () => {
      const response = await this.calendar.events.list({
        calendarId,
        ...params,
      });

      return response.data.items ?? [];
    }, 'listEvents');
  }

  async getEvent(
    calendarId: string,
    eventId: string
  ): Promise<calendar_v3.Schema$Event | null> {
    return this.executeWithMiddleware(async () => {
      try {
        const response = await this.calendar.events.get({
          calendarId,
          eventId,
        });
        return response.data;
      } catch (error: any) {
        if (error.code === 404) {
          return null;
        }
        throw error;
      }
    }, 'getEvent');
  }

  async insertEvent(
    calendarId: string,
    event: calendar_v3.Schema$Event
  ): Promise<calendar_v3.Schema$Event> {
    return this.executeWithMiddleware(async () => {
      const response = await this.calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      return response.data;
    }, 'insertEvent');
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<calendar_v3.Schema$Event>
  ): Promise<calendar_v3.Schema$Event> {
    return this.executeWithMiddleware(async () => {
      const response = await this.calendar.events.patch({
        calendarId,
        eventId,
        requestBody: event,
      });

      return response.data;
    }, 'updateEvent');
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    return this.executeWithMiddleware(async () => {
      await this.calendar.events.delete({
        calendarId,
        eventId,
      });
    }, 'deleteEvent');
  }

  async listCalendars(): Promise<calendar_v3.Schema$CalendarListEntry[]> {
    return this.executeWithMiddleware(async () => {
      const response = await this.calendar.calendarList.list({
        showHidden: false,
      });

      return response.data.items ?? [];
    }, 'listCalendars');
  }

  // --- Private helper methods ---

  private async executeWithMiddleware<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      // Rate limiting
      await this.rateLimitMiddleware.waitIfNeeded();

      // Retry with exponential backoff
      const result = await this.retryMiddleware.execute(
        operation,
        this.isRetryableError
      );

      // Log success
      this.logSuccess(operationName, Date.now() - startTime);

      return result;
    } catch (error: any) {
      // Log error
      this.logError(operationName, error, Date.now() - startTime);

      // Transform to domain error
      throw this.transformError(error);
    }
  }

  private isRetryableError(error: any): boolean {
    // Retry on rate limit, service unavailable, timeout
    if (error.code === 429) return true; // Rate limit
    if (error.code === 503) return true; // Service unavailable
    if (error.code === 500) return true; // Internal server error
    if (error.code === 'ETIMEDOUT') return true; // Timeout
    if (error.code === 'ECONNRESET') return true; // Connection reset
    return false;
  }

  private transformError(error: any): Error {
    if (error.code === 429) {
      return new RateLimitError(
        'Google Calendar API rate limit exceeded',
        error.errors?.[0]?.message
      );
    }

    return new GoogleAPIError(
      error.message ?? 'Unknown Google Calendar API error',
      error.code,
      error
    );
  }

  private logSuccess(operation: string, durationMs: number): void {
    console.log(`[GoogleCalendar] ${operation} succeeded in ${durationMs}ms`);
  }

  private logError(operation: string, error: any, durationMs: number): void {
    console.error(`[GoogleCalendar] ${operation} failed after ${durationMs}ms`, {
      error: error.message,
      code: error.code,
    });
  }
}
```

#### Retry Middleware
```typescript
// infrastructure/middleware/RetryMiddleware.ts
export class RetryMiddleware {
  constructor(
    private readonly maxRetries: number = 3,
    private readonly baseDelayMs: number = 1000
  ) {}

  async execute<T>(
    operation: () => Promise<T>,
    isRetryable: (error: any) => boolean
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;

        if (!isRetryable(error) || attempt === this.maxRetries) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        console.warn(`Retry attempt ${attempt + 1}/${this.maxRetries} after ${delay}ms`);
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number): number {
    // Exponential backoff with jitter
    const exponentialDelay = this.baseDelayMs * Math.pow(2, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // ±30% jitter
    return Math.min(exponentialDelay + jitter, 30000); // Cap at 30 seconds
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

#### Rate Limit Middleware
```typescript
// infrastructure/middleware/RateLimitMiddleware.ts
export class RateLimitMiddleware {
  private queue: number[] = [];
  private readonly windowMs: number;

  constructor(private readonly maxRequestsPerSecond: number) {
    this.windowMs = 1000; // 1 second window
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();

    // Remove timestamps outside the window
    this.queue = this.queue.filter(timestamp => now - timestamp < this.windowMs);

    // If at limit, wait until oldest request expires
    if (this.queue.length >= this.maxRequestsPerSecond) {
      const oldestRequest = this.queue[0];
      const waitTime = this.windowMs - (now - oldestRequest) + 10; // +10ms buffer
      await this.sleep(waitTime);
    }

    // Add current request timestamp
    this.queue.push(Date.now());
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Phase 2: Supabase Client Wrapper

#### Enhanced Supabase Client
```typescript
// infrastructure/clients/SupabaseClient.ts
import { createClient, type SupabaseClient as SupabaseClientType } from '@supabase/supabase-js';
import { injectable, inject } from 'inversify';
import { TYPES } from '@/infrastructure/di/types';
import { DatabaseError, ConnectionError } from '@/infrastructure/errors';
import type { Database } from '@/database.types';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  maxRetries: number;
  timeout: number;
}

@injectable()
export class EnhancedSupabaseClient {
  private client: SupabaseClientType<Database>;

  constructor(@inject(TYPES.SupabaseConfig) private config: SupabaseConfig) {
    this.client = createClient<Database>(config.url, config.anonKey, {
      auth: {
        persistSession: false,
      },
      global: {
        headers: { 'x-application-name': 'ai-calendar-assistant' },
      },
    });
  }

  async select<T = any>(
    table: string,
    columns: string = '*'
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      const { data, error } = await this.client
        .from(table)
        .select(columns);

      if (error) {
        throw new DatabaseError(`Failed to select from ${table}`, error);
      }

      return data as T[];
    }, `SELECT ${columns} FROM ${table}`);
  }

  async insert<T = any>(
    table: string,
    values: Partial<T>
  ): Promise<T> {
    return this.executeQuery(async () => {
      const { data, error } = await this.client
        .from(table)
        .insert(values)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to insert into ${table}`, error);
      }

      return data as T;
    }, `INSERT INTO ${table}`);
  }

  async update<T = any>(
    table: string,
    values: Partial<T>,
    filter: { column: string; value: any }
  ): Promise<T> {
    return this.executeQuery(async () => {
      const { data, error } = await this.client
        .from(table)
        .update(values)
        .eq(filter.column, filter.value)
        .select()
        .single();

      if (error) {
        throw new DatabaseError(`Failed to update ${table}`, error);
      }

      return data as T;
    }, `UPDATE ${table} WHERE ${filter.column} = ${filter.value}`);
  }

  async delete(
    table: string,
    filter: { column: string; value: any }
  ): Promise<void> {
    return this.executeQuery(async () => {
      const { error } = await this.client
        .from(table)
        .delete()
        .eq(filter.column, filter.value);

      if (error) {
        throw new DatabaseError(`Failed to delete from ${table}`, error);
      }
    }, `DELETE FROM ${table} WHERE ${filter.column} = ${filter.value}`);
  }

  // --- Private helper methods ---

  private async executeQuery<T>(
    operation: () => Promise<T>,
    queryDescription: string
  ): Promise<T> {
    const startTime = Date.now();

    try {
      const result = await this.withTimeout(operation(), this.config.timeout);
      this.logQuerySuccess(queryDescription, Date.now() - startTime);
      return result;
    } catch (error: any) {
      this.logQueryError(queryDescription, error, Date.now() - startTime);
      throw this.transformError(error);
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout')), timeoutMs)
    );

    return Promise.race([promise, timeoutPromise]);
  }

  private transformError(error: any): Error {
    if (error.message?.includes('timeout')) {
      return new ConnectionError('Database query timeout', error);
    }

    if (error.code === 'PGRST116') {
      return new DatabaseError('Row not found', error);
    }

    return new DatabaseError(error.message ?? 'Database operation failed', error);
  }

  private logQuerySuccess(query: string, durationMs: number): void {
    if (durationMs > 1000) {
      console.warn(`[Supabase] Slow query (${durationMs}ms): ${query}`);
    } else {
      console.log(`[Supabase] ${query} (${durationMs}ms)`);
    }
  }

  private logQueryError(query: string, error: any, durationMs: number): void {
    console.error(`[Supabase] Query failed after ${durationMs}ms: ${query}`, {
      error: error.message,
      code: error.code,
    });
  }

  // Expose raw client for complex queries
  get raw(): SupabaseClientType<Database> {
    return this.client;
  }
}
```

### Phase 3: Custom Error Classes

#### Google API Errors
```typescript
// infrastructure/errors/GoogleAPIError.ts
export class GoogleAPIError extends Error {
  constructor(
    message: string,
    public readonly code?: number,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'GoogleAPIError';
  }
}

export class RateLimitError extends GoogleAPIError {
  constructor(message: string, public readonly retryAfter?: string) {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class CalendarNotFoundError extends GoogleAPIError {
  constructor(calendarId: string) {
    super(`Calendar not found: ${calendarId}`, 404);
    this.name = 'CalendarNotFoundError';
  }
}
```

#### Database Errors
```typescript
// infrastructure/errors/DatabaseError.ts
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: any) {
    super(message, originalError);
    this.name = 'ConnectionError';
  }
}

export class QueryTimeoutError extends DatabaseError {
  constructor(query: string, timeoutMs: number) {
    super(`Query timeout after ${timeoutMs}ms: ${query}`);
    this.name = 'QueryTimeoutError';
  }
}
```

## Configuration Management

### Environment-Based Configuration
```typescript
// infrastructure/config/api-config.ts
export interface APIConfig {
  google: {
    maxRetries: number;
    retryDelayMs: number;
    timeout: number;
    rateLimitPerSecond: number;
  };
  supabase: {
    url: string;
    anonKey: string;
    maxRetries: number;
    timeout: number;
  };
  telegram: {
    botToken: string;
    webhookUrl?: string;
    timeout: number;
  };
}

export const loadAPIConfig = (): APIConfig => ({
  google: {
    maxRetries: parseInt(process.env.GOOGLE_MAX_RETRIES ?? '3'),
    retryDelayMs: parseInt(process.env.GOOGLE_RETRY_DELAY_MS ?? '1000'),
    timeout: parseInt(process.env.GOOGLE_TIMEOUT_MS ?? '30000'),
    rateLimitPerSecond: parseInt(process.env.GOOGLE_RATE_LIMIT ?? '10'),
  },
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    maxRetries: parseInt(process.env.SUPABASE_MAX_RETRIES ?? '3'),
    timeout: parseInt(process.env.SUPABASE_TIMEOUT_MS ?? '10000'),
  },
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN!,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL,
    timeout: parseInt(process.env.TELEGRAM_TIMEOUT_MS ?? '5000'),
  },
});
```

## Monitoring & Observability

### Request/Response Logging
```typescript
// infrastructure/middleware/LoggingMiddleware.ts
export interface RequestLog {
  operation: string;
  timestamp: string;
  durationMs: number;
  success: boolean;
  error?: string;
}

export class LoggingMiddleware {
  private logs: RequestLog[] = [];

  logRequest(operation: string, durationMs: number, success: boolean, error?: any): void {
    const log: RequestLog = {
      operation,
      timestamp: new Date().toISOString(),
      durationMs,
      success,
      error: error?.message,
    };

    this.logs.push(log);

    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs.shift();
    }

    // Log to console
    if (success) {
      console.log(`[API] ${operation} succeeded in ${durationMs}ms`);
    } else {
      console.error(`[API] ${operation} failed in ${durationMs}ms:`, error?.message);
    }
  }

  getRecentLogs(limit: number = 100): RequestLog[] {
    return this.logs.slice(-limit);
  }

  getErrorRate(windowMinutes: number = 5): number {
    const cutoff = Date.now() - windowMinutes * 60 * 1000;
    const recentLogs = this.logs.filter(
      log => new Date(log.timestamp).getTime() > cutoff
    );

    if (recentLogs.length === 0) return 0;

    const errors = recentLogs.filter(log => !log.success).length;
    return (errors / recentLogs.length) * 100;
  }
}
```

## Testing API Clients

### Unit Tests with Mocks
```typescript
// __tests__/infrastructure/clients/GoogleCalendarClient.test.ts
describe('GoogleCalendarClient', () => {
  let client: GoogleCalendarClient;
  let mockCalendar: jest.Mocked<calendar_v3.Calendar>;

  beforeEach(() => {
    mockCalendar = {
      events: {
        list: jest.fn(),
        get: jest.fn(),
        insert: jest.fn(),
      },
    } as any;

    const config = {
      maxRetries: 3,
      retryDelayMs: 100,
      timeout: 5000,
      rateLimitPerSecond: 10,
    };

    client = new GoogleCalendarClient(mockOAuth2Client, config);
    (client as any).calendar = mockCalendar;
  });

  it('should retry on 503 error', async () => {
    mockCalendar.events.list
      .mockRejectedValueOnce({ code: 503 }) // First attempt fails
      .mockResolvedValueOnce({ data: { items: [] } }); // Second attempt succeeds

    const result = await client.listEvents('primary', {});

    expect(mockCalendar.events.list).toHaveBeenCalledTimes(2);
    expect(result).toEqual([]);
  });

  it('should throw RateLimitError on 429', async () => {
    mockCalendar.events.list.mockRejectedValue({ code: 429 });

    await expect(client.listEvents('primary', {})).rejects.toThrow(RateLimitError);
  });
});
```

## Success Criteria

- [ ] All external API calls wrapped in client classes
- [ ] Retry logic implemented with exponential backoff
- [ ] Rate limiting prevents API quota exhaustion
- [ ] All API errors have custom error classes
- [ ] Request/response logging for debugging
- [ ] Timeout configuration for all operations
- [ ] 85%+ unit test coverage on clients
- [ ] No raw API calls outside client layer
- [ ] API performance metrics collected

## Files to Create

### Clients
- `infrastructure/clients/GoogleCalendarClient.ts`
- `infrastructure/clients/EnhancedSupabaseClient.ts`
- `infrastructure/clients/TelegramClient.ts`

### Middleware
- `infrastructure/middleware/RetryMiddleware.ts`
- `infrastructure/middleware/RateLimitMiddleware.ts`
- `infrastructure/middleware/LoggingMiddleware.ts`

### Errors
- `infrastructure/errors/GoogleAPIError.ts`
- `infrastructure/errors/DatabaseError.ts`
- `infrastructure/errors/TelegramError.ts`

### Configuration
- `infrastructure/config/api-config.ts`

### Tests
- `__tests__/infrastructure/clients/GoogleCalendarClient.test.ts`
- `__tests__/infrastructure/clients/EnhancedSupabaseClient.test.ts`
- `__tests__/infrastructure/middleware/RetryMiddleware.test.ts`

## References

- [Google Calendar API - Errors](https://developers.google.com/calendar/api/guides/errors)
- [Exponential Backoff](https://cloud.google.com/iot/docs/how-tos/exponential-backoff)
- [Rate Limiting Strategies](https://stripe.com/blog/rate-limiters)
- [Supabase Best Practices](https://supabase.com/docs/guides/database/performance)
