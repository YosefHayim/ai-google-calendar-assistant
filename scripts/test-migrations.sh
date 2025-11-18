#!/bin/bash

# Script to test and validate database migrations
# Usage: ./scripts/test-migrations.sh [--local|--remote]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default to local
ENVIRONMENT="local"
DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Parse arguments
if [ "$1" == "--remote" ]; then
    ENVIRONMENT="remote"
    # For remote, you'd need to provide the connection string
    echo -e "${YELLOW}Note: For remote testing, update DB_URL in this script${NC}"
fi

echo -e "${BLUE}=== Database Migration Validation ===${NC}"
echo "Environment: $ENVIRONMENT"
echo ""

# Function to run SQL and check result
run_test() {
    local test_name=$1
    local sql=$2
    local expected=$3

    echo -ne "Testing: $test_name... "

    result=$(psql "$DB_URL" -t -A -c "$sql" 2>&1)

    if [[ "$result" == *"$expected"* ]]; then
        echo -e "${GREEN}✓ PASS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        return 1
    fi
}

# Track test results
TOTAL_TESTS=0
PASSED_TESTS=0

# Function to increment counters
test_result() {
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    if [ $? -eq 0 ]; then
        PASSED_TESTS=$((PASSED_TESTS + 1))
    fi
}

echo -e "${BLUE}=== Table Structure Tests ===${NC}"
echo ""

# Test 1: Users table exists
run_test "users table exists" \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_name='users';" \
    "1"
test_result

# Test 2: Users table has correct columns
run_test "users table has user_id column" \
    "SELECT COUNT(*) FROM information_schema.columns WHERE table_name='users' AND column_name='user_id';" \
    "1"
test_result

run_test "users table has email column (unique)" \
    "SELECT COUNT(*) FROM information_schema.table_constraints tc JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name WHERE tc.table_name='users' AND ccu.column_name='email' AND tc.constraint_type='UNIQUE';" \
    "1"
test_result

echo ""
echo -e "${BLUE}=== Foreign Key Tests ===${NC}"
echo ""

# Test 3: user_calendar_tokens has foreign key to users
run_test "user_calendar_tokens → users FK" \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name='user_calendar_tokens' AND constraint_type='FOREIGN KEY' AND constraint_name LIKE '%user_id%';" \
    "1"
test_result

# Test 4: calendar_categories has foreign key to users
run_test "calendar_categories → users FK" \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name='calendar_categories' AND constraint_type='FOREIGN KEY' AND constraint_name LIKE '%user_id%';" \
    "1"
test_result

# Test 5: user_telegram_links has foreign key to users
run_test "user_telegram_links → users FK" \
    "SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_name='user_telegram_links' AND constraint_type='FOREIGN KEY' AND constraint_name LIKE '%user_id%';" \
    "1"
test_result

echo ""
echo -e "${BLUE}=== Index Tests ===${NC}"
echo ""

# Test 6: Check for indexes
run_test "users email index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE tablename='users' AND indexname LIKE '%email%';" \
    "1"
test_result

run_test "user_calendar_tokens user_id index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE tablename='user_calendar_tokens' AND indexname LIKE '%user_id%';" \
    "1"
test_result

run_test "calendar_categories user_id index exists" \
    "SELECT COUNT(*) FROM pg_indexes WHERE tablename='calendar_categories' AND indexname LIKE '%user_id%';" \
    "1"
test_result

echo ""
echo -e "${BLUE}=== RLS Policy Tests ===${NC}"
echo ""

# Test 7: RLS is enabled on tables
run_test "RLS enabled on users table" \
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename='users' AND rowsecurity=true;" \
    "1"
test_result

run_test "RLS enabled on user_calendar_tokens" \
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename='user_calendar_tokens' AND rowsecurity=true;" \
    "1"
test_result

run_test "RLS enabled on calendar_categories" \
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename='calendar_categories' AND rowsecurity=true;" \
    "1"
test_result

run_test "RLS enabled on user_telegram_links" \
    "SELECT COUNT(*) FROM pg_tables WHERE schemaname='public' AND tablename='user_telegram_links' AND rowsecurity=true;" \
    "1"
test_result

# Test 8: Check for RLS policies
run_test "users table has RLS policies" \
    "SELECT COUNT(*) FROM pg_policies WHERE tablename='users';" \
    "3"
test_result

run_test "user_calendar_tokens has RLS policies" \
    "SELECT COUNT(*) FROM pg_policies WHERE tablename='user_calendar_tokens';" \
    "4"
test_result

run_test "calendar_categories has RLS policies" \
    "SELECT COUNT(*) FROM pg_policies WHERE tablename='calendar_categories';" \
    "4"
test_result

run_test "user_telegram_links has RLS policies" \
    "SELECT COUNT(*) FROM pg_policies WHERE tablename='user_telegram_links';" \
    "4"
test_result

echo ""
echo -e "${BLUE}=== Trigger Tests ===${NC}"
echo ""

# Test 9: Updated_at trigger exists
run_test "update_updated_at_column function exists" \
    "SELECT COUNT(*) FROM pg_proc WHERE proname='update_updated_at_column';" \
    "1"
test_result

run_test "users table has updated_at trigger" \
    "SELECT COUNT(*) FROM pg_trigger WHERE tgname='update_users_updated_at';" \
    "1"
test_result

echo ""
echo -e "${BLUE}=== Data Integrity Tests ===${NC}"
echo ""

# Test 10: Check for orphaned records (if there's data)
echo -ne "Checking for orphaned calendar_categories records... "
orphaned=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM calendar_categories cc WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = cc.user_id);")
if [ "$orphaned" == "0" ]; then
    echo -e "${GREEN}✓ PASS (no orphaned records)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}! WARNING ($orphaned orphaned records found)${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo -ne "Checking for orphaned user_calendar_tokens records... "
orphaned=$(psql "$DB_URL" -t -A -c "SELECT COUNT(*) FROM user_calendar_tokens uct WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.user_id = uct.user_id);")
if [ "$orphaned" == "0" ]; then
    echo -e "${GREEN}✓ PASS (no orphaned records)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${YELLOW}! WARNING ($orphaned orphaned records found)${NC}"
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""
echo -e "${BLUE}=== Summary ===${NC}"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "Failed: ${RED}$((TOTAL_TESTS - PASSED_TESTS))${NC}"
echo ""

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}✓ All tests passed! Migrations applied successfully.${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Please review the migration.${NC}"
    exit 1
fi
