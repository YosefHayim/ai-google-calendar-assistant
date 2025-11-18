/**
 * Dependency Injection Container
 *
 * Configures InversifyJS container with repository bindings
 */

import { Container } from "inversify";
import { TYPES } from "./types";

// Repository Interfaces
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { IEventRepository } from "../../domain/repositories/IEventRepository";
import { ICalendarRepository } from "../../domain/repositories/ICalendarRepository";

// Repository Implementations
import { SupabaseUserRepository } from "../repositories/SupabaseUserRepository";
import { GoogleCalendarEventRepository } from "../repositories/GoogleCalendarEventRepository";
import { GoogleCalendarCalendarRepository } from "../repositories/GoogleCalendarCalendarRepository";

// External Clients
import type { SupabaseClient } from "@supabase/supabase-js";
import type { calendar_v3 } from "googleapis";
import type { Database } from "../../database.types.new";

/**
 * Create and configure the DI container
 * @param supabaseClient Supabase client instance
 * @param googleCalendarClient Google Calendar API client instance
 */
export function createContainer(
  supabaseClient: SupabaseClient<Database>,
  googleCalendarClient: calendar_v3.Calendar
): Container {
  const container = new Container();

  // Bind external clients
  container.bind<SupabaseClient<Database>>(TYPES.SupabaseClient).toConstantValue(supabaseClient);
  container
    .bind<calendar_v3.Calendar>(TYPES.GoogleCalendarClient)
    .toConstantValue(googleCalendarClient);

  // Bind User Repository
  container
    .bind<IUserRepository>(TYPES.IUserRepository)
    .toDynamicValue((context) => {
      const client = context.container.get<SupabaseClient<Database>>(TYPES.SupabaseClient);
      return new SupabaseUserRepository(client);
    })
    .inSingletonScope();

  // Bind Event Repository
  container
    .bind<IEventRepository>(TYPES.IEventRepository)
    .toDynamicValue((context) => {
      const client = context.container.get<calendar_v3.Calendar>(TYPES.GoogleCalendarClient);
      return new GoogleCalendarEventRepository(client);
    })
    .inSingletonScope();

  // Bind Calendar Repository
  container
    .bind<ICalendarRepository>(TYPES.ICalendarRepository)
    .toDynamicValue((context) => {
      const client = context.container.get<calendar_v3.Calendar>(TYPES.GoogleCalendarClient);
      return new GoogleCalendarCalendarRepository(client);
    })
    .inSingletonScope();

  return container;
}

/**
 * Get a repository from the container
 */
export function getRepository<T>(container: Container, type: symbol): T {
  return container.get<T>(type);
}
