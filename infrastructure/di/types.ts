export const TYPES = {
  // Repository Interfaces
  IUserRepository: Symbol.for('IUserRepository'),
  IEventRepository: Symbol.for('IEventRepository'),
  ICalendarRepository: Symbol.for('ICalendarRepository'),
  ITelegramLinkRepository: Symbol.for('ITelegramLinkRepository'),
  ICalendarTokenRepository: Symbol.for('ICalendarTokenRepository'),

  // External Clients
  SupabaseClient: Symbol.for('SupabaseClient'),
  GoogleCalendarClient: Symbol.for('GoogleCalendarClient'),

  // Configuration
  Config: Symbol.for('Config'),
};
