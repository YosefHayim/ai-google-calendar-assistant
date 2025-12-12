# Dependency Injection with InversifyJS

This directory contains the dependency injection configuration using InversifyJS.

## Overview

The DI container manages repository dependencies and their lifecycle. All repositories are bound in singleton scope for efficiency.

## Usage

### 1. Create the container

```typescript
import { createSupabaseClient } from "@/config/supabase";
import { createGoogleCalendarClient } from "@/config/google-calendar";
import { createContainer, TYPES } from "@/infrastructure/di";

// Create external clients
const supabaseClient = createSupabaseClient();
const googleCalendarClient = createGoogleCalendarClient();

// Create DI container
const container = createContainer(supabaseClient, googleCalendarClient);
```

### 2. Get repositories from the container

```typescript
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IEventRepository } from "@/domain/repositories/IEventRepository";
import { ICalendarRepository } from "@/domain/repositories/ICalendarRepository";

// Get repositories
const userRepo = container.get<IUserRepository>(TYPES.IUserRepository);
const eventRepo = container.get<IEventRepository>(TYPES.IEventRepository);
const calendarRepo = container.get<ICalendarRepository>(TYPES.ICalendarRepository);

// Use repositories
const user = await userRepo.findById("user-123");
const events = await eventRepo.findUpcoming("calendar-123");
```

### 3. Use in services/controllers

```typescript
import { Container } from "inversify";
import { TYPES } from "@/infrastructure/di";
import { IUserRepository } from "@/domain/repositories/IUserRepository";

class UserService {
  private userRepository: IUserRepository;

  constructor(container: Container) {
    this.userRepository = container.get<IUserRepository>(TYPES.IUserRepository);
  }

  async getUser(userId: string) {
    return await this.userRepository.findById(userId);
  }
}
```

## Repository Bindings

| Symbol | Interface | Implementation |
|--------|-----------|----------------|
| `TYPES.IUserRepository` | `IUserRepository` | `SupabaseUserRepository` |
| `TYPES.IEventRepository` | `IEventRepository` | `GoogleCalendarEventRepository` |
| `TYPES.ICalendarRepository` | `ICalendarRepository` | `GoogleCalendarCalendarRepository` |

## Lifecycle

All repositories are bound in **singleton scope**, meaning:
- A single instance is created per container
- The same instance is returned for all `get()` calls
- Efficient resource usage
- Consistent state across the application

## Testing

For unit testing, you can create a test container with mock repositories:

```typescript
import { Container } from "inversify";
import { TYPES } from "@/infrastructure/di";

const testContainer = new Container();

// Bind mock repositories
testContainer.bind(TYPES.IUserRepository).toConstantValue(mockUserRepo);
testContainer.bind(TYPES.IEventRepository).toConstantValue(mockEventRepo);
testContainer.bind(TYPES.ICalendarRepository).toConstantValue(mockCalendarRepo);
```

## Files

- **types.ts** - Symbol definitions for dependency injection
- **container.ts** - Container configuration and factory function
- **index.ts** - Module exports
- **README.md** - This documentation

## Adding New Repositories

To add a new repository:

1. Add symbol to `types.ts`:
```typescript
export const TYPES = {
  // ... existing symbols
  INewRepository: Symbol.for("INewRepository"),
};
```

2. Bind in `container.ts`:
```typescript
container
  .bind<INewRepository>(TYPES.INewRepository)
  .to(NewRepositoryImplementation)
  .inSingletonScope();
```

3. Use in your code:
```typescript
const newRepo = container.get<INewRepository>(TYPES.INewRepository);
```
