# Database Architecture Agent

## Purpose
Redesign and optimize the database schema for the AI Google Calendar Assistant to ensure data integrity, proper relationships, efficient querying, and type safety.

## Current State Analysis

### Existing Schema Issues
1. **No explicit user table** - Relies on Supabase Auth `user_id` (UUID from auth.users)
2. **Excessive nullable fields** - Almost every field is `| null`, reducing type safety
3. **Missing cascade delete rules** - Risk of orphaned records if user deleted
4. **Email as primary lookup** - Should use `user_id` for consistency across tables
5. **No composite indexes** - Common queries like `(email, updated_at)` are inefficient
6. **Weak foreign key relationships** - Only one FK defined (`calendar_categories.email` → `user_calendar_tokens.email`)

### Current Tables

#### `user_calendar_tokens`
- **Purpose**: Stores Google OAuth tokens for each user
- **Primary Key**: `id` (auto-increment number)
- **Key Fields**: `user_id` (UUID), `email`, `access_token`, `refresh_token`, `expiry_date`
- **Issues**:
  - Email used as lookup key instead of user_id
  - All tokens stored as nullable strings (should be required)
  - No relationship to Supabase auth.users

#### `calendar_categories`
- **Purpose**: Tracks all calendars accessible to a user
- **Primary Key**: `id` (auto-increment number)
- **Key Fields**: `email`, `calendar_id`, `calendar_name`, `access_role`, `time_zone_of_calendar`
- **Foreign Key**: `email` references `user_calendar_tokens(email)`
- **Issues**:
  - Should reference user_id instead of email
  - Missing unique constraint on (email, calendar_id)
  - access_role should be enum type

#### `user_telegram_links`
- **Purpose**: Links Telegram users to email accounts
- **Primary Key**: `id` (auto-increment number)
- **Key Fields**: `email`, `chat_id`, `username`, `first_name`
- **Issues**:
  - No foreign key to user_calendar_tokens
  - Missing unique constraint on chat_id
  - Email can be null (should be required)

## Goals

### 1. Schema Normalization
- Establish `user_id` as the single source of truth for user identity
- Remove email-based lookups in favor of user_id foreign keys
- Reduce nullable fields to only truly optional data
- Add proper enum types for categorical fields (access_role, token_type, etc.)

### 2. Data Integrity
- Add foreign key constraints with CASCADE DELETE where appropriate
- Add CHECK constraints for data validation (e.g., expiry_date > created_at)
- Add unique constraints to prevent duplicate records
- Implement Row-Level Security (RLS) policies on all tables

### 3. Query Optimization
- Add composite indexes for common query patterns
- Add indexes on foreign key columns
- Consider materialized views for complex aggregations
- Add GIN indexes for JSONB fields if needed in future

### 4. Type Safety
- Define PostgreSQL enum types for categorical fields
- Make required fields NOT NULL
- Add domain types for common patterns (email, timezone)
- Ensure TypeScript type generation includes proper nullability

### 5. Audit Trail
- Add `created_by` and `updated_by` fields (user_id references)
- Ensure all tables have `created_at` (NOT NULL) and `updated_at` (nullable)
- Consider adding `deleted_at` for soft deletes if needed

## Proposed Schema Changes

### New/Modified Tables

#### `users` (new explicit table or view on auth.users)
```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own record" ON public.users
  FOR SELECT USING (auth.uid() = id);
```

#### `user_google_credentials` (renamed from user_calendar_tokens)
```sql
CREATE TYPE token_type_enum AS ENUM ('Bearer');

CREATE TABLE public.user_google_credentials (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  id_token TEXT,
  token_type token_type_enum NOT NULL DEFAULT 'Bearer',
  scope TEXT NOT NULL,
  expiry_date BIGINT NOT NULL, -- Unix timestamp
  refresh_token_expires_in BIGINT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id), -- One set of credentials per user
  CHECK (expiry_date > EXTRACT(EPOCH FROM created_at)),
  CHECK (refresh_token_expires_in IS NULL OR refresh_token_expires_in > expiry_date)
);

-- Indexes
CREATE INDEX idx_user_google_credentials_user_id ON public.user_google_credentials(user_id);
CREATE INDEX idx_user_google_credentials_expiry ON public.user_google_credentials(expiry_date) WHERE is_active = TRUE;

-- RLS Policies
ALTER TABLE public.user_google_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own credentials" ON public.user_google_credentials
  FOR ALL USING (auth.uid() = user_id);
```

