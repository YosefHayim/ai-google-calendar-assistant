#!/bin/bash

# Script to apply database migrations
# Usage: ./scripts/apply-migrations.sh [--local|--remote]

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
    echo -e "${YELLOW}⚠️  WARNING: Applying migrations to REMOTE database${NC}"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Aborted."
        exit 1
    fi
fi

echo -e "${GREEN}Starting database migration...${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

# Function to apply a single migration
apply_migration() {
    local migration_file=$1
    local migration_name=$(basename "$migration_file")

    echo -e "${YELLOW}Applying: $migration_name${NC}"

    if [ "$ENVIRONMENT" == "local" ]; then
        # Apply to local database
        psql postgresql://postgres:postgres@localhost:54322/postgres -f "$migration_file"
    else
        # Apply to remote database using Supabase CLI
        supabase db push --file "$migration_file"
    fi

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $migration_name applied successfully${NC}"
    else
        echo -e "${RED}✗ Failed to apply $migration_name${NC}"
        exit 1
    fi
    echo ""
}

# Check if local Supabase is running
if [ "$ENVIRONMENT" == "local" ]; then
    echo "Checking if local Supabase is running..."
    if ! pg_isready -h localhost -p 54322 &> /dev/null; then
        echo -e "${YELLOW}Local Supabase is not running. Starting...${NC}"
        npx supabase start
        sleep 5
    fi
    echo -e "${GREEN}✓ Local Supabase is running${NC}"
    echo ""
fi

# Apply migrations in order
MIGRATIONS_DIR="supabase/migrations"

echo -e "${GREEN}=== Applying Migrations ===${NC}"
echo ""

apply_migration "$MIGRATIONS_DIR/20250119000001_create_users_table.sql"
apply_migration "$MIGRATIONS_DIR/20250119000002_redesign_user_calendar_tokens.sql"
apply_migration "$MIGRATIONS_DIR/20250119000003_redesign_calendar_categories.sql"
apply_migration "$MIGRATIONS_DIR/20250119000004_redesign_user_telegram_links.sql"
apply_migration "$MIGRATIONS_DIR/20250119000005_implement_rls_policies.sql"

echo -e "${GREEN}=== All migrations applied successfully! ===${NC}"
echo ""

# Generate new TypeScript types
if [ "$ENVIRONMENT" == "local" ]; then
    echo "Generating TypeScript types..."
    npx supabase gen types typescript --local > database.types.ts
    echo -e "${GREEN}✓ TypeScript types generated${NC}"
    echo ""
fi

# Verify schema
echo "Verifying schema..."
if [ "$ENVIRONMENT" == "local" ]; then
    psql postgresql://postgres:postgres@localhost:54322/postgres -c "\dt public.*"
else
    echo "Please verify schema in Supabase Dashboard"
fi

echo ""
echo -e "${GREEN}Migration complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Verify the schema changes in your database"
echo "2. Test RLS policies"
echo "3. Update application code to use new schema"
echo "4. Run tests to ensure everything works"
