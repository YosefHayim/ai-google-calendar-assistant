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
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUSES)[keyof typeof SUBSCRIPTION_STATUSES];

/**
 * Statuses that indicate an active/valid subscription
 * Use this for granting access to premium features
 */
export const ACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
] as const;

/**
 * Statuses that indicate a subscription that can be modified
 * (e.g., for granting credits, changing plans)
 */
export const MODIFIABLE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
] as const;

/**
 * Statuses that include paused subscriptions
 * Use this when you want to include paused users (e.g., for user lookup)
 */
export const VALID_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.ACTIVE,
  SUBSCRIPTION_STATUSES.TRIALING,
  SUBSCRIPTION_STATUSES.PAST_DUE,
  SUBSCRIPTION_STATUSES.PAUSED,
] as const;

/**
 * Statuses that indicate a subscription is no longer active
 */
export const INACTIVE_SUBSCRIPTION_STATUSES = [
  SUBSCRIPTION_STATUSES.CANCELLED,
  SUBSCRIPTION_STATUSES.EXPIRED,
] as const;

/**
 * Check if a status is considered "active" for access purposes
 */
export const isActiveSubscription = (status: string): boolean => {
  return (ACTIVE_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
};

/**
 * Check if a status allows modifications (credits, plan changes)
 */
export const isModifiableSubscription = (status: string): boolean => {
  return (MODIFIABLE_SUBSCRIPTION_STATUSES as readonly string[]).includes(
    status
  );
};

/**
 * Check if subscription is valid (including paused)
 */
export const isValidSubscription = (status: string): boolean => {
  return (VALID_SUBSCRIPTION_STATUSES as readonly string[]).includes(status);
};