#### `user_calendars` (renamed from calendar_categories)
```sql
CREATE TYPE calendar_access_role AS ENUM ('owner', 'writer', 'reader', 'freeBusyReader');

CREATE TABLE public.user_calendars (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  calendar_id TEXT NOT NULL, -- Google Calendar ID
  calendar_name TEXT NOT NULL,
  access_role calendar_access_role NOT NULL,
  time_zone TEXT NOT NULL, -- IANA timezone
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  UNIQUE(user_id, calendar_id), -- Prevent duplicate calendar entries
  CHECK (time_zone ~ '^[A-Z][a-zA-Z/_]+$') -- Basic IANA format validation
);

-- Indexes
CREATE INDEX idx_user_calendars_user_id ON public.user_calendars(user_id);
CREATE INDEX idx_user_calendars_calendar_id ON public.user_calendars(calendar_id);
CREATE INDEX idx_user_calendars_user_primary ON public.user_calendars(user_id, is_primary) WHERE is_primary = TRUE;

-- RLS Policies
ALTER TABLE public.user_calendars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own calendars" ON public.user_calendars
  FOR ALL USING (auth.uid() = user_id);
```

#### `user_telegram_accounts` (renamed from user_telegram_links)
```sql
CREATE TABLE public.user_telegram_accounts (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  chat_id BIGINT UNIQUE NOT NULL, -- Telegram chat ID must be unique
  username TEXT,
  first_name TEXT,
  language_code TEXT, -- ISO 639-1 language code
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ,
  last_interaction_at TIMESTAMPTZ,
  UNIQUE(user_id, chat_id), -- One chat per user
  CHECK (language_code IS NULL OR length(language_code) = 2)
);

-- Indexes
CREATE INDEX idx_user_telegram_chat_id ON public.user_telegram_accounts(chat_id);
CREATE INDEX idx_user_telegram_user_id ON public.user_telegram_accounts(user_id);

-- RLS Policies
ALTER TABLE public.user_telegram_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own telegram accounts" ON public.user_telegram_accounts
  FOR ALL USING (auth.uid() = user_id);
```

### Migration Strategy

#### Phase 1: Add New Schema
1. Create enum types
2. Create new tables alongside existing ones
3. Add triggers to sync data between old and new tables

#### Phase 2: Migrate Data
1. Populate new tables from existing tables
2. Validate data integrity
3. Update application code to use new table names (via feature flags)

#### Phase 3: Cutover
1. Switch application to use new schema
2. Monitor for issues
3. Keep old tables for 30 days as backup

#### Phase 4: Cleanup
1. Drop old tables
2. Remove sync triggers
3. Update Supabase type generation

### Views for Backward Compatibility

```sql
-- View to maintain existing query compatibility during migration
CREATE VIEW user_calendar_tokens AS
SELECT
  ugc.id,
  ugc.user_id,
  u.email,
  ugc.access_token,
  ugc.refresh_token,
  ugc.id_token,
  ugc.token_type::TEXT,
  ugc.scope,
  ugc.expiry_date,
  ugc.refresh_token_expires_in,
  ugc.is_active,
  ugc.created_at,
  ugc.updated_at
FROM user_google_credentials ugc
JOIN users u ON u.id = ugc.user_id;
```

## Implementation Tasks

### Task Breakdown

