/**
 * Telegram Link Repository Interface
 *
 * Defines contract for Telegram account link data access operations.
 * Manages the association between users and their Telegram accounts.
 */

export interface TelegramLink {
  id?: number;
  userId: string | null;
  chatId: number | null;
  username: string | null;
  firstName: string | null;
  email: string | null;
  languageCode: string | null;
  createdAt?: Date;
}

export interface ITelegramLinkRepository {
  /**
   * Find Telegram link by ID
   * @param id Link's unique identifier
   * @returns Telegram link if found, null otherwise
   */
  findById(id: number): Promise<TelegramLink | null>;

  /**
   * Find Telegram link by user ID
   * @param userId User's unique identifier
   * @returns Telegram link if found, null otherwise
   */
  findByUserId(userId: string): Promise<TelegramLink | null>;

  /**
   * Find Telegram link by chat ID
   * @param chatId Telegram chat ID
   * @returns Telegram link if found, null otherwise
   */
  findByChatId(chatId: number): Promise<TelegramLink | null>;

  /**
   * Find Telegram link by username
   * @param username Telegram username
   * @returns Telegram link if found, null otherwise
   */
  findByUsername(username: string): Promise<TelegramLink | null>;

  /**
   * Find all Telegram links matching criteria
   * @param criteria Optional filter criteria
   * @returns Array of matching Telegram links
   */
  findAll(criteria?: {
    userId?: string;
    limit?: number;
    offset?: number;
  }): Promise<TelegramLink[]>;

  /**
   * Create a new Telegram link
   * @param link Telegram link data to create
   * @returns Created Telegram link with generated ID
   */
  create(link: TelegramLink): Promise<TelegramLink>;

  /**
   * Update an existing Telegram link
   * @param id Link's unique identifier
   * @param updates Partial Telegram link data to update
   * @returns Updated Telegram link
   */
  update(id: number, updates: Partial<TelegramLink>): Promise<TelegramLink>;

  /**
   * Delete a Telegram link
   * @param id Link's unique identifier
   * @returns True if deleted, false if not found
   */
  delete(id: number): Promise<boolean>;

  /**
   * Delete Telegram link by user ID
   * @param userId User's unique identifier
   * @returns True if deleted, false if not found
   */
  deleteByUserId(userId: string): Promise<boolean>;

  /**
   * Delete Telegram link by chat ID
   * @param chatId Telegram chat ID
   * @returns True if deleted, false if not found
   */
  deleteByChatId(chatId: number): Promise<boolean>;

  /**
   * Check if user has Telegram link
   * @param userId User's unique identifier
   * @returns True if link exists, false otherwise
   */
  exists(userId: string): Promise<boolean>;

  /**
   * Check if chat ID is already linked
   * @param chatId Telegram chat ID
   * @returns True if chat is linked, false otherwise
   */
  isChatLinked(chatId: number): Promise<boolean>;

  /**
   * Get Telegram link count
   * @param criteria Optional filter criteria
   * @returns Total count of links matching criteria
   */
  count(criteria?: { userId?: string }): Promise<number>;
}
