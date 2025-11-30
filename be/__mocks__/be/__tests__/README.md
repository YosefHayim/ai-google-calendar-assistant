# Test Directory Structure

This directory contains organized tests following the application's architectural layers.

## Directory Structure

```
__tests__/
├── domain/          # Domain layer tests (Business logic, entities)
├── application/     # Application layer tests (Use cases, services)
├── infrastructure/  # Infrastructure layer tests (External integrations)
└── controller/      # Controller layer tests (HTTP handlers, routes)
```

## Coverage Targets

Each layer has specific coverage requirements enforced by Jest:

| Layer            | Coverage Target | Description                                    |
|------------------|----------------|------------------------------------------------|
| **Domain**       | 95%+           | Core business logic and domain entities        |
| **Application**  | 90%+           | Use cases and application services             |
| **Infrastructure** | 75%+        | External integrations (DB, APIs, etc.)         |
| **Controller**   | 80%+           | HTTP controllers and route handlers            |
| **Global**       | 75%+           | Default for any code not in above categories   |

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests with coverage
pnpm test:coverage

# Run tests for specific layer
pnpm test -- __tests__/domain
pnpm test -- __tests__/application
pnpm test -- __tests__/infrastructure
pnpm test -- __tests__/controller

# Watch mode
pnpm test:watch
```

## Test File Naming

- Test files should use the `.test.ts` extension
- Name tests after the file being tested: `user-service.test.ts`
- Place tests in the appropriate layer directory

## Best Practices

1. **Domain tests** should focus on business logic without external dependencies
2. **Application tests** should test use cases with mocked dependencies
3. **Infrastructure tests** may use real integrations or sophisticated mocks
4. **Controller tests** should test HTTP request/response handling

## Coverage Reports

After running tests with coverage, view the report at:
- HTML report: `coverage/index.html`
- Terminal output: Displayed after test run
- JSON summary: `coverage/coverage-summary.json`
