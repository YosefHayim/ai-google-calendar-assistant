import type { SupabaseClient } from "@supabase/supabase-js";
import { RetryMiddleware } from "../middleware/retry.middleware";
import { RateLimiter } from "../middleware/rate-limiter.middleware";
import { Logger } from "@/services/logging/Logger";

/**
 * Enhanced Supabase client with resilience patterns
 */
export class EnhancedSupabaseClient {
  private client: SupabaseClient;
  private retryMiddleware: RetryMiddleware;
  private rateLimiter: RateLimiter;
  private logger: Logger;

  constructor(client: SupabaseClient) {
    this.client = client;
    this.retryMiddleware = new RetryMiddleware({
      maxAttempts: 3,
      delayMs: 500,
      backoffMultiplier: 2,
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 200,
      windowMs: 60000, // 200 requests per minute
    });
    this.logger = new Logger("EnhancedSupabaseClient");
  }

  /**
   * Get auth methods with resilience
   */
  get auth() {
    return this.wrapAuth(this.client.auth);
  }

  /**
   * Access a table with resilience
   */
  from<T = unknown>(table: string) {
    return this.wrapQueryBuilder(this.client.from<T>(table), `from.${table}`);
  }

  /**
   * Wraps auth methods with retry and rate limiting
   */
  private wrapAuth(auth: SupabaseClient["auth"]) {
    const self = this;

    return {
      signUp: async (credentials: Parameters<typeof auth.signUp>[0]) => {
        return await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug("Executing auth.signUp");
              const result = await auth.signUp(credentials);
              self.logger.debug("auth.signUp completed successfully");
              return result;
            }, "auth.signUp"),
          "auth.signUp"
        );
      },

      signInWithPassword: async (credentials: Parameters<typeof auth.signInWithPassword>[0]) => {
        return await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug("Executing auth.signInWithPassword");
              const result = await auth.signInWithPassword(credentials);
              self.logger.debug("auth.signInWithPassword completed successfully");
              return result;
            }, "auth.signInWithPassword"),
          "auth.signInWithPassword"
        );
      },

      verifyOtp: async (params: Parameters<typeof auth.verifyOtp>[0]) => {
        return await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug("Executing auth.verifyOtp");
              const result = await auth.verifyOtp(params);
              self.logger.debug("auth.verifyOtp completed successfully");
              return result;
            }, "auth.verifyOtp"),
          "auth.verifyOtp"
        );
      },

      // Expose other auth methods directly
      getSession: auth.getSession.bind(auth),
      getUser: auth.getUser.bind(auth),
      signOut: auth.signOut.bind(auth),
      onAuthStateChange: auth.onAuthStateChange.bind(auth),
    };
  }

  /**
   * Wraps query builder methods with retry and rate limiting
   */
  private wrapQueryBuilder<T>(builder: ReturnType<SupabaseClient["from"]>, context: string) {
    const self = this;

    return {
      select: (query?: string) => {
        const newBuilder = builder.select(query);
        return self.wrapQueryExecutor(newBuilder, `${context}.select`);
      },

      insert: (values: T | T[]) => {
        const newBuilder = builder.insert(values);
        return self.wrapQueryExecutor(newBuilder, `${context}.insert`);
      },

      update: (values: Partial<T>) => {
        const newBuilder = builder.update(values);
        return self.wrapQueryExecutor(newBuilder, `${context}.update`);
      },

      delete: () => {
        const newBuilder = builder.delete();
        return self.wrapQueryExecutor(newBuilder, `${context}.delete`);
      },

      upsert: (values: T | T[]) => {
        const newBuilder = builder.upsert(values);
        return self.wrapQueryExecutor(newBuilder, `${context}.upsert`);
      },
    };
  }

  /**
   * Wraps query executor methods
   */
  private wrapQueryExecutor<T>(builder: unknown, context: string) {
    const self = this;
    const anyBuilder = builder as {
      eq: (column: string, value: unknown) => unknown;
      neq: (column: string, value: unknown) => unknown;
      gt: (column: string, value: unknown) => unknown;
      gte: (column: string, value: unknown) => unknown;
      lt: (column: string, value: unknown) => unknown;
      lte: (column: string, value: unknown) => unknown;
      like: (column: string, pattern: string) => unknown;
      ilike: (column: string, pattern: string) => unknown;
      is: (column: string, value: unknown) => unknown;
      in: (column: string, values: unknown[]) => unknown;
      contains: (column: string, value: unknown) => unknown;
      order: (column: string, options?: { ascending?: boolean }) => unknown;
      limit: (count: number) => unknown;
      range: (from: number, to: number) => unknown;
      single: () => Promise<{ data: T | null; error: unknown }>;
      maybeSingle: () => Promise<{ data: T | null; error: unknown }>;
      then: (onfulfilled?: (value: { data: T[] | null; error: unknown }) => unknown) => Promise<unknown>;
    };

    const chainMethod = (methodName: string, method: (...args: unknown[]) => unknown) => {
      return (...args: unknown[]) => {
        const newBuilder = method.apply(anyBuilder, args);
        return self.wrapQueryExecutor(newBuilder, `${context}.${methodName}`);
      };
    };

    return {
      eq: chainMethod("eq", anyBuilder.eq),
      neq: chainMethod("neq", anyBuilder.neq),
      gt: chainMethod("gt", anyBuilder.gt),
      gte: chainMethod("gte", anyBuilder.gte),
      lt: chainMethod("lt", anyBuilder.lt),
      lte: chainMethod("lte", anyBuilder.lte),
      like: chainMethod("like", anyBuilder.like),
      ilike: chainMethod("ilike", anyBuilder.ilike),
      is: chainMethod("is", anyBuilder.is),
      in: chainMethod("in", anyBuilder.in),
      contains: chainMethod("contains", anyBuilder.contains),
      order: chainMethod("order", anyBuilder.order),
      limit: chainMethod("limit", anyBuilder.limit),
      range: chainMethod("range", anyBuilder.range),

      single: async () => {
        return await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug(`Executing ${context}.single`);
              const result = await anyBuilder.single();
              self.logger.debug(`${context}.single completed successfully`);
              return result;
            }, `${context}.single`),
          `${context}.single`
        );
      },

      maybeSingle: async () => {
        return await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug(`Executing ${context}.maybeSingle`);
              const result = await anyBuilder.maybeSingle();
              self.logger.debug(`${context}.maybeSingle completed successfully`);
              return result;
            }, `${context}.maybeSingle`),
          `${context}.maybeSingle`
        );
      },

      then: async (onfulfilled?: (value: { data: T[] | null; error: unknown }) => unknown) => {
        const result = await self.rateLimiter.execute(
          () =>
            self.retryMiddleware.execute(async () => {
              self.logger.debug(`Executing ${context}`);
              const res = await anyBuilder.then();
              self.logger.debug(`${context} completed successfully`);
              return res;
            }, context),
          context
        );

        if (onfulfilled) {
          return onfulfilled(result as { data: T[] | null; error: unknown });
        }

        return result;
      },
    };
  }

  /**
   * Get the underlying Supabase client (for advanced use)
   */
  getClient(): SupabaseClient {
    return this.client;
  }
}
