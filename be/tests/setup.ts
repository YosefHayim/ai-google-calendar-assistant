import { jest } from "@jest/globals";

// Global test setup
beforeAll(() => {
  // Suppress console logs during tests unless TEST_DEBUG is set
  if (!process.env.TEST_DEBUG) {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "info").mockImplementation(() => {});
  }
});

afterAll(() => {
  jest.restoreAllMocks();
});

// Increase timeout for integration-like tests
jest.setTimeout(10000);
