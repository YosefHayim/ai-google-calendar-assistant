# Database Migration Testing Guide

This guide walks you through testing the database schema migrations in a safe, local environment.

## Prerequisites

Before testing migrations, ensure you have:

1. **Node.js** (v18 or higher)
2. **Docker Desktop** (running)
3. **Supabase CLI** installed globally
   ```bash
   npm install -g supabase
   ```
4. **PostgreSQL client tools** (optional, for manual testing)

## Testing Workflow

### Step 1: Start Local Supabase

```bash
# Navigate to project root
cd path/to/ai-google-calendar-assistant

# Start local Supabase instance
npx supabase start
```

This will:
- Start Docker containers for PostgreSQL, Studio, Auth, etc.
- Display connection details including database URL
- Make Studio available at `http://localhost:54323`

**Expected Output:**
```
Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: [long key string]
service_role key: [long key string]
```

### Step 2: Create Test Data (Optional)

Before applying migrations, you may want to create some test data to verify data migration:

```bash
# Connect to local database
psql postgresql://postgres:postgres@localhost:54322/postgres
```

```sql
-- Create some test records in existing tables
INSERT INTO public.user_calendar_tokens (user_id, email, access_token)
VALUES
  ('test-user-1', 'user1@example.com', 'test_token_1'),
  ('test-user-2', 'user2@example.com', 'test_token_2');

INSERT INTO public.calendar_categories (user_id, email, calendar_name)
VALUES
  ('test-user-1', 'user1@example.com', 'Primary Calendar'),
  ('test-user-2', 'user2@example.com', 'Work Calendar');

-- Verify data was inserted
SELECT * FROM public.user_calendar_tokens;
SELECT * FROM public.calendar_categories;

-- Exit psql
\q
```

### Step 3: Apply Migrations

#### Option A: Using the Helper Script (Recommended)

```bash
# Make script executable (Unix/Mac/Git Bash)
chmod +x scripts/apply-migrations.sh

# Run the migration script
./scripts/apply-migrations.sh --local
```

#### Option B: Manual Application

```bash
# Apply migrations one by one
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000001_create_users_table.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000002_redesign_user_calendar_tokens.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000003_redesign_calendar_categories.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000004_redesign_user_telegram_links.sql
psql postgresql://postgres:postgres@localhost:54322/postgres -f supabase/migrations/20250119000005_implement_rls_policies.sql
```

#### Option C: Using Supabase CLI

```bash
# Reset database and apply all migrations
npx supabase db reset
```

### Step 4: Validate Migrations

#### Automated Testing

```bash
# Make test script executable
chmod +x scripts/test-migrations.sh

# Run validation tests
./scripts/test-migrations.sh --local
```

The test script will verify:
- ✅ All tables exist with correct structure
- ✅ Foreign key constraints are properly configured
- ✅ Indexes are created
- ✅ RLS policies are enabled and configured
- ✅ Triggers are in place
- ✅ No orphaned records exist

**Expected Output:**
```
=== Database Migration Validation ===
Environment: local

=== Table Structure Tests ===

Testing: users table exists... ✓ PASS
Testing: users table has user_id column... ✓ PASS
Testing: users table has email column (unique)... ✓ PASS

=== Foreign Key Tests ===

Testing: user_calendar_tokens → users FK... ✓ PASS
Testing: calendar_categories → users FK... ✓ PASS
Testing: user_telegram_links → users FK... ✓ PASS

[... more tests ...]

=== Summary ===

Total Tests: 22
Passed: 22
Failed: 0

✓ All tests passed! Migrations applied successfully.
```

#### Manual Verification

##### 1. Check Tables

```sql
-- List all tables
\dt public.*

-- Describe users table
\d public.users

-- Check foreign key relationships
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
    AND tc.table_schema = 'public'
ORDER BY tc.table_name;
```

##### 2. Verify RLS Policies

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

##### 3. Test RLS Enforcement

```sql
-- Enable RLS check by impersonating a user
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims.sub TO 'test-user-1';

-- Should only return records for test-user-1
SELECT * FROM public.users;
SELECT * FROM public.user_calendar_tokens;
SELECT * FROM public.calendar_categories;

-- Reset role
RESET ROLE;
```

##### 4. Check Data Integrity

```sql
-- Verify all calendar_categories have valid user_id
SELECT COUNT(*) AS orphaned_categories
FROM public.calendar_categories cc
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.user_id = cc.user_id
);

-- Verify all user_calendar_tokens have valid user_id
SELECT COUNT(*) AS orphaned_tokens
FROM public.user_calendar_tokens uct
WHERE NOT EXISTS (
    SELECT 1 FROM public.users u WHERE u.user_id = uct.user_id
);

-- Both should return 0
```

