# Database Migrations

This directory contains SQL migrations for the AI Google Calendar Assistant database schema redesign.

## Migration Overview

These migrations redesign the database schema to improve data integrity and implement proper relationships:

1. **20250119000001_create_users_table.sql** - Creates the central `users` table with `user_id` as the primary key
2. **20250119000002_redesign_user_calendar_tokens.sql** - Updates `user_calendar_tokens` to reference `users.user_id`
3. **20250119000003_redesign_calendar_categories.sql** - Updates `calendar_categories` to reference `users.user_id`
4. **20250119000004_redesign_user_telegram_links.sql** - Adds `user_id` foreign key to `user_telegram_links`
5. **20250119000005_implement_rls_policies.sql** - Implements Row-Level Security policies for all tables

## Schema Changes

### New Tables
- **users**: Central user registry with UUID primary key
  - `user_id` (UUID, PK)
  - `email` (TEXT, UNIQUE, NOT NULL)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
  - `is_active` (BOOLEAN)
  - `metadata` (JSONB)

### Modified Tables

#### user_calendar_tokens (formerly user_google_credentials)
- Changed `user_id` from TEXT to UUID foreign key → `users.user_id`
- Added CASCADE delete when user is deleted
- Added index on `user_id` for performance

#### calendar_categories (formerly calendar_metadata)
- Changed `user_id` from nullable TEXT to NOT NULL UUID foreign key → `users.user_id`
- Removed foreign key to `user_calendar_tokens.email`
- Added CASCADE delete when user is deleted
- Added index on `user_id` for performance

#### user_telegram_links
- Added `user_id` (UUID, nullable) foreign key → `users.user_id`
- Added CASCADE delete when user is deleted
- Added indexes on `user_id` and `email`

## Row-Level Security (RLS)

All tables now have RLS enabled with the following policies:

- **Authenticated users** can only access their own data (based on `auth.uid()`)
- **Service role** has full access for backend operations
- Policies cover SELECT, INSERT, UPDATE, and DELETE operations

## Applying Migrations

### Using Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd path/to/ai-google-calendar-assistant

# Link to your Supabase project (if not already linked)
npx supabase link --project-ref your-project-ref

# Apply all migrations
npx supabase db push

# Or apply migrations one at a time
npx supabase db push --file supabase/migrations/20250119000001_create_users_table.sql
```

### Using Direct SQL (Development Only)

If you're using a local Supabase instance:

```bash
# Start local Supabase
npx supabase start

# Apply migrations using psql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000001_create_users_table.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000002_redesign_user_calendar_tokens.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000003_redesign_calendar_categories.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000004_redesign_user_telegram_links.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000005_implement_rls_policies.sql
```

### Using Supabase Dashboard

1. Log in to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to your project
3. Go to **SQL Editor**
4. Copy and paste each migration file content in order
5. Execute each migration

## Testing Migrations

### Local Testing (Recommended)

```bash
# Reset local database and apply migrations
npx supabase db reset

# Verify schema changes
npx supabase db diff

# Generate TypeScript types
npx supabase gen types typescript --local > database.types.ts
```

### Verify Data Integrity

After applying migrations, verify:

```sql
-- Check users table
SELECT COUNT(*) FROM public.users;

-- Verify foreign key relationships
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public';

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

## Rollback Plan

If you need to rollback these changes:

1. **Backup your data** before starting any rollback
2. Disable RLS on all tables
3. Drop foreign key constraints
4. Revert column type changes
5. Drop the `users` table

> ⚠️ **Warning**: Rolling back these migrations may result in data loss. Always backup your database first!

## Important Notes

### Data Migration

The migrations include data migration steps:

- Existing `user_id` values in `user_calendar_tokens` are automatically inserted into the new `users` table
- `calendar_categories` records are linked to users via email matching
- `user_telegram_links` records are linked to users where email matches (user_id nullable for backward compatibility)

### Service Role Access

The service role (used by your backend) can bypass RLS policies to perform administrative operations. Ensure your `SUPABASE_SERVICE_ROLE_KEY` is kept secure.

### Type Definitions

After applying migrations, regenerate TypeScript types:

```bash
npx supabase gen types typescript --local > database.types.ts
```

## Troubleshooting

### Migration Fails

If a migration fails:

1. Check the error message for specific table/column issues
2. Verify no data conflicts (e.g., duplicate emails)
3. Ensure all prerequisite migrations have been applied
4. Check that you have sufficient database permissions

### RLS Blocks Access

If you're getting permission denied errors after applying RLS:

1. Verify you're using the correct API key (`anon` key for client, `service_role` for backend)
2. Check that `auth.uid()` returns the expected user ID
3. Verify the user is authenticated
4. Test with the service role key to bypass RLS temporarily

## Support

For questions or issues:

1. Check the [Supabase Documentation](https://supabase.com/docs)
2. Review the [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
3. Open an issue in the project repository