#### 1. Schema Design (1-2 days)
- [ ] Review current queries to understand access patterns
- [ ] Design enum types for categorical fields
- [ ] Design composite indexes for common queries
- [ ] Document all foreign key relationships
- [ ] Design RLS policies for each table

#### 2. Migration Scripts (2-3 days)
- [ ] Write SQL migration scripts for each table
- [ ] Create data migration scripts (old → new schema)
- [ ] Create rollback scripts for each migration
- [ ] Add data validation queries
- [ ] Test migrations on local copy of database

#### 3. Type Generation (1 day)
- [ ] Update Supabase type generation configuration
- [ ] Generate new TypeScript types
- [ ] Compare old vs new types for breaking changes
- [ ] Create type adapters if needed for backward compatibility

#### 4. Repository Updates (2-3 days)
- [ ] Update all Supabase queries to use user_id instead of email
- [ ] Update all queries to use new table names
- [ ] Add proper error handling for constraint violations
- [ ] Update tests to use new schema

#### 5. Validation & Testing (2 days)
- [ ] Run migration on staging database
- [ ] Validate all foreign key constraints
- [ ] Test RLS policies with different user roles
- [ ] Performance test common queries
- [ ] Validate type safety in TypeScript code

#### 6. Documentation (1 day)
- [ ] Document new schema in README
- [ ] Create ER diagram
- [ ] Document migration process
- [ ] Update API documentation if affected

## Success Criteria

- [ ] All foreign keys properly defined with CASCADE DELETE
- [ ] Zero nullable fields on required data (tokens, user_id, etc.)
- [ ] All tables have proper indexes for common queries
- [ ] RLS policies protect all user data
- [ ] TypeScript types correctly reflect database schema
- [ ] All existing functionality works with new schema
- [ ] Query performance equal or better than before
- [ ] No data loss during migration

## Files to Modify

### Core Files
- `database.types.ts` - Will be auto-regenerated
- `types.ts` - Add new domain types for business logic
- All files in `utils/` that query database
- All files in `controllers/` that access database

### New Files to Create
- `migrations/001_create_enum_types.sql`
- `migrations/002_create_users_table.sql`
- `migrations/003_create_user_google_credentials.sql`
- `migrations/004_create_user_calendars.sql`
- `migrations/005_create_user_telegram_accounts.sql`
- `migrations/006_create_indexes.sql`
- `migrations/007_create_rls_policies.sql`
- `migrations/008_migrate_data.sql`
- `migrations/009_create_compatibility_views.sql`
- `scripts/validate-migration.ts`
- `docs/database-schema.md`

## Testing Strategy

### Unit Tests
- Test type conversion functions (old schema → new schema)
- Test query builders with new schema
- Test constraint violation handling

### Integration Tests
- Test CRUD operations on each table
- Test foreign key cascades (delete user → all related data deleted)
- Test RLS policies with different auth contexts
- Test concurrent access and locking

### Performance Tests
- Benchmark common queries before and after migration
- Test query plan explains to validate index usage
- Load test with realistic data volumes

## Risks & Mitigations

### Risk: Data Loss During Migration
**Mitigation**:
- Full database backup before migration
- Dry-run migration on copy of production data
- Keep old tables for 30 days after cutover

### Risk: Breaking Changes to Application
**Mitigation**:
- Create compatibility views for old table names
- Use feature flags to gradually roll out changes
- Comprehensive test coverage before deployment

### Risk: Performance Regression
**Mitigation**:
- Benchmark before and after migration
- Test query plans with EXPLAIN ANALYZE
- Monitor production metrics after deployment

### Risk: RLS Policy Lockout
**Mitigation**:
- Test RLS policies with multiple user scenarios
- Have service role key ready to bypass RLS if needed
- Document RLS policy troubleshooting

## References

- [Supabase Database Design Patterns](https://supabase.com/docs/guides/database/design-patterns)
- [PostgreSQL Foreign Key Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [PostgreSQL Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase Type Generation](https://supabase.com/docs/guides/api/generating-types)
