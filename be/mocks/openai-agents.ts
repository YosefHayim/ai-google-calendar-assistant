import { jest } from "@jest/globals";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFn = (...args: any[]) => any;

/**
 * Mock OpenAI Agent responses and configurations
 */

export type MockAgentMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type MockAgentToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type MockAgentResponse = {
  id: string;
  object: "thread.run";
  created_at: number;
  status: "completed" | "requires_action" | "failed" | "in_progress";
  model: string;
  instructions?: string;
  tools?: any[];
  metadata?: Record<string, any>;
  messages?: MockAgentMessage[];
  toolCalls?: MockAgentToolCall[];
  response?: string;
};

/**
 * Mock agent configuration
 */
export type MockAgentConfig = {
  name: string;
  instructions?: string;
  model?: string;
  modelSettings?: {
    toolChoice?: "auto" | "required" | "none";
    parallelToolCalls?: boolean;
  };
  handoffDescription?: string;
  tools?: any[];
};

/**
 * Default successful agent response
 */
export const createMockAgentResponse = (overrides: Partial<MockAgentResponse> = {}): MockAgentResponse => ({
  id: `run_${Date.now()}`,
  object: "thread.run",
  created_at: Date.now(),
  status: "completed",
  model: "gpt-4",
  messages: [
    {
      role: "assistant",
      content: "Task completed successfully",
    },
  ],
  response: "Task completed successfully",
  ...overrides,
});

/**
 * Mock agent responses for different scenarios
 */
export const mockAgentResponses = {
  success: createMockAgentResponse({
    status: "completed",
    response: "Operation completed successfully",
  }),
  requiresAction: createMockAgentResponse({
    status: "requires_action",
    response: "Additional action required",
    toolCalls: [
      {
        id: "call_1",
        type: "function",
        function: {
          name: "validate_user",
          arguments: JSON.stringify({ email: "test@example.com" }),
        },
      },
    ],
  }),
  failed: createMockAgentResponse({
    status: "failed",
    response: "Operation failed",
  }),
  inProgress: createMockAgentResponse({
    status: "in_progress",
    response: "Processing...",
  }),
};

/**
 * Mock event-related agent responses
 */
export const mockEventAgentResponses = {
  insertEventSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      eventId: "mock-event-123",
      summary: "Team Meeting",
      start: "2024-01-15T10:00:00Z",
      end: "2024-01-15T11:00:00Z",
    }),
  }),
  getEventSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      id: "mock-event-123",
      summary: "Team Meeting",
      description: "Weekly team sync",
      start: { dateTime: "2024-01-15T10:00:00Z" },
      end: { dateTime: "2024-01-15T11:00:00Z" },
    }),
  }),
  updateEventSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      id: "mock-event-123",
      summary: "Updated Team Meeting",
      updated: new Date().toISOString(),
    }),
  }),
  deleteEventSuccess: createMockAgentResponse({
    status: "completed",
    response: "Event deleted successfully",
  }),
  validateEventFieldsSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      isValid: true,
      normalizedEvent: {
        summary: "Team Meeting",
        start: "2024-01-15T10:00:00Z",
        end: "2024-01-15T11:00:00Z",
      },
    }),
  }),
  analyzeCalendarTypeSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      calendarType: "work",
      confidence: 0.95,
      reasoning: "Event contains work-related keywords",
    }),
  }),
};

/**
 * Mock user/auth-related agent responses
 */
export const mockAuthAgentResponses = {
  validateUserSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      isValid: true,
      user: {
        id: "test-user-id",
        email: "test@example.com",
        hasValidTokens: true,
      },
    }),
  }),
  validateUserFailed: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      isValid: false,
      error: "User not found or tokens expired",
    }),
  }),
  registerUserSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      userId: "new-user-123",
      email: "newuser@example.com",
      registered: true,
    }),
  }),
  generateAuthUrlSuccess: createMockAgentResponse({
    status: "completed",
    response: JSON.stringify({
      authUrl: "https://accounts.google.com/o/oauth2/v2/auth?mock=true",
    }),
  }),
};

/**
 * Mock Agent class
 */
export class MockAgent {
  public name: string;
  public instructions?: string;
  public model?: string;
  public modelSettings?: MockAgentConfig["modelSettings"];
  public handoffDescription?: string;
  public tools?: any[];
  private mockResponse: MockAgentResponse;

  constructor(config: MockAgentConfig) {
    this.name = config.name;
    this.instructions = config.instructions;
    this.model = config.model || "gpt-4";
    this.modelSettings = config.modelSettings;
    this.handoffDescription = config.handoffDescription;
    this.tools = config.tools;
    this.mockResponse = mockAgentResponses.success;
  }

