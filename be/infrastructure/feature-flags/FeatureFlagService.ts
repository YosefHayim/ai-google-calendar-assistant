/**
 * Feature Flag Service
 * Manages feature toggles for gradual rollout and migration strategies
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage?: number;
  enabledForUsers?: string[];
  disabledForUsers?: string[];
  metadata?: Record<string, unknown>;
}

export interface FeatureFlagConfig {
  flags: Record<string, FeatureFlag>;
}

/**
 * Available feature flags for the application
 */
export enum FeatureFlags {
  // Repository pattern flags
  USE_REPOSITORY_PATTERN = "use_repository_pattern",
  USE_EVENT_REPOSITORY = "use_event_repository",
  USE_CALENDAR_REPOSITORY = "use_calendar_repository",
  USE_USER_REPOSITORY = "use_user_repository",

  // Service layer flags
  USE_SERVICE_LAYER = "use_service_layer",
  USE_EVENT_SERVICE = "use_event_service",
  USE_CALENDAR_SERVICE = "use_calendar_service",

  // API client flags
  USE_ENHANCED_CLIENTS = "use_enhanced_clients",
  USE_GOOGLE_CALENDAR_CLIENT_WRAPPER = "use_google_calendar_client_wrapper",
  USE_ENHANCED_SUPABASE_CLIENT = "use_enhanced_supabase_client",

  // Middleware flags
  USE_RETRY_MIDDLEWARE = "use_retry_middleware",
  USE_RATE_LIMITER = "use_rate_limiter",

  // Migration flags
  MIGRATION_MODE = "migration_mode",
  ALLOW_PARALLEL_EXECUTION = "allow_parallel_execution",
}

export class FeatureFlagService {
  private config: FeatureFlagConfig;

  constructor(config?: FeatureFlagConfig) {
    this.config = config || this.getDefaultConfig();
  }

  /**
   * Check if a feature is enabled
   */
  isEnabled(flagName: FeatureFlags | string, userId?: string): boolean {
    const flag = this.config.flags[flagName];

    if (!flag) {
      // If flag doesn't exist, default to disabled for safety
      return false;
    }

    // Check if explicitly disabled for user
    if (userId && flag.disabledForUsers?.includes(userId)) {
      return false;
    }

    // Check if explicitly enabled for user
    if (userId && flag.enabledForUsers?.includes(userId)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined && userId) {
      const userHash = this.hashUserId(userId);
      const isInRollout = userHash < flag.rolloutPercentage;
      return flag.enabled && isInRollout;
    }

    return flag.enabled;
  }

  /**
   * Enable a feature flag
   */
  enable(flagName: FeatureFlags | string, rolloutPercentage?: number): void {
    if (!this.config.flags[flagName]) {
      this.config.flags[flagName] = {
        name: flagName,
        enabled: true,
        rolloutPercentage,
      };
    } else {
      this.config.flags[flagName].enabled = true;
      if (rolloutPercentage !== undefined) {
        this.config.flags[flagName].rolloutPercentage = rolloutPercentage;
      }
    }
  }

  /**
   * Disable a feature flag
   */
  disable(flagName: FeatureFlags | string): void {
    if (this.config.flags[flagName]) {
      this.config.flags[flagName].enabled = false;
    }
  }

  /**
   * Set rollout percentage for gradual rollout
   */
  setRolloutPercentage(flagName: FeatureFlags | string, percentage: number): void {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Rollout percentage must be between 0 and 100");
    }