### Step 5: Generate TypeScript Types

After migrations are successfully applied:

```bash
# Generate updated TypeScript types
npx supabase gen types typescript --local > database.types.ts

# Verify the types file
cat database.types.ts | grep -A 10 "export type Database"
```

### Step 6: Test in Supabase Studio

1. Open Supabase Studio: `http://localhost:54323`
2. Navigate to **Table Editor**
3. Verify all tables are visible:
   - `users`
   - `user_calendar_tokens`
   - `calendar_categories`
   - `user_telegram_links`
4. Check the **Database** → **Policies** section to verify RLS policies
5. Try inserting test data through the UI to verify constraints

## Rollback Testing

To test the rollback process:

```bash
# Make rollback script executable
chmod +x scripts/rollback-migrations.sh

# Run rollback (WARNING: This will revert changes)
./scripts/rollback-migrations.sh --local
```

**Important:** Rollback will:
- Create a backup before proceeding
- Drop all RLS policies
- Remove foreign key constraints
- Revert schema changes
- Drop the users table

After rollback, you can re-apply migrations to test the full cycle.

## Performance Testing

### Test Query Performance

```sql
-- Explain query plans to verify index usage
EXPLAIN ANALYZE
SELECT * FROM public.user_calendar_tokens
WHERE user_id = 'test-user-uuid';

EXPLAIN ANALYZE
SELECT * FROM public.calendar_categories
WHERE user_id = 'test-user-uuid';

-- Should show "Index Scan" using the created indexes
```

### Test RLS Performance

```sql
-- Measure RLS policy overhead
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM public.calendar_categories
WHERE user_id = auth.uid();
```

## Integration Testing

After schema migrations, test the application:

1. **API Endpoints**: Verify all API endpoints work with new schema
2. **Authentication**: Test user creation and authentication flow
3. **Calendar Operations**: Test creating, reading, updating calendar data
4. **Telegram Integration**: Test Telegram account linking
5. **Data Access**: Verify RLS correctly restricts access

### Example Integration Test

```typescript
// test/integration/database-schema.test.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../database.types';

describe('Database Schema Integration', () => {
  const supabase = createClient<Database>(
    'http://localhost:54321',
    'your-anon-key'
  );

  it('should create a new user', async () => {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: 'test@example.com',
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toHaveProperty('user_id');
    expect(data.email).toBe('test@example.com');
  });

  it('should enforce RLS policies', async () => {
    // Test that users can only access their own data
    const { data, error } = await supabase
      .from('user_calendar_tokens')
      .select('*');

    // Should only return current user's tokens
    expect(data?.every(token => token.user_id === 'current-user-id')).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

#### 1. Docker Not Running

**Error:** `Cannot connect to the Docker daemon`

**Solution:**
```bash
# Start Docker Desktop
# On Windows: Open Docker Desktop from Start Menu
# On Mac: Open Docker from Applications
# On Linux: sudo systemctl start docker
```

#### 2. Port Conflicts

**Error:** `Port 54321 is already in use`

**Solution:**
```bash
# Stop existing Supabase instance
npx supabase stop

# Or change ports in supabase/config.toml
```

#### 3. Migration Fails Due to Data

**Error:** `violates foreign key constraint`

**Solution:**
```bash
# Check for orphaned data
psql postgresql://postgres:postgres@localhost:54322/postgres

# Find problematic records
SELECT * FROM user_calendar_tokens WHERE user_id NOT IN (SELECT user_id FROM users);

# Either fix the data or use the migration's built-in data migration
```

#### 4. RLS Blocks All Access

**Error:** `permission denied for table users`

**Solution:**
- Ensure you're using the correct API key (anon key for client-side, service_role for backend)
- Verify `auth.uid()` returns the correct user ID
- Check RLS policies in Supabase Studio
- Temporarily disable RLS for debugging:
  ```sql
  ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
  ```

## Next Steps

After successful migration testing:

1. ✅ Apply migrations to staging environment
2. ✅ Run full integration test suite
3. ✅ Update application code to use new schema
4. ✅ Update API documentation
5. ✅ Plan production migration (with downtime window if needed)
6. ✅ Create monitoring for new schema performance

## Production Migration Checklist

Before applying to production:

- [ ] All tests pass in local environment
- [ ] All tests pass in staging environment
- [ ] Database backup created
- [ ] Rollback procedure tested
- [ ] Downtime window scheduled (if needed)
- [ ] Team notified of migration
- [ ] Monitoring and alerts configured
- [ ] Performance benchmarks established
- [ ] Migration rehearsed in staging

---

**Questions?** Review the migration files in `supabase/migrations/` or consult the [Supabase Documentation](https://supabase.com/docs).
