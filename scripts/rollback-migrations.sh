#!/bin/bash

# Script to rollback database migrations
# ⚠️  WARNING: This will revert schema changes and may result in data loss
# Usage: ./scripts/rollback-migrations.sh [--local|--remote]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default to local
ENVIRONMENT="local"

# Parse arguments
if [ "$1" == "--remote" ]; then
    ENVIRONMENT="remote"
fi

echo -e "${RED}⚠️  WARNING: ROLLBACK OPERATION ⚠️${NC}"
echo ""
echo "This will:"
echo "  • Drop Row-Level Security policies"
echo "  • Remove foreign key constraints"
echo "  • Revert table schema changes"
echo "  • Drop the users table"
echo "  • MAY RESULT IN DATA LOSS"
echo ""
echo "Environment: $ENVIRONMENT"
echo ""

read -p "Are you ABSOLUTELY SURE you want to continue? (type 'ROLLBACK' to confirm): " confirm
if [ "$confirm" != "ROLLBACK" ]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo -e "${YELLOW}Creating backup before rollback...${NC}"

if [ "$ENVIRONMENT" == "local" ]; then
    # Backup local database
    pg_dump postgresql://postgres:postgres@localhost:54322/postgres > "backup_before_rollback_$(date +%Y%m%d_%H%M%S).sql"
    echo -e "${GREEN}✓ Backup created${NC}"
else
    echo -e "${YELLOW}⚠️  Please create a backup of your remote database before proceeding${NC}"
    read -p "Have you created a backup? (yes/no): " backup_confirm
    if [ "$backup_confirm" != "yes" ]; then
        echo "Please create a backup first. Aborted."
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}=== Starting Rollback ===${NC}"
echo ""

# Create rollback SQL
cat > /tmp/rollback.sql << 'EOF'
-- Rollback migrations in reverse order

-- 1. Drop RLS policies
DROP POLICY IF EXISTS "Users can view own record" ON public.users;
DROP POLICY IF EXISTS "Users can update own record" ON public.users;
DROP POLICY IF EXISTS "Users can insert own record" ON public.users;
DROP POLICY IF EXISTS "Users can view own calendar tokens" ON public.user_calendar_tokens;
DROP POLICY IF EXISTS "Users can insert own calendar tokens" ON public.user_calendar_tokens;
DROP POLICY IF EXISTS "Users can update own calendar tokens" ON public.user_calendar_tokens;
DROP POLICY IF EXISTS "Users can delete own calendar tokens" ON public.user_calendar_tokens;
DROP POLICY IF EXISTS "Users can view own calendar categories" ON public.calendar_categories;
DROP POLICY IF EXISTS "Users can insert own calendar categories" ON public.calendar_categories;
DROP POLICY IF EXISTS "Users can update own calendar categories" ON public.calendar_categories;
DROP POLICY IF EXISTS "Users can delete own calendar categories" ON public.calendar_categories;
DROP POLICY IF EXISTS "Users can view own telegram links" ON public.user_telegram_links;
DROP POLICY IF EXISTS "Users can insert own telegram links" ON public.user_telegram_links;
DROP POLICY IF EXISTS "Users can update own telegram links" ON public.user_telegram_links;
DROP POLICY IF EXISTS "Users can delete own telegram links" ON public.user_telegram_links;

-- Disable RLS
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_calendar_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_telegram_links DISABLE ROW LEVEL SECURITY;

-- 2. Drop foreign key constraints
ALTER TABLE public.user_telegram_links DROP CONSTRAINT IF EXISTS user_telegram_links_user_id_fkey;
ALTER TABLE public.calendar_categories DROP CONSTRAINT IF EXISTS calendar_categories_user_id_fkey;
ALTER TABLE public.user_calendar_tokens DROP CONSTRAINT IF EXISTS user_calendar_tokens_user_id_fkey;

-- 3. Revert user_telegram_links changes
ALTER TABLE public.user_telegram_links DROP COLUMN IF EXISTS user_id;

-- 4. Revert calendar_categories changes
-- This is complex because we changed the type and made it NOT NULL
-- We'll convert back to nullable TEXT
ALTER TABLE public.calendar_categories ADD COLUMN IF NOT EXISTS user_id_text TEXT;
UPDATE public.calendar_categories SET user_id_text = user_id::TEXT;
ALTER TABLE public.calendar_categories DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.calendar_categories RENAME COLUMN user_id_text TO user_id;

-- Restore foreign key to user_calendar_tokens.email
ALTER TABLE public.calendar_categories
ADD CONSTRAINT calendar_categories_email_fkey
FOREIGN KEY (email) REFERENCES public.user_calendar_tokens(email);

-- 5. Revert user_calendar_tokens changes
-- Convert user_id back to TEXT (non-foreign key)
ALTER TABLE public.user_calendar_tokens ADD COLUMN IF NOT EXISTS user_id_text TEXT;
UPDATE public.user_calendar_tokens SET user_id_text = user_id::TEXT;
ALTER TABLE public.user_calendar_tokens DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.user_calendar_tokens RENAME COLUMN user_id_text TO user_id;
ALTER TABLE public.user_calendar_tokens ALTER COLUMN user_id SET NOT NULL;

-- 6. Drop users table and related objects
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TABLE IF EXISTS public.users CASCADE;

-- 7. Drop indexes created during migration
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_is_active;
DROP INDEX IF EXISTS idx_user_calendar_tokens_user_id;
DROP INDEX IF EXISTS idx_calendar_categories_user_id;
DROP INDEX IF EXISTS idx_user_telegram_links_user_id;
DROP INDEX IF EXISTS idx_user_telegram_links_email;
EOF

# Apply rollback
if [ "$ENVIRONMENT" == "local" ]; then
    psql postgresql://postgres:postgres@localhost:54322/postgres -f /tmp/rollback.sql
else
    echo "Please apply the rollback SQL manually in Supabase SQL Editor:"
    echo ""
    cat /tmp/rollback.sql
    echo ""
    read -p "Press Enter after you've applied the rollback SQL..."
fi

echo ""
echo -e "${GREEN}=== Rollback Complete ===${NC}"
echo ""
echo "The database has been reverted to its previous state."
echo ""
echo "Backup location: backup_before_rollback_*.sql"
echo ""
echo "Note: You may need to manually verify data integrity and relationships."

# Clean up
rm -f /tmp/rollback.sql