  /**
   * Set custom mock response for this agent
   */
  setMockResponse(response: MockAgentResponse) {
    this.mockResponse = response;
  }

  /**
   * Mock run method (primary agent execution method)
   */
  async run(params: { messages?: MockAgentMessage[]; input?: string }): Promise<MockAgentResponse> {
    return Promise.resolve(this.mockResponse);
  }

  /**
   * Mock invoke method (alternative execution method)
   */
  async invoke(params: { messages?: MockAgentMessage[]; input?: string }): Promise<MockAgentResponse> {
    return this.run(params);
  }

  /**
   * Mock streaming method
   */
  async *stream(params: { messages?: MockAgentMessage[]; input?: string }): AsyncGenerator<Partial<MockAgentResponse>> {
    yield { status: "in_progress" };
    yield { status: "in_progress", response: "Processing..." };
    yield this.mockResponse;
  }
}

/**
 * Create a mock agent with predefined response
 */
export const createMockAgent = (config: MockAgentConfig, mockResponse?: MockAgentResponse): MockAgent => {
  const agent = new MockAgent(config);
  if (mockResponse) {
    agent.setMockResponse(mockResponse);
  }
  return agent;
};

/**
 * Factory for creating agents with specific behaviors
 */
export const mockAgentFactory = {
  /**
   * Create an agent that always succeeds
   */
  createSuccessAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockAgentResponses.success);
  },

  /**
   * Create an agent that always fails
   */
  createFailureAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockAgentResponses.failed);
  },

  /**
   * Create an agent that requires action
   */
  createRequiresActionAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockAgentResponses.requiresAction);
  },

  /**
   * Create an event insertion agent
   */
  createInsertEventAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.insertEventSuccess);
  },

  /**
   * Create an event retrieval agent
   */
  createGetEventAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.getEventSuccess);
  },

  /**
   * Create an event update agent
   */
  createUpdateEventAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.updateEventSuccess);
  },

  /**
   * Create an event deletion agent
   */
  createDeleteEventAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.deleteEventSuccess);
  },

  /**
   * Create a user validation agent
   */
  createValidateUserAgent: (config: MockAgentConfig, shouldSucceed = true) => {
    return createMockAgent(
      config,
      shouldSucceed ? mockAuthAgentResponses.validateUserSuccess : mockAuthAgentResponses.validateUserFailed,
    );
  },

  /**
   * Create a user registration agent
   */
  createRegisterUserAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockAuthAgentResponses.registerUserSuccess);
  },

  /**
   * Create an auth URL generation agent
   */
  createGenerateAuthUrlAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockAuthAgentResponses.generateAuthUrlSuccess);
  },

  /**
   * Create a calendar type analysis agent
   */
  createAnalyzeCalendarTypeAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.analyzeCalendarTypeSuccess);
  },

  /**
   * Create an event fields validation agent
   */
  createValidateEventFieldsAgent: (config: MockAgentConfig) => {
    return createMockAgent(config, mockEventAgentResponses.validateEventFieldsSuccess);
  },
};

/**
 * Mock error scenarios
 */
export const mockAgentErrors = {
  timeout: new Error("Agent execution timed out"),
  rateLimitExceeded: new Error("Rate limit exceeded"),
  invalidInput: new Error("Invalid input provided to agent"),
  modelUnavailable: new Error("Model is currently unavailable"),
  authenticationFailed: new Error("Authentication failed"),
};

/**
 * Helper to create a mock agent error
 */
export const createMockAgentError = (errorType: keyof typeof mockAgentErrors) => {
  return mockAgentErrors[errorType];
};

/**
 * Mock tools for testing tool calls
 */
export const mockAgentTools = {
  validateUser: jest.fn<AnyFn>(),
  registerUser: jest.fn<AnyFn>(),
  insertEvent: jest.fn<AnyFn>(),
  getEvent: jest.fn<AnyFn>(),
  updateEvent: jest.fn<AnyFn>(),
  deleteEvent: jest.fn<AnyFn>(),
  analyzeCalendarType: jest.fn<AnyFn>(),
  validateEventFields: jest.fn<AnyFn>(),
  generateAuthUrl: jest.fn<AnyFn>(),
  getUserTimeZone: jest.fn<AnyFn>(),
};

/**
 * Reset all mock tools
 */
export const resetMockAgentTools = () => {
  Object.values(mockAgentTools).forEach((tool) => {
    if (typeof tool.mockClear === "function") {
      tool.mockClear();
    }
  });
};

/**
 * Mock Agent class for Jest mocking
 */
export const Agent = jest.fn<AnyFn>().mockImplementation((config: MockAgentConfig) => {
  return new MockAgent(config);
});
