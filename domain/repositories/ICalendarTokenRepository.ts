/**
 * Calendar Token Repository Interface
 *
 * Defines contract for Google Calendar OAuth token data access operations.
 * Manages storage and retrieval of user authentication tokens for Google Calendar API.
 */

export interface CalendarToken {
  id?: number;
  userId: string;
  email: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  idToken: string | null;
  tokenType: string | null;
  expiryDate: number | null;
  refreshTokenExpiresIn: number | null;
  scope: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICalendarTokenRepository {
  /**
   * Find calendar token by ID
   * @param id Token's unique identifier
   * @returns Calendar token if found, null otherwise
   */
  findById(id: number): Promise<CalendarToken | null>;

  /**
   * Find active calendar token by user ID
   * @param userId User's unique identifier
   * @returns Active calendar token if found, null otherwise
   */
  findByUserId(userId: string): Promise<CalendarToken | null>;

  /**
   * Find calendar token by email
   * @param email User's email address
   * @returns Calendar token if found, null otherwise
   */
  findByEmail(email: string): Promise<CalendarToken | null>;

  /**
   * Find all calendar tokens for a user (including inactive)
   * @param userId User's unique identifier
   * @returns Array of calendar tokens
   */
  findAllByUserId(userId: string): Promise<CalendarToken[]>;

  /**
   * Create a new calendar token
   * @param token Calendar token data to create
   * @returns Created calendar token with generated ID
   */
  create(token: CalendarToken): Promise<CalendarToken>;

  /**
   * Update an existing calendar token
   * @param id Token's unique identifier
   * @param updates Partial calendar token data to update
   * @returns Updated calendar token
   */
  update(id: number, updates: Partial<CalendarToken>): Promise<CalendarToken>;

  /**
   * Update token by user ID
   * @param userId User's unique identifier
   * @param updates Partial calendar token data to update
   * @returns Updated calendar token
   */
  updateByUserId(userId: string, updates: Partial<CalendarToken>): Promise<CalendarToken>;

  /**
   * Delete a calendar token
   * @param id Token's unique identifier
   * @returns True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;

  /**
   * Delete all calendar tokens for a user
   * @param userId User's unique identifier
   * @returns Number of tokens deleted
   */
  deleteByUserId(userId: string): Promise<number>;

  /**
   * Deactivate calendar token
   * @param id Token's unique identifier
   * @returns Updated calendar token
   */
  deactivate(id: number): Promise<CalendarToken>;

  /**
   * Deactivate all tokens for a user except the specified one
   * @param userId User's unique identifier
   * @param exceptTokenId Token ID to keep active
   * @returns Number of tokens deactivated
   */
  deactivateOthers(userId: string, exceptTokenId: number): Promise<number>;

  /**
   * Check if user has active calendar token
   * @param userId User's unique identifier
   * @returns True if active token exists, false otherwise
   */
  hasActiveToken(userId: string): Promise<boolean>;

  /**
   * Check if token is expired
   * @param id Token's unique identifier
   * @returns True if expired, false otherwise
   */
  isExpired(id: number): Promise<boolean>;

  /**
   * Refresh access token
   * @param id Token's unique identifier
   * @param newAccessToken New access token
   * @param newExpiryDate New expiry date (unix timestamp)
   * @returns Updated calendar token
   */
  refreshAccessToken(id: number, newAccessToken: string, newExpiryDate: number): Promise<CalendarToken>;

  /**
   * Get calendar token count
   * @param criteria Optional filter criteria
   * @returns Total count of tokens matching criteria
   */
  count(criteria?: { userId?: string; isActive?: boolean }): Promise<number>;
}
