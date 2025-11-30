import type { Database } from "@/database.types";
import { jest } from "@jest/globals";

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
  expiry_date: Date.now() + 3600000,
  email: "test@example.com",
};

/**
 * Mock user calendar tokens (user_calendar_tokens table)
 */
export const mockUserCalendarToken: Database["public"]["Tables"]["user_calendar_tokens"]["Row"] = {
  id: 1,
  user_id: "test-user-id",
  email: "test@example.com",
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
  expiry_date: Date.now() + 3600000,
  id_token: "mock-id-token",
  is_active: true,
  refresh_token_expires_in: 7776000,
  scope: "https://www.googleapis.com/auth/calendar",
  token_type: "Bearer",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock calendar categories data (calendar_categories table) - DEPRECATED
 * @deprecated Use mockUserCalendar instead
 */
export const mockCalendarCategory: Database["public"]["Tables"]["calendar_categories"]["Row"] = {
  id: 1,
  user_id: "test-user-id",
  email: "test@example.com",
  calendar_id: "primary",
  calendar_name: "Primary Calendar",
  access_role: "owner",
  time_zone_of_calendar: "America/New_York",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock user calendar data (user_calendars table)
 */
export const mockUserCalendar: Database["public"]["Tables"]["user_calendars"]["Row"] = {
  id: 1,
  user_id: "test-user-id",
  calendar_id: "primary",
  calendar_name: "Primary Calendar",
  access_role: "owner",
  time_zone: "America/New_York",
  is_primary: true,
  default_reminders: null,
  description: null,
  location: null,
  background_color: null,
  foreground_color: null,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

/**
 * Mock telegram links data (user_telegram_links table)
 */
export const mockTelegramLink = {
  id: 1,
  email: "test@example.com",
  chat_id: "123456789",
  username: "testuser",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

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
export const createMockSupabaseError = (errorType: keyof ReturnType<typeof createMockSupabaseErrors>) => {
  const errors = createMockSupabaseErrors();
  return errors[errorType];
};

/**
 * In-memory data store for testing
 */
class InMemoryDataStore {
  private data: Map<string, any[]> = new Map();

  constructor() {
    // Initialize with default mock data
    this.data.set("user_calendar_tokens", [mockUserCalendarToken]);
    this.data.set("calendar_categories", [mockCalendarCategory]); // Keep for backward compatibility
    this.data.set("user_calendars", [mockUserCalendar]);
    this.data.set("user_telegram_links", [mockTelegramLink]);
  }

  reset() {
    this.data.clear();
    this.data.set("user_calendar_tokens", [mockUserCalendarToken]);
    this.data.set("calendar_categories", [mockCalendarCategory]); // Keep for backward compatibility
    this.data.set("user_calendars", [mockUserCalendar]);
    this.data.set("user_telegram_links", [mockTelegramLink]);
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

  update(tableName: string, updates: any, filter: (record: any) => boolean): any[] {
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

  select(tableName: string, columns: string = "*"): any[] {
    return this.getTable(tableName);
  }
}

/**
 * Create a mock query builder with chainable methods
 */
const createMockQueryBuilder = (tableName: string, dataStore: InMemoryDataStore) => {
  let currentData: any[] = dataStore.getTable(tableName);
  let selectColumns = "*";
  let filters: Array<(record: any) => boolean> = [];
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
      } catch (error: any) {
        return { data: null, error: createMockSupabaseError("uniqueViolation") };
      }
    }

    if (updateData) {
      const filterFn = (record: any) => {
        for (const filter of filters) {
          if (!filter(record)) return false;
        }
        return true;
      };
      const updated = dataStore.update(tableName, updateData, filterFn);
      return { data: updated, error: null };
    }

    if (isDeleteOperation) {
      const filterFn = (record: any) => {
        for (const filter of filters) {
          if (!filter(record)) return false;
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
    select: jest.fn((columns = "*") => {
      selectColumns = columns;
      return builder;
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
    not: jest.fn((column: string, operator: string, value: any) => {
      filters.push((record) => record[column] !== value);
      return builder;
    }),
    or: jest.fn((condition: string) => {
      return builder;
    }),
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
    then: jest.fn((resolve: any) => {
      return Promise.resolve(executeQuery()).then(resolve);
    }),
  };

  return builder;
};

/**
 * Create a mock Supabase client with full functionality
 */
export const createMockSupabaseClient = (dataStore?: InMemoryDataStore) => {
  const store = dataStore || new InMemoryDataStore();

  const mockAuth = {
    getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null }),
    signInWithOAuth: jest.fn().mockResolvedValue({ data: { url: "https://mock-oauth-url.com" }, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    getSession: jest.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }),
    refreshSession: jest.fn().mockResolvedValue({
      data: { session: { user: mockUser, access_token: "new-token" } },
      error: null,
    }),
    setSession: jest.fn().mockResolvedValue({ data: { session: { user: mockUser } }, error: null }),
    onAuthStateChange: jest.fn(),
  };

  return {
    auth: mockAuth,
    from: jest.fn((tableName: string) => createMockQueryBuilder(tableName, store)),
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
export const resetMockDataStore = (client: ReturnType<typeof createMockSupabaseClient>) => {
  client.__dataStore.reset();
};
