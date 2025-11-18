// Jest setup file for global test configuration
import { jest } from "@jest/globals";

// Mock environment variables
process.env.NODE_ENV = "test";
process.env.SUPABASE_URL = "https://test.supabase.co";
process.env.SUPABASE_KEY = "test-key";
process.env.JWT_SECRET = "test-secret";
process.env.GOOGLE_CLIENT_ID = "test-client-id";
process.env.GOOGLE_CLIENT_SECRET = "test-client-secret";
process.env.GOOGLE_REDIRECT_URI = "http://localhost:3000/callback";
process.env.OPENAI_API_KEY = "test-openai-key";
process.env.TELEGRAM_BOT_TOKEN = "test-telegram-token";
process.env.STRIPE_SECRET_KEY = "test-stripe-key";

// Global test timeout
jest.setTimeout(10000);

// Mock console methods to reduce noise in tests (optional)
global.console = {
  ...console,
  // Uncomment to suppress console output in tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};
