/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  transformIgnorePatterns: [
    "/node_modules/(?!(lodash-es)/)",
  ],
  collectCoverageFrom: [
    "services/**/*.ts",
    "controllers/**/*.ts",
    "middlewares/**/*.ts",
    "ai-agents/**/*.ts",
    "utils/**/*.ts",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  clearMocks: true,
  resetMocks: true,
  verbose: true,
};
