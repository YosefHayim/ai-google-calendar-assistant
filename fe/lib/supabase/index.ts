/**
 * Supabase Module Exports
 * Central export point for all Supabase-related functionality
 */

// Client exports (for 'use client' components)
export { createClient as createBrowserClient } from "./client";

// Server exports (for Server Components and Route Handlers)
export { createClient as createServerClient } from "./server";

// Config and utilities
export * from "./config";
export * from "./auth";
export type { Database } from "./database.types";
