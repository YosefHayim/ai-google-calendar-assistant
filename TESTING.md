# Testing Documentation

## Overview

This project has comprehensive unit test coverage with **98.71% statement coverage, 93.37% branch coverage, and 96% function coverage** - all exceeding the target 90% threshold.

## Test Stack

- **Framework**: Jest 30.2.0
- **Type Support**: ts-jest 29.4.5
- **HTTP Testing**: Supertest 7.1.4
- **Coverage**: Built-in Jest coverage

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run specific test file
pnpm test -- path/to/test.test.ts

# Run tests matching a pattern
pnpm test -- --testNamePattern="should format"
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- `coverage/lcov-report/index.html` - Interactive HTML report
- `coverage/coverage-summary.json` - JSON summary
- Terminal output shows coverage table after each test run

View coverage in browser:
```bash
open coverage/lcov-report/index.html  # macOS
start coverage/lcov-report/index.html # Windows
xdg-open coverage/lcov-report/index.html # Linux
```

## Test Structure

```
project/
├── __mocks__/              # Shared mock implementations
│   └── supabase.ts        # Supabase client mocks
├── utils/
│   ├── format-date.ts
│   ├── format-date.test.ts
│   ├── send-response.ts
│   └── send-response.test.ts
├── middlewares/
│   ├── auth-handler.ts
│   └── auth-handler.test.ts
└── ai-agents/
    ├── agent-utils.ts
    └── agent-utils.test.ts
```

## Coverage Thresholds

Global coverage thresholds are enforced:

- **Statements**: 90%
- **Branches**: 90%
- **Functions**: 90%
- **Lines**: 90%

Tests will fail if coverage drops below these thresholds.

## What's Tested

### Utils (98.11% coverage)
- ✅ `format-date.ts` - Date formatting utilities
- ✅ `send-response.ts` - HTTP response helpers
- ✅ `error-template.ts` - Error handling
- ✅ `async-handlers.ts` - Async middleware wrappers
- ✅ `get-event-duration-string.ts` - Duration calculations
- ✅ `storage.ts` - Storage constants

### Middlewares (100% coverage)
- ✅ `auth-handler.ts` - JWT authentication middleware
- ✅ `error-handler.ts` - Global error handling

### AI Agents (90.78% coverage)
- ✅ `agent-utils.ts` - Event formatting and validation

## What's Excluded from Coverage

The following files are excluded from coverage requirements as they are integration code or configuration:

- Configuration files (`config/root-config.ts`)
- Route definitions (`routes/**`)
- Controllers (`controllers/**`)
- Telegram bot implementation (`telegram-bot/**`)
- Agent definitions (`ai-agents/agents.ts`, etc.)
- Integration utilities that heavily depend on external APIs

## Writing Tests

### Example Test Structure

```typescript
import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { functionToTest } from "./module";

describe("functionToTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("success cases", () => {
    it("should handle valid input", () => {
      const result = functionToTest("valid");
      expect(result).toBe("expected");
    });
  });

  describe("error cases", () => {
    it("should throw on invalid input", () => {
      expect(() => functionToTest("invalid")).toThrow("Error message");
    });
  });

  describe("edge cases", () => {
    it("should handle empty input", () => {
      const result = functionToTest("");
      expect(result).toBeDefined();
    });
  });
});
```

### Mocking Best Practices

1. **Create mocks before imports**:
```typescript
const mockFunction = jest.fn();
jest.mock("@/module", () => ({
  function: mockFunction,
}));

import { function } from "@/module";
```

2. **Clear mocks in beforeEach**:
```typescript
beforeEach(() => {
  mockFunction.mockClear();
});
```

3. **Use specific matchers**:
```typescript
expect(mockFunction).toHaveBeenCalledWith(specificArg);
expect(mockFunction).toHaveBeenCalledTimes(1);
```

## Common Testing Patterns

### Testing Async Functions
```typescript
it("should handle async operation", async () => {
  const result = await asyncFunction();
  expect(result).toEqual(expected);
});
```

### Testing Error Handling
```typescript
it("should throw specific error", async () => {
  await expect(failingFunction()).rejects.toThrow("Expected error");
});
```

### Testing Express Middleware
```typescript
it("should call next middleware", async () => {
  const mockNext = jest.fn();
  await middleware(mockReq, mockRes, mockNext);
  expect(mockNext).toHaveBeenCalled();
});
```

## Continuous Integration

Tests run automatically on:
- Pre-commit hooks (via Husky)
- Pull request validation
- Main branch builds

## Troubleshooting

### Tests failing locally but passing in CI
- Clear Jest cache: `pnpm jest --clearCache`
- Remove node_modules and reinstall: `rm -rf node_modules && pnpm install`

### Coverage not updating
- Delete coverage folder: `rm -rf coverage`
- Run tests with `--no-cache` flag

### Mock not working
- Ensure mocks are defined before imports
- Check module path in `jest.mock()` matches import
- Clear mocks in `beforeEach()`

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/ladjs/supertest)

## Contributing

When adding new features:
1. Write tests first (TDD approach recommended)
2. Ensure all tests pass: `pnpm test`
3. Check coverage: `pnpm test:coverage`
4. Update this documentation if adding new test patterns