    if (this.config.flags[flagName]) {
      this.config.flags[flagName].rolloutPercentage = percentage;
    }
  }

  /**
   * Enable feature for specific users
   */
  enableForUsers(flagName: FeatureFlags | string, userIds: string[]): void {
    if (!this.config.flags[flagName]) {
      this.config.flags[flagName] = {
        name: flagName,
        enabled: true,
        enabledForUsers: userIds,
      };
    } else {
      this.config.flags[flagName].enabledForUsers = [
        ...(this.config.flags[flagName].enabledForUsers || []),
        ...userIds,
      ];
    }
  }

  /**
   * Disable feature for specific users
   */
  disableForUsers(flagName: FeatureFlags | string, userIds: string[]): void {
    if (this.config.flags[flagName]) {
      this.config.flags[flagName].disabledForUsers = [
        ...(this.config.flags[flagName].disabledForUsers || []),
        ...userIds,
      ];
    }
  }

  /**
   * Get all feature flags
   */
  getAllFlags(): Record<string, FeatureFlag> {
    return { ...this.config.flags };
  }

  /**
   * Get a specific flag
   */
  getFlag(flagName: FeatureFlags | string): FeatureFlag | undefined {
    return this.config.flags[flagName];
  }

  /**
   * Update flag metadata
   */
  setMetadata(flagName: FeatureFlags | string, metadata: Record<string, unknown>): void {
    if (this.config.flags[flagName]) {
      this.config.flags[flagName].metadata = {
        ...this.config.flags[flagName].metadata,
        ...metadata,
      };
    }
  }

  /**
   * Hash user ID for consistent rollout percentages
   * Uses simple hash function for demonstration
   */
  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash % 100);
  }

  /**
   * Default configuration for feature flags
   */
  private getDefaultConfig(): FeatureFlagConfig {
    return {
      flags: {
        // Repository pattern - disabled by default for gradual migration
        [FeatureFlags.USE_REPOSITORY_PATTERN]: {
          name: FeatureFlags.USE_REPOSITORY_PATTERN,
          enabled: false,
          rolloutPercentage: 0,
          metadata: {
            description: "Enable repository pattern for data access",
            migrationPhase: 1,
          },
        },
        [FeatureFlags.USE_EVENT_REPOSITORY]: {
          name: FeatureFlags.USE_EVENT_REPOSITORY,
          enabled: false,
          rolloutPercentage: 0,
        },
        [FeatureFlags.USE_CALENDAR_REPOSITORY]: {
          name: FeatureFlags.USE_CALENDAR_REPOSITORY,
          enabled: false,
          rolloutPercentage: 0,
        },
        [FeatureFlags.USE_USER_REPOSITORY]: {
          name: FeatureFlags.USE_USER_REPOSITORY,
          enabled: false,
          rolloutPercentage: 0,
        },

        // Service layer - disabled by default
        [FeatureFlags.USE_SERVICE_LAYER]: {
          name: FeatureFlags.USE_SERVICE_LAYER,
          enabled: false,
          rolloutPercentage: 0,
          metadata: {
            description: "Enable service layer for business logic",
            migrationPhase: 2,
          },
        },
        [FeatureFlags.USE_EVENT_SERVICE]: {
          name: FeatureFlags.USE_EVENT_SERVICE,
          enabled: false,
          rolloutPercentage: 0,
        },
        [FeatureFlags.USE_CALENDAR_SERVICE]: {
          name: FeatureFlags.USE_CALENDAR_SERVICE,
          enabled: false,
          rolloutPercentage: 0,
        },

        // Enhanced API clients - disabled by default
        [FeatureFlags.USE_ENHANCED_CLIENTS]: {
          name: FeatureFlags.USE_ENHANCED_CLIENTS,
          enabled: false,
          rolloutPercentage: 0,
          metadata: {
            description: "Enable enhanced API clients with resilience patterns",
            migrationPhase: 3,
          },
        },
        [FeatureFlags.USE_GOOGLE_CALENDAR_CLIENT_WRAPPER]: {
          name: FeatureFlags.USE_GOOGLE_CALENDAR_CLIENT_WRAPPER,
          enabled: false,
          rolloutPercentage: 0,
        },
        [FeatureFlags.USE_ENHANCED_SUPABASE_CLIENT]: {
          name: FeatureFlags.USE_ENHANCED_SUPABASE_CLIENT,
          enabled: false,
          rolloutPercentage: 0,
        },

        // Middleware - can be enabled independently
        [FeatureFlags.USE_RETRY_MIDDLEWARE]: {
          name: FeatureFlags.USE_RETRY_MIDDLEWARE,
          enabled: true, // Safe to enable as it only improves reliability
          rolloutPercentage: 100,
        },
        [FeatureFlags.USE_RATE_LIMITER]: {
          name: FeatureFlags.USE_RATE_LIMITER,
          enabled: true, // Safe to enable as it only improves reliability
          rolloutPercentage: 100,
        },

        // Migration control
        [FeatureFlags.MIGRATION_MODE]: {
          name: FeatureFlags.MIGRATION_MODE,
          enabled: false,
          metadata: {
            description: "Enable migration mode for parallel execution of old and new code",
          },
        },
        [FeatureFlags.ALLOW_PARALLEL_EXECUTION]: {
          name: FeatureFlags.ALLOW_PARALLEL_EXECUTION,
          enabled: false,
          metadata: {
            description: "Allow parallel execution of old and new implementations for comparison",
          },
        },
      },
    };
  }
}

// Singleton instance
let featureFlagServiceInstance: FeatureFlagService | null = null;

export function getFeatureFlagService(): FeatureFlagService {
  if (!featureFlagServiceInstance) {
    featureFlagServiceInstance = new FeatureFlagService();
  }
  return featureFlagServiceInstance;
}

export function initializeFeatureFlagService(config?: FeatureFlagConfig): FeatureFlagService {
  featureFlagServiceInstance = new FeatureFlagService(config);
  return featureFlagServiceInstance;
}
