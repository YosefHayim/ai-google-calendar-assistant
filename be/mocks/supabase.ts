import { jest } from "@jest/globals";
import type { Database } from "@/database.types";

/**
 * Mock Supabase user data
 */
export const mockUser = {
  id: "test-user-id",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock calendar token data
 */
export const mockTokenData = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  token_type: "Bearer",
  expiry_date: Date.now() + 3_600_000,
  email: "test@example.com",
};

/**
 * Mock user data (users table)
 */
export const mockUserRecord: Database["public"]["Tables"]["users"]["Row"] = {
  id: "test-user-id",
  email: "test@example.com",
  display_name: "Test User",
  first_name: "Test",
  last_name: "User",
  avatar_url: null,
  timezone: "America/New_York",
  locale: "en",
  status: "active",
  role: "user",
  email_verified: true,
  last_login_at: "2024-01-01T00:00:00Z",
  deactivated_at: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  preferences: {},
  ai_interactions_used: 0,
  credits_remaining: 0,
  usage_reset_at: null,
};

/**
 * Mock OAuth tokens (oauth_tokens table)
 */
export const mockOAuthToken: Database["public"]["Tables"]["oauth_tokens"]["Row"] =
  {
    id: "test-oauth-id",
    user_id: "test-user-id",
    provider: "google",
    provider_user_id: "google-user-id",
    access_token: "mock-access-token",
    refresh_token: "mock-refresh-token",
    token_type: "Bearer",
    id_token: "mock-id-token",
    scope: "https://www.googleapis.com/auth/calendar",
    expires_at: new Date(Date.now() + 3_600_000).toISOString(),
    refresh_token_expires_at: null,
    is_valid: true,
    last_refreshed_at: "2024-01-01T00:00:00Z",
    refresh_error_count: 0,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

/**
 * Mock user calendar data (user_calendars table)
 */
export const mockUserCalendar: Database["public"]["Tables"]["user_calendars"]["Row"] =
  {
    id: "test-calendar-id",
    user_id: "test-user-id",
    calendar_id: "primary",
    calendar_name: "Primary Calendar",
    access_role: "owner",
    timezone: "America/New_York",
    is_primary: true,
    is_visible: true,
    notification_enabled: true,
    default_reminders: null,
    background_color: null,
    foreground_color: null,
    sync_token: null,
    last_synced_at: null,
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

/**
 * Mock telegram user data (telegram_users table)
 */
export const mockTelegramUser: Database["public"]["Tables"]["telegram_users"]["Row"] =
  {
    id: "test-telegram-id",
    user_id: "test-user-id",
    telegram_user_id: 123_456_789,
    telegram_chat_id: 123_456_789,
    telegram_username: "testuser",
    first_name: "Test",
    language_code: "en",
    is_bot: false,
    is_linked: true,
    pending_email: null,
    last_activity_at: "2024-01-01T00:00:00Z",
    created_at: "2024-01-01T00:00:00Z",
    updated_at: "2024-01-01T00:00:00Z",
  };

// Legacy alias for backwards compatibility
export const mockTelegramLink = mockTelegramUser;

/**
 * Supabase error types
 */
export const createMockSupabaseErrors = () => ({
  notFound: {
    message: "No rows found",
    details: "The result contains 0 rows",
    hint: null,
    code: "PGRST116",
  },
  uniqueViolation: {
    message: "duplicate key value violates unique constraint",
    details: "Key (email)=(test@example.com) already exists.",
    hint: null,
    code: "23505",
  },
  foreignKeyViolation: {
    message: "insert or update on table violates foreign key constraint",
    details: 'Key (user_id)=(invalid-id) is not present in table "users".',
    hint: null,
    code: "23503",
  },
  checkViolation: {
    message: "new row violates check constraint",
    details: "Failing row contains invalid data",
    hint: null,
    code: "23514",
  },
  connectionError: {
    message: "Failed to connect to database",
    details: "Network error or database unavailable",
    hint: "Check your connection",
    code: "CONNECTION_ERROR",
  },
  permissionDenied: {
    message: "permission denied for table",
    details: "Row-Level Security policy violation",
    hint: null,
    code: "42501",
  },
  invalidInput: {
    message: "invalid input syntax",
    details: "Invalid data type or format",
    hint: null,
    code: "22P02",
  },
});

/**
 * Create a Supabase error object
 */
export const createMockSupabaseError = (
  errorType: keyof ReturnType<typeof createMockSupabaseErrors>
) => {
  const errors = createMockSupabaseErrors();
  return errors[errorType];
};

/**
 * In-memory data store for testing
 */
class InMemoryDataStore {
  private readonly data: Map<string, any[]> = new Map();

  constructor() {
    // Initialize with default mock data (new schema)
    this.data.set("users", [mockUserRecord]);
    this.data.set("oauth_tokens", [mockOAuthToken]);
    this.data.set("user_calendars", [mockUserCalendar]);
    this.data.set("telegram_users", [mockTelegramUser]);
  }

  reset() {
    this.data.clear();
    this.data.set("users", [mockUserRecord]);
    this.data.set("oauth_tokens", [mockOAuthToken]);
    this.data.set("user_calendars", [mockUserCalendar]);
    this.data.set("telegram_users", [mockTelegramUser]);
  }

  getTable(tableName: string): any[] {
    if (!this.data.has(tableName)) {
      this.data.set(tableName, []);
    }
    return this.data.get(tableName) || [];
  }

  setTable(tableName: string, data: any[]) {
    this.data.set(tableName, data);
  }

  insert(tableName: string, record: any): any {
    const table = this.getTable(tableName);
    const newRecord = {
      ...record,
      id: record.id || table.length + 1,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString(),
    };
    table.push(newRecord);
    this.setTable(tableName, table);
    return newRecord;
  }

  update(
    tableName: string,
    updates: any,
    filter: (record: any) => boolean
  ): any[] {
    const table = this.getTable(tableName);
    const updatedRecords: any[] = [];

    const newTable = table.map((record) => {
      if (filter(record)) {
        const updated = {
          ...record,
          ...updates,
          updated_at: new Date().toISOString(),
        };
        updatedRecords.push(updated);
        return updated;
      }
      return record;
    });

    this.setTable(tableName, newTable);
    return updatedRecords;
  }

  delete(tableName: string, filter: (record: any) => boolean): any[] {
    const table = this.getTable(tableName);
    const deletedRecords: any[] = [];

    const newTable = table.filter((record) => {
      if (filter(record)) {
        deletedRecords.push(record);
        return false;
      }
      return true;
    });

    this.setTable(tableName, newTable);
    return deletedRecords;
  }

  select(tableName: string, _columns = "*"): any[] {
    return this.getTable(tableName);
  }
}

/**
 * Create a mock query builder with chainable methods
 */
const createMockQueryBuilder = (
  tableName: string,
  dataStore: InMemoryDataStore
) => {
  const currentData: any[] = dataStore.getTable(tableName);
  let _selectColumns = "*";
  const filters: Array<(record: any) => boolean> = [];
  let limitCount: number | null = null;
  let shouldReturnSingle = false;
  let updateData: any = null;
  let insertData: any = null;
  let isDeleteOperation = false;

  const applyFilters = (data: any[]) => {
    let result = data;
    for (const filter of filters) {
      result = result.filter(filter);
    }
    if (limitCount !== null) {
      result = result.slice(0, limitCount);
    }
    return result;
  };

  const executeQuery = () => {
    if (insertData) {
      try {
        const inserted = dataStore.insert(tableName, insertData);
        return { data: inserted, error: null };
      } catch (_error: any) {
        return {
          data: null,
          error: createMockSupabaseError("uniqueViolation"),
        };
      }
    }

    if (updateData) {
      const filterFn = (record: any) => {
        for (const filter of filters) {
          if (!filter(record)) {
            return false;
          }
        }
        return true;
      };
      const updated = dataStore.update(tableName, updateData, filterFn);
      return { data: updated, error: null };
    }

    if (isDeleteOperation) {
      const filterFn = (record: any) => {
        for (const filter of filters) {
          if (!filter(record)) {
            return false;
          }
        }
        return true;
      };
      const deleted = dataStore.delete(tableName, filterFn);
      return { data: deleted, error: null };
    }

    // Select operation
    const result = applyFilters(currentData);
    if (shouldReturnSingle) {
      if (result.length === 0) {
        return { data: null, error: createMockSupabaseError("notFound") };
      }
      return { data: result[0], error: null };
    }
    return { data: result, error: null };
  };

  const builder: any = {
    select: jest.fn((columns: string = "*") => {
      _selectColumns = columns
      return builder
    }),
    insert: jest.fn((data: any) => {
      insertData = data;
      return builder;
    }),
    update: jest.fn((data: any) => {
      updateData = data;
      return builder;
    }),
    delete: jest.fn(() => {
      isDeleteOperation = true;
      return builder;
    }),
    eq: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] === value);
      return builder;
    }),
    neq: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] !== value);
      return builder;
    }),
    gt: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] > value);
      return builder;
    }),
    gte: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] >= value);
      return builder;
    }),
    lt: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] < value);
      return builder;
    }),
    lte: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] <= value);
      return builder;
    }),
    like: jest.fn((column: string, pattern: string) => {
      const regex = new RegExp(pattern.replace(/%/g, ".*"), "i");
      filters.push((record) => regex.test(record[column]));
      return builder;
    }),
    ilike: jest.fn((column: string, pattern: string) => {
      const regex = new RegExp(pattern.replace(/%/g, ".*"), "i");
      filters.push((record) => regex.test(record[column]));
      return builder;
    }),
    in: jest.fn((column: string, values: any[]) => {
      filters.push((record) => values.includes(record[column]));
      return builder;
    }),
    is: jest.fn((column: string, value: any) => {
      filters.push((record) => record[column] === value);
      return builder;
    }),
    not: jest.fn((column: string, _operator: string, value: any) => {
      filters.push((record) => record[column] !== value);
      return builder;
    }),
    or: jest.fn((_condition: string) => builder),
    limit: jest.fn((count: number) => {
      limitCount = count;
      return builder;
    }),
    single: jest.fn(() => {
      shouldReturnSingle = true;
      return executeQuery();
    }),
    maybeSingle: jest.fn(() => {
      shouldReturnSingle = true;
      const result = executeQuery();
      if (result.error?.code === "PGRST116") {
        return { data: null, error: null };
      }
      return result;
    }),
    then: jest.fn((resolve: any) =>
      Promise.resolve(executeQuery()).then(resolve)
    ),
  };

  return builder;
};

