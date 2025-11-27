import { Logger } from "@/services/logging/Logger";

/**
 * Metric types for monitoring
 */
export enum MetricType {
  COUNTER = "counter",
  GAUGE = "gauge",
  HISTOGRAM = "histogram",
  TIMING = "timing",
}

/**
 * Metric data structure
 */
export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: number;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * Migration-specific metrics
 */
export enum MigrationMetrics {
  // Request metrics
  OLD_IMPL_REQUESTS = "migration.old_implementation.requests",
  NEW_IMPL_REQUESTS = "migration.new_implementation.requests",
  PARALLEL_REQUESTS = "migration.parallel_execution.requests",

  // Success metrics
  OLD_IMPL_SUCCESS = "migration.old_implementation.success",
  NEW_IMPL_SUCCESS = "migration.new_implementation.success",
  IMPLEMENTATION_MATCH = "migration.implementation_match",

  // Error metrics
  OLD_IMPL_ERRORS = "migration.old_implementation.errors",
  NEW_IMPL_ERRORS = "migration.new_implementation.errors",
  IMPLEMENTATION_MISMATCH = "migration.implementation_mismatch",

  // Performance metrics
  OLD_IMPL_LATENCY = "migration.old_implementation.latency_ms",
  NEW_IMPL_LATENCY = "migration.new_implementation.latency_ms",
  LATENCY_DIFFERENCE = "migration.latency_difference_ms",

  // Feature flag metrics
  FEATURE_FLAG_ENABLED = "migration.feature_flag.enabled",
  FEATURE_FLAG_DISABLED = "migration.feature_flag.disabled",
  ROLLOUT_PERCENTAGE = "migration.rollout_percentage",

  // Rollback metrics
  ROLLBACK_TRIGGERED = "migration.rollback.triggered",
  ROLLBACK_SUCCESS = "migration.rollback.success",
  ROLLBACK_FAILURE = "migration.rollback.failure",
}

/**
 * Metrics Service for monitoring migration and system performance
 */
export class MetricsService {
  private logger: Logger;
  private metrics: Map<string, Metric[]>;
  private metricsBuffer: Metric[];
  private readonly bufferSize: number;

  constructor(bufferSize: number = 1000) {
    this.logger = new Logger("MetricsService");
    this.metrics = new Map();
    this.metricsBuffer = [];
    this.bufferSize = bufferSize;
  }

  /**
   * Record a counter metric
   */
  incrementCounter(
    name: string,
    value: number = 1,
    tags?: Record<string, string>,
    metadata?: Record<string, unknown>
  ): void {
    const metric: Metric = {
      name,
      type: MetricType.COUNTER,
      value,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.recordMetric(metric);
  }

  /**
   * Record a gauge metric (current value)
   */
  recordGauge(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: Record<string, unknown>
  ): void {
    const metric: Metric = {
      name,
      type: MetricType.GAUGE,
      value,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.recordMetric(metric);
  }

  /**
   * Record a timing metric (duration in milliseconds)
   */
  recordTiming(
    name: string,
    durationMs: number,
    tags?: Record<string, string>,
    metadata?: Record<string, unknown>
  ): void {
    const metric: Metric = {
      name,
      type: MetricType.TIMING,
      value: durationMs,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.recordMetric(metric);
  }

  /**
   * Record a histogram metric (distribution of values)
   */
  recordHistogram(
    name: string,
    value: number,
    tags?: Record<string, string>,
    metadata?: Record<string, unknown>
  ): void {
    const metric: Metric = {
      name,
      type: MetricType.HISTOGRAM,
      value,
      timestamp: Date.now(),
      tags,
      metadata,
    };

    this.recordMetric(metric);
  }

  /**
   * Time a function execution
   */
  async time<T>(
    metricName: string,
    fn: () => Promise<T>,
    tags?: Record<string, string>
  ): Promise<T> {
    const startTime = Date.now();
    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      this.recordTiming(metricName, duration, tags);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.recordTiming(metricName, duration, {
        ...tags,
        error: "true",
      });
      throw error;
    }
  }

  /**
   * Compare old vs new implementation execution
   */
  async compareImplementations<T>(
    metricPrefix: string,
    oldImpl: () => Promise<T>,
    newImpl: () => Promise<T>,
    compareResults: (oldResult: T, newResult: T) => boolean
  ): Promise<{ result: T; match: boolean }> {
    let oldResult: T;
    let newResult: T;
    let oldError: Error | null = null;
    let newError: Error | null = null;

    // Execute old implementation
    const oldStartTime = Date.now();
    try {
      oldResult = await oldImpl();
      this.recordTiming(`${metricPrefix}.${MigrationMetrics.OLD_IMPL_LATENCY}`, Date.now() - oldStartTime);
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.OLD_IMPL_SUCCESS}`);
    } catch (error) {
      oldError = error as Error;
      this.recordTiming(`${metricPrefix}.${MigrationMetrics.OLD_IMPL_LATENCY}`, Date.now() - oldStartTime, {
        error: "true",
      });
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.OLD_IMPL_ERRORS}`);
      throw error; // Throw old implementation error for fallback
    }

    // Execute new implementation
    const newStartTime = Date.now();
    try {
      newResult = await newImpl();
      this.recordTiming(`${metricPrefix}.${MigrationMetrics.NEW_IMPL_LATENCY}`, Date.now() - newStartTime);
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.NEW_IMPL_SUCCESS}`);
    } catch (error) {
      newError = error as Error;
      this.recordTiming(`${metricPrefix}.${MigrationMetrics.NEW_IMPL_LATENCY}`, Date.now() - newStartTime, {
        error: "true",
      });
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.NEW_IMPL_ERRORS}`);

