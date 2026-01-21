/**
 * Subscription Status Constants
 *
 * Centralized constants for subscription status queries to ensure consistency
 * across all services and controllers.
 */

/**
 * All possible subscription statuses in the system
 */
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  PAUSED: "paused",
  CANCELLED: "cancelled",
  EXPIRED: "expired",
} as const

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES]

/**
 * Statuses that indicate an active/valid subscription
 * Use this for granting access to premium features
 */
export const ACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
] as const

/**
 * Statuses that indicate a subscription that can be modified
 * (e.g., for granting credits, changing plans)
 */
export const MODIFIABLE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
] as const

/**
 * Statuses that include paused subscriptions
 * Use this when you want to include paused users (e.g., for user lookup)
 */
export const VALID_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
  SUBSCRIPTION_STATUSES.PAUSED,
] as const

/**
 * Statuses that indicate a subscription is no longer active
 */
export const INACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.CANCELLED,
  SUBSCRIPTION_STATUSES.EXPIRED,
] as const

/**
 * @description Checks if a subscription status is considered "active" for granting access
 * to premium features. Active statuses include: active, trialing, and past_due.
 * Use this function to determine if a user should have access to paid features.
 *
 * @param {string} status - The subscription status string to check
 * @returns {boolean} True if the status grants active access, false otherwise
 *
 * @example
 * // Check if user has active subscription
 * if (isActiveSubscription(user.subscriptionStatus)) {
 *   // Grant access to premium features
 * }
 *
 * @example
 * // Returns true for active statuses
 * isActiveSubscription('active')   // true
 * isActiveSubscription('trialing') // true
 * isActiveSubscription('past_due') // true
 * isActiveSubscription('cancelled') // false
 */
export const isActiveSubscription = (status: string): boolean =>
  (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)

/**
 * @description Checks if a subscription status allows modifications such as
 * granting credits, changing plans, or applying promotional offers.
 * Modifiable statuses include: active, trialing, and past_due.
 *
 * @param {string} status - The subscription status string to check
 * @returns {boolean} True if the subscription can be modified, false otherwise
 *
 * @example
 * // Check before applying credits
 * if (isModifiableSubscription(subscription.status)) {
 *   await grantBonusCredits(userId, 100);
 * }
 *
 * @example
 * // Check before allowing plan upgrade
 * isModifiableSubscription('active')    // true
 * isModifiableSubscription('paused')    // false
 * isModifiableSubscription('cancelled') // false
 */
export const isModifiableSubscription = (status: string): boolean =>
  (MODIFIABLE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)

/**
 * @description Checks if a subscription is valid, which includes paused subscriptions
 * in addition to active ones. Valid statuses include: active, trialing, past_due, and paused.
 * Use this for user lookup operations where you want to include users who have
 * temporarily paused their subscription but haven't cancelled.
 *
 * @param {string} status - The subscription status string to check
 * @returns {boolean} True if the subscription is valid (including paused), false otherwise
 *
 * @example
 * // Include paused users in user lookup
 * const users = await findUsers({
 *   where: { subscriptionValid: isValidSubscription(status) }
 * });
 *
 * @example
 * // Valid statuses
 * isValidSubscription('active')    // true
 * isValidSubscription('paused')    // true
 * isValidSubscription('trialing')  // true
 * isValidSubscription('cancelled') // false
 * isValidSubscription('expired')   // false
 */
export const isValidSubscription = (status: string): boolean =>
  (VALID_SUBSCRIPTION_STATUSES as readonly string[]).includes(status)