/**
 * Create a mock Supabase client with full functionality
 */
export const createMockSupabaseClient = (dataStore?: InMemoryDataStore) => {
  const store = dataStore || new InMemoryDataStore();

  const mockAuth = {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: mockUser }, error: null })
    ),
    signInWithOAuth: jest.fn(() =>
      Promise.resolve({
        data: { url: "https://mock-oauth-url.com" },
        error: null,
      })
    ),
    signOut: jest.fn(() => Promise.resolve({ error: null })),
    getSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: mockUser } }, error: null })
    ),
    refreshSession: jest.fn(() =>
      Promise.resolve({
        data: { session: { user: mockUser, access_token: "new-token" } },
        error: null,
      })
    ),
    setSession: jest.fn(() =>
      Promise.resolve({ data: { session: { user: mockUser } }, error: null })
    ),
    onAuthStateChange: jest.fn(),
  };

  return {
    auth: mockAuth,
    from: jest.fn((tableName: string) =>
      createMockQueryBuilder(tableName, store)
    ),
    rpc: jest.fn(),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        list: jest.fn(),
        getPublicUrl: jest.fn(),
      })),
    },
    // Expose data store for testing
    __dataStore: store,
  };
};

/**
 * Helper to reset mock data store
 */
export const resetMockDataStore = (
  client: ReturnType<typeof createMockSupabaseClient>
) => {
  client.__dataStore.reset();
};