      // If old succeeded but new failed, log mismatch
      this.logger.warn("New implementation failed while old succeeded", {
        oldError: oldError?.message,
        newError: newError?.message,
      });

      return { result: oldResult!, match: false };
    }

    // Compare results
    const match = compareResults(oldResult!, newResult!);

    if (match) {
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.IMPLEMENTATION_MATCH}`);
    } else {
      this.incrementCounter(`${metricPrefix}.${MigrationMetrics.IMPLEMENTATION_MISMATCH}`);
      this.logger.warn("Implementation results mismatch", {
        oldResult: JSON.stringify(oldResult),
        newResult: JSON.stringify(newResult),
      });
    }

    // Record latency difference
    const latencyDiff = (Date.now() - newStartTime) - (Date.now() - oldStartTime);
    this.recordGauge(`${metricPrefix}.${MigrationMetrics.LATENCY_DIFFERENCE}`, latencyDiff);

    return { result: newResult!, match };
  }

  /**
   * Get metrics for a specific name
   */
  getMetrics(name: string): Metric[] {
    return this.metrics.get(name) || [];
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): Map<string, Metric[]> {
    return new Map(this.metrics);
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(name: string): {
    count: number;
    sum: number;
    avg: number;
    min: number;
    max: number;
  } | null {
    const metrics = this.getMetrics(name);

    if (metrics.length === 0) {
      return null;
    }

    const values = metrics.map((m) => m.value);
    const sum = values.reduce((acc, val) => acc + val, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return {
      count: values.length,
      sum,
      avg,
      min,
      max,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.metricsBuffer = [];
    this.logger.debug("Metrics cleared");
  }

  /**
   * Export metrics in JSON format
   */
  exportMetrics(): string {
    const allMetrics: Record<string, Metric[]> = {};

    this.metrics.forEach((value, key) => {
      allMetrics[key] = value;
    });

    return JSON.stringify(allMetrics, null, 2);
  }

  /**
   * Internal method to record a metric
   */
  private recordMetric(metric: Metric): void {
    // Add to metrics map
    if (!this.metrics.has(metric.name)) {
      this.metrics.set(metric.name, []);
    }
    this.metrics.get(metric.name)!.push(metric);

    // Add to buffer
    this.metricsBuffer.push(metric);

    // Trim buffer if needed
    if (this.metricsBuffer.length > this.bufferSize) {
      this.metricsBuffer.shift();
    }

    // Log metric in debug mode
    this.logger.debug(`Metric recorded: ${metric.name}`, {
      type: metric.type,
      value: metric.value,
      tags: metric.tags,
    });

    // Flush if needed (could be to external service)
    if (this.metricsBuffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Flush metrics to external service (placeholder)
   */
  private flush(): void {
    // In production, this would send metrics to a monitoring service
    // (e.g., Prometheus, Datadog, CloudWatch, etc.)
    this.logger.debug(`Flushing ${this.metricsBuffer.length} metrics`);

    // For now, just log summary
    const summary = this.getSummaryForFlush();
    this.logger.info("Metrics summary", summary);

    // Clear buffer after flush
    // this.metricsBuffer = [];
  }

  /**
   * Get summary for flush
   */
  private getSummaryForFlush(): Record<string, { count: number; total: number }> {
    const summary: Record<string, { count: number; total: number }> = {};

    this.metricsBuffer.forEach((metric) => {
      if (!summary[metric.name]) {
        summary[metric.name] = { count: 0, total: 0 };
      }
      summary[metric.name].count++;
      summary[metric.name].total += metric.value;
    });

    return summary;
  }
}

// Singleton instance
let metricsServiceInstance: MetricsService | null = null;

export function getMetricsService(): MetricsService {
  if (!metricsServiceInstance) {
    metricsServiceInstance = new MetricsService();
  }
  return metricsServiceInstance;
}

export function initializeMetricsService(bufferSize?: number): MetricsService {
  metricsServiceInstance = new MetricsService(bufferSize);
  return metricsServiceInstance;
}
