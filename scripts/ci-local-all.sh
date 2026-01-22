#!/bin/bash

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

BE_FAILED=false
FE_FAILED=false

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Running Full Local CI Check${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

echo -e "${YELLOW}[1/2] Backend CI...${NC}"
echo ""
cd "$ROOT_DIR/be"
if bash scripts/ci-local.sh; then
  echo -e "${GREEN}Backend CI passed${NC}"
else
  BE_FAILED=true
  echo -e "${RED}Backend CI failed - see be/ci-failure-report.md${NC}"
fi

echo ""
echo -e "${YELLOW}[2/2] Frontend CI...${NC}"
echo ""
cd "$ROOT_DIR/fe"
if bash scripts/ci-local.sh; then
  echo -e "${GREEN}Frontend CI passed${NC}"
else
  FE_FAILED=true
  echo -e "${RED}Frontend CI failed - see fe/ci-failure-report.md${NC}"
fi

echo ""
echo -e "${BLUE}============================================${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}============================================${NC}"
echo ""

if [ "$BE_FAILED" = true ] || [ "$FE_FAILED" = true ]; then
  echo -e "${RED}CI checks failed!${NC}"
  echo ""
  [ "$BE_FAILED" = true ] && echo -e "  ${RED}✗${NC} Backend  - see be/ci-failure-report.md"
  [ "$FE_FAILED" = true ] && echo -e "  ${RED}✗${NC} Frontend - see fe/ci-failure-report.md"
  [ "$BE_FAILED" = false ] && echo -e "  ${GREEN}✓${NC} Backend"
  [ "$FE_FAILED" = false ] && echo -e "  ${GREEN}✓${NC} Frontend"
  echo ""
  exit 1
else
  echo -e "${GREEN}All CI checks passed!${NC}"
  echo ""
  echo -e "  ${GREEN}✓${NC} Backend"
  echo -e "  ${GREEN}✓${NC} Frontend"
  echo ""
  exit 0
fi
