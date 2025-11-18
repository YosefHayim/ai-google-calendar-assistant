/**
 * Simple logger utility for service operations
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  /**
   * Logs informational messages
   */
  info(message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [INFO] [${this.context}] ${message}`, meta || "");
  }

  /**
   * Logs error messages
   */
  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [ERROR] [${this.context}] ${message}`, {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name,
      } : error,
      ...meta,
    });
  }

  /**
   * Logs warning messages
   */
  warn(message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] [WARN] [${this.context}] ${message}`, meta || "");
  }

  /**
   * Logs debug messages
   */
  debug(message: string, meta?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[${timestamp}] [DEBUG] [${this.context}] ${message}`, meta || "");
    }
  }
}
