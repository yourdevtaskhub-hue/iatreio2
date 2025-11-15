# Timezone Integration Tests

Comprehensive test suite for verifying timezone handling between Greece (Europe/Athens) and Switzerland (Europe/Zurich).

## Setup

1. Install dependencies:
```bash
npm install --save-dev @playwright/test
npx playwright install
```

2. Set environment variables:
```bash
export BASE_URL=http://localhost:3000
export API_URL=http://localhost:3000/api
```

3. Create test accounts in your database:
   - `doctor_zurich@test.local` (timezone: Europe/Zurich)
   - `patient_athens@test.local` (timezone: Europe/Athens)

## Running Tests

### All Tests
```bash
npx playwright test
```

### Specific Test Suite
```bash
npx playwright test timezone-integration
npx playwright test timezone-api
```

### With UI
```bash
npx playwright test --headed
```

### Debug Mode
```bash
npx playwright test --debug
```

## Test Cases

### Test 1: Simple Booking (No DST)
- Doctor creates availability at 10:00 Zurich time
- Patient sees it as 11:00 Athens time
- Booking stores correct UTC
- Both UIs show correct local times

### Test 2: DST Transition
- Tests slots before and after DST change
- Verifies correct UTC conversion
- Ensures no time conflicts

### Test 3: Midnight Boundary
- Tests slot at 23:30 Zurich (00:30 next day Athens)
- Verifies correct date handling
- Ensures no date confusion

### Test 4: Concurrency
- Two patients try to book same slot simultaneously
- Verifies only one succeeds
- Prevents duplicate bookings

## API Tests

The `timezone-api.test.ts` file contains API-only tests that can run without UI:
- UTC storage verification
- DST handling
- Midnight boundary handling
- Concurrency tests

## Expected Results

All tests should pass with:
- ✅ Correct UTC storage in database
- ✅ Correct timezone conversion in UI
- ✅ No duplicate bookings
- ✅ Correct email/calendar invites
- ✅ Proper DST handling
- ✅ No date confusion at boundaries

## Troubleshooting

If tests fail:
1. Check that test accounts exist
2. Verify database has `user_timezone` column
3. Ensure API endpoints are accessible
4. Check timezone conversion functions work correctly
5. Review screenshots in `test-results/` folder

