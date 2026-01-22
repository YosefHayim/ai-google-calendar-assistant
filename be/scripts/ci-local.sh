#!/bin/bash

# Local CI script that mimics GitHub Actions
# Generates a failure report if any check fails

set -e

REPORT_FILE="ci-failure-report.md"
FAILED=false
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Initialize report
init_report() {
  cat > "$REPORT_FILE" << EOF
# Backend CI Failure Report

**Generated:** $TIMESTAMP
**Branch:** $(git branch --show-current 2>/dev/null || echo "unknown")
**Commit:** $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")

---

EOF
}

# Add section to report
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

# Run a check and capture output
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

# Cleanup previous report
cleanup() {
  rm -f "$REPORT_FILE"
}

# Main
main() {
  echo ""
  echo "=================================="
  echo "  Backend Local CI Check"
  echo "=================================="
  echo ""
  
  cleanup
  init_report
  
  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}Installing dependencies...${NC}"
    bun install
  fi
  
  # Run checks (continue even if one fails)
  set +e
  
  echo ""
  echo "Step 1/4: Biome Lint"
  run_check "Biome Lint" "bunx biome check ."
  
  echo ""
  echo "Step 2/4: TypeScript Type Check"
  run_check "TypeScript Type Check" "bunx tsc --noEmit"
  
  echo ""
  echo "Step 3/4: Build"
  run_check "Build" "bun run build"
  
  echo ""
  echo "Step 4/4: Unit Tests"
  run_check "Unit Tests" "TEST_ENV=true bun run jest tests/utils tests/middlewares tests/services --passWithNoTests 2>&1 | head -100"
  
  set -e
  
  echo ""
  echo "=================================="
  
  if [ "$FAILED" = true ]; then
    echo -e "${RED}CI checks failed! See $REPORT_FILE for details.${NC}"
    
    # Add summary to report
    cat >> "$REPORT_FILE" << EOF
## Summary

One or more CI checks failed. Please fix the issues above before pushing.

### How to fix:

1. **Biome Lint**: Run \`bun run format\` to auto-fix lint issues
2. **TypeScript**: Fix type errors shown in the output
3. **Build**: Fix compilation errors
4. **Tests**: Fix failing tests or update snapshots

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
