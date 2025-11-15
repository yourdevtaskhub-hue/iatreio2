#!/bin/bash

# Comprehensive test runner for timezone integration tests
# This script sets up the test environment and runs all tests

set -e

echo "🧪 Starting Timezone Integration Tests"
echo "======================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Playwright is installed
if ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ npx not found. Please install Node.js and npm.${NC}"
    exit 1
fi

# Check if Playwright browsers are installed
echo -e "${YELLOW}📦 Checking Playwright installation...${NC}"
if ! npx playwright --version &> /dev/null; then
    echo -e "${YELLOW}Installing Playwright...${NC}"
    npx playwright install --with-deps
fi

# Set environment variables
export BASE_URL=${BASE_URL:-"http://localhost:3000"}
export API_URL=${API_URL:-"http://localhost:3000/api"}

echo -e "${GREEN}✓${NC} BASE_URL: $BASE_URL"
echo -e "${GREEN}✓${NC} API_URL: $API_URL"

# Check if database setup is needed
echo -e "${YELLOW}📊 Setting up test accounts...${NC}"
if [ -f "tests/setup-test-accounts.sql" ]; then
    echo "Run tests/setup-test-accounts.sql on your database to create test accounts"
    read -p "Have you set up the test accounts? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}⚠️  Please set up test accounts before running tests${NC}"
        exit 1
    fi
fi

# Run tests
echo -e "${YELLOW}🚀 Running tests...${NC}"
echo ""

# Run API tests first (faster, no UI needed)
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Running API Tests${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npx playwright test tests/timezone-api.test.ts --reporter=list

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ API tests passed${NC}"
else
    echo -e "${RED}✗ API tests failed${NC}"
    exit 1
fi

echo ""

# Run UI integration tests
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Running UI Integration Tests${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
npx playwright test tests/timezone-integration.test.ts --reporter=list

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ UI integration tests passed${NC}"
else
    echo -e "${RED}✗ UI integration tests failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Generate HTML report
echo -e "${YELLOW}📊 Generating test report...${NC}"
npx playwright show-report

