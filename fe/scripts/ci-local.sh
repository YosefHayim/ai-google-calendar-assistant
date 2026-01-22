#!/bin/bash

set -e

REPORT_FILE="ci-failure-report.md"
FAILED=false
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

init_report() {
  cat > "$REPORT_FILE" << EOF
# Frontend CI Failure Report

**Generated:** $TIMESTAMP
**Branch:** $(git branch --show-current 2>/dev/null || echo "unknown")
**Commit:** $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

---

EOF
}

add_to_report() {
  local title="$1"
  local status="$2"
  local output="$3"
  
  if [ "$status" = "failed" ]; then
    cat >> "$REPORT_FILE" << EOF
## ❌ $title

\`\`\`
$output
\`\`\`

---

EOF
  fi
}

run_check() {
  local name="$1"
  local cmd="$2"
  
  echo -e "${YELLOW}Running: $name${NC}"
  
  local output
  local exit_code
  
  output=$(eval "$cmd" 2>&1) || exit_code=$?
  
  if [ -n "$exit_code" ] && [ "$exit_code" -ne 0 ]; then
    echo -e "${RED}✗ $name failed${NC}"
    add_to_report "$name" "failed" "$output"
    FAILED=true
    return 1
  else
    echo -e "${GREEN}✓ $name passed${NC}"
    return 0
  fi
}

cleanup() {
  rm -f "$REPORT_FILE"
}

main() {
  echo ""
  echo "=================================="
  echo "  Frontend Local CI Check"
  echo "=================================="
  echo ""
  
  cleanup
  init_report
  
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm ci
  fi
  
  set +e
  
  echo ""
  echo "Step 1/4: ESLint"
  run_check "ESLint" "npm run lint 2>&1 | head -100"
  
  echo ""
  echo "Step 2/4: TypeScript Type Check"
  run_check "TypeScript Type Check" "npx tsc --noEmit"
  
  echo ""
  echo "Step 3/4: Build"
  export NEXT_PUBLIC_BACKEND_URL=http://localhost:3000
  export NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
  export NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
  run_check "Next.js Build" "npm run build 2>&1 | tail -50"
  
  echo ""
  echo "Step 4/4: Tests"
  run_check "Tests" "NODE_ENV=test bun test 2>&1 | head -100"
  
  set -e
  
  echo ""
  echo "=================================="
  
  if [ "$FAILED" = true ]; then
    echo -e "${RED}CI checks failed! See $REPORT_FILE for details.${NC}"
    
    cat >> "$REPORT_FILE" << EOF
## Summary

One or more CI checks failed. Please fix the issues above before pushing.

### How to fix:

1. **ESLint**: Run \`npm run lint:fix\` to auto-fix lint issues
2. **TypeScript**: Fix type errors shown in the output
3. **Build**: Fix compilation errors
4. **Tests**: Fix failing tests

EOF
    
    echo ""
    echo "Report saved to: $REPORT_FILE"
    exit 1
  else
    cleanup
    echo -e "${GREEN}All CI checks passed!${NC}"
    exit 0
  fi
}

main "$@"
